<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { supabase } from '../supabase'
import { showToast } from '../utils/toast'
import { 
  Search, Layers, Loader2, Heart, X, User, MessageCircle, Send, CornerDownRight, AlertTriangle 
} from 'lucide-vue-next'

const tcgItems = ref([])
const cargando = ref(true)
const busqueda = ref('') 
const orden = ref('recientes')
const misFavoritosIds = ref([])

const cartaSeleccionada = ref(null)
const vendedorSeleccionado = ref(null)
const currentUser = ref(null)
const preguntas = ref([])
const nuevaPregunta = ref('')
const enviandoPregunta = ref(false)
const respuestasPendientes = ref({})
let canalRealtime = null

const cargarPreguntas = async (itemId) => {
  const { data } = await supabase.from('preguntas').select('*').eq('item_id', itemId).eq('tipo_item', 'tcg').order('created_at', { ascending: true })
  if (data && data.length > 0) {
    const userIds = [...new Set(data.map(p => p.remitente_id))]
    const { data: perfiles } = await supabase.from('perfiles').select('id, username').in('id', userIds)
    const map = {}; if(perfiles) perfiles.forEach(p => map[p.id] = p.username)
    preguntas.value = data.map(p => ({ ...p, remitente_nombre: map[p.remitente_id] || 'Usuario' }))
  } else { preguntas.value = [] }
}

const abrirDetalle = async (carta) => {
  cartaSeleccionada.value = carta
  vendedorSeleccionado.value = null
  preguntas.value = []

  const { data: { session } } = await supabase.auth.getSession()
  currentUser.value = session ? session.user : null

  if (carta.user_id) {
    const { data } = await supabase.from('perfiles').select('username, ciudad').eq('id', carta.user_id).single()
    if (data) vendedorSeleccionado.value = data
  }
  await cargarPreguntas(carta.id)

  canalRealtime = supabase.channel('preguntas_tcg')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'preguntas', filter: `item_id=eq.${carta.id}` }, () => {
      cargarPreguntas(carta.id)
    }).subscribe()
}

const cerrarDetalle = () => { 
  cartaSeleccionada.value = null 
  if (canalRealtime) { supabase.removeChannel(canalRealtime); canalRealtime = null }
}

onUnmounted(() => { if (canalRealtime) supabase.removeChannel(canalRealtime) })

const formatearPrecio = (precio) => new Intl.NumberFormat('es-CL').format(precio)

const cargarFavoritos = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { data } = await supabase.from('favoritos').select('item_id').eq('user_id', session.user.id).eq('tipo', 'TCG')
    if (data) misFavoritosIds.value = data.map(f => f.item_id)
  }
}

onMounted(async () => {
  try {
    const { data } = await supabase.from('tcg_exchange').select('*').order('id', { ascending: false })
    if (data) tcgItems.value = data
    await cargarFavoritos()
  } catch (error) { console.error(error) } finally { cargando.value = false }
})

const cartasFiltradas = computed(() => {
  let resultado = tcgItems.value.filter(c => c.titulo.toLowerCase().includes(busqueda.value.toLowerCase()) || c.juego.toLowerCase().includes(busqueda.value.toLowerCase()))
  if (orden.value === 'menor') resultado.sort((a, b) => a.precio - b.precio)
  else if (orden.value === 'mayor') resultado.sort((a, b) => b.precio - a.precio)
  else resultado.sort((a, b) => b.id - a.id)
  return resultado
})

const toggleFavorito = async (carta) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return showToast('Inicia sesión para favoritos', 'info')
  if (misFavoritosIds.value.includes(carta.id)) {
    await supabase.from('favoritos').delete().eq('item_id', carta.id).eq('user_id', session.user.id).eq('tipo', 'TCG')
    misFavoritosIds.value = misFavoritosIds.value.filter(id => id !== carta.id)
    showToast('Eliminado de favoritos', 'info')
  } else {
    await supabase.from('favoritos').insert({ user_id: session.user.id, item_id: carta.id, tipo: 'TCG', titulo: carta.titulo, imagen_url: carta.imagen_url, precio: carta.precio })
    misFavoritosIds.value.push(carta.id)
    showToast('Guardado en favoritos', 'success')
  }
}

const enviarPregunta = async () => {
  if(!nuevaPregunta.value.trim() || !currentUser.value) return
  enviandoPregunta.value = true
  try {
    const { error } = await supabase.from('preguntas').insert({
      item_id: cartaSeleccionada.value.id, tipo_item: 'tcg',
      remitente_id: currentUser.value.id, vendedor_id: cartaSeleccionada.value.user_id,
      pregunta: nuevaPregunta.value
    })
    if (error) throw error
    nuevaPregunta.value = ''
    showToast('Pregunta enviada', 'success')
  } catch (e) { showToast(e.message, 'error') } finally { enviandoPregunta.value = false }
}

const enviarRespuesta = async (preguntaId) => {
  const texto = respuestasPendientes.value[preguntaId]
  if (!texto || !texto.trim()) return
  try {
    const { error } = await supabase.from('preguntas').update({ respuesta: texto }).eq('id', preguntaId)
    if (error) throw error
    respuestasPendientes.value[preguntaId] = ''
    showToast('Respuesta publicada', 'success')
  } catch(e) { showToast(e.message, 'error') }
}
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
      <h2 class="text-3xl font-black italic text-sky-400 flex items-center gap-3 mb-6 uppercase"><Layers class="w-8 h-8" /> Mercado TCG</h2>
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="Buscar carta o juego..." class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 outline-none">
        </div>
        <select v-model="orden" class="bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold outline-none appearance-none"><option value="recientes">Recientes</option><option value="menor">Precio Bajo</option><option value="mayor">Precio Alto</option></select>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12"><Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" /></div>
    <div v-else-if="cartasFiltradas.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      <div v-for="card in cartasFiltradas" :key="card.id" @click="abrirDetalle(card)" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 transition-all cursor-pointer relative group" :class="card.estado === 'vendido' ? 'opacity-60 grayscale' : 'hover:border-sky-500'">
        
        <div class="absolute top-4 right-4 z-20 pointer-events-none">
          <span v-if="card.estado === 'reservado'" class="bg-yellow-500 text-slate-900 text-[9px] font-black px-2 py-1 rounded uppercase shadow-lg">Reservado</span>
          <span v-else-if="card.estado === 'vendido'" class="bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded uppercase shadow-lg">Vendido</span>
        </div>

        <button @click.stop="toggleFavorito(card)" class="absolute top-4 left-4 z-10 p-2 rounded-xl backdrop-blur-md border border-slate-700" :class="misFavoritosIds.includes(card.id) ? 'bg-pink-600 text-white' : 'bg-slate-950/80 text-slate-400'"><Heart class="w-4 h-4" :fill="misFavoritosIds.includes(card.id) ? 'currentColor' : 'none'" /></button>
        <div class="h-44 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${card.imagen_url})` }"></div>
        <h4 class="font-bold text-sm text-white truncate">{{ card.titulo }}</h4>
        <div class="flex justify-between items-center mt-2 mb-1">
            <span class="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-bold">{{ card.juego }}</span>
            <p class="text-xs text-green-400 font-black" :class="card.estado === 'vendido' ? 'line-through text-slate-500' : ''">${{ formatearPrecio(card.precio) }}</p>
        </div>
      </div>
    </div>

    <div v-if="cartaSeleccionada" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row">
        <button @click="cerrarDetalle" class="absolute top-4 right-4 z-50 bg-slate-800 p-2 rounded-full text-white hover:bg-red-500 transition-colors"><X class="w-6 h-6" /></button>

        <div class="w-full md:w-1/2 p-6 bg-slate-950/50 flex items-center justify-center relative">
          <div v-if="cartaSeleccionada.estado === 'vendido'" class="absolute inset-0 z-10 bg-slate-950/40 flex items-center justify-center backdrop-blur-sm">
            <div class="bg-red-600 text-white text-3xl font-black px-6 py-2 rounded-xl border-4 border-red-900 -rotate-12 uppercase tracking-widest shadow-2xl">VENDIDO</div>
          </div>
          <img :src="cartaSeleccionada.imagen_url" class="max-w-full max-h-[60vh] object-contain rounded-2xl border border-slate-800 shadow-2xl" :class="{'grayscale opacity-50': cartaSeleccionada.estado === 'vendido'}">
        </div>

        <div class="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[90vh] custom-scrollbar">
          
          <div class="mb-8">
            <div class="flex gap-2 mb-4">
              <span class="text-xs font-black text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full">{{ cartaSeleccionada.juego }}</span>
              <span v-if="cartaSeleccionada.estado === 'reservado'" class="text-xs font-black text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full flex items-center gap-1"><AlertTriangle class="w-3 h-3"/> Reservado</span>
            </div>
            
            <h3 class="text-3xl font-black text-white mt-4 italic uppercase">{{ cartaSeleccionada.titulo }}</h3>
            <p class="text-3xl font-black text-green-400 mt-2" :class="{'line-through text-slate-500': cartaSeleccionada.estado === 'vendido'}">${{ formatearPrecio(cartaSeleccionada.precio) }}</p>
            <p class="text-slate-400 mt-4 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-800">{{ cartaSeleccionada.descripcion || 'Sin descripción.' }}</p>
            
            <div v-if="vendedorSeleccionado" class="mt-6 p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700"><User class="w-5 h-5 text-sky-400" /></div>
                <div>
                  <p class="text-[9px] font-black text-slate-500 uppercase">Propietario</p>
                  <p class="text-sm font-black text-white">{{ vendedorSeleccionado.username }}</p>
                </div>
              </div>
              <router-link :to="'/u/' + vendedorSeleccionado.username" class="bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all">Ver Perfil</router-link>
            </div>
            
            <a v-if="cartaSeleccionada.estado !== 'vendido'" :href="'https://wa.me/' + cartaSeleccionada.telefono" target="_blank" class="mt-4 block text-center bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest">Contactar por WhatsApp</a>
            <div v-else class="mt-4 bg-slate-800 text-slate-500 font-black py-4 rounded-xl text-center uppercase tracking-widest border border-slate-700">Artículo no disponible</div>
          </div>

          <div class="border-t border-slate-800 pt-6" v-if="cartaSeleccionada.estado !== 'vendido'">
            <h4 class="text-white font-black uppercase text-sm mb-4 flex items-center gap-2"><MessageCircle class="w-5 h-5 text-sky-400"/> Preguntas sobre esta carta</h4>
            
            <form v-if="currentUser && currentUser.id !== cartaSeleccionada.user_id" @submit.prevent="enviarPregunta" class="flex gap-2 mb-6">
              <input v-model="nuevaPregunta" type="text" placeholder="Escribe tu pregunta aquí..." class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 outline-none font-bold text-sm placeholder:text-slate-600">
              <button type="submit" :disabled="enviandoPregunta || !nuevaPregunta" class="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 rounded-xl transition-colors"><Send class="w-5 h-5" /></button>
            </form>
            <div v-else-if="!currentUser" class="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center mb-6">
              <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Inicia sesión para preguntar</p>
            </div>

            <div class="space-y-4">
              <div v-if="preguntas.length === 0" class="text-center py-6"><p class="text-slate-500 text-xs font-bold uppercase">Nadie ha preguntado aún.</p></div>
              <div v-for="preg in preguntas" :key="preg.id" class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <div><div class="flex items-center gap-2 mb-1"><User class="w-3 h-3 text-sky-400" /><span class="text-[10px] font-black uppercase text-sky-400">{{ preg.remitente_nombre }}</span></div><p class="text-sm text-slate-300 font-medium">{{ preg.pregunta }}</p></div>
                <div v-if="preg.respuesta" class="ml-4 pl-4 border-l-2 border-slate-700"><div class="flex items-center gap-2 mb-1"><CornerDownRight class="w-3 h-3 text-green-400" /><span class="text-[10px] font-black uppercase text-green-400">Propietario</span></div><p class="text-sm text-slate-400 font-medium italic">{{ preg.respuesta }}</p></div>
                <div v-else-if="currentUser && currentUser.id === cartaSeleccionada.user_id" class="ml-4 flex gap-2"><input v-model="respuestasPendientes[preg.id]" type="text" placeholder="Responder..." class="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg focus:border-green-500 outline-none text-xs font-bold"><button @click="enviarRespuesta(preg.id)" class="bg-green-600 hover:bg-green-500 text-white px-3 rounded-lg"><Send class="w-4 h-4"/></button></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }
</style>
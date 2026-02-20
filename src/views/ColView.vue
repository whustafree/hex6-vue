<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { 
  Search, Gem, Loader2, Heart, X, User, MessageCircle, Send, CornerDownRight 
} from 'lucide-vue-next'

const colItems = ref([])
const cargando = ref(true)
const busqueda = ref('') 
const categoriaFiltro = ref('Todas')
const orden = ref('recientes')
const misFavoritosIds = ref([])

// Lógica del Modal, Vendedor y Q&A
const itemSeleccionado = ref(null)
const fotoActiva = ref(0)
const vendedorSeleccionado = ref(null)

const currentUser = ref(null)
const preguntas = ref([])
const nuevaPregunta = ref('')
const enviandoPregunta = ref(false)
const respuestasPendientes = ref({}) // Guarda el texto que el vendedor está escribiendo

const cargarPreguntas = async (itemId) => {
  const { data } = await supabase.from('preguntas').select('*').eq('item_id', itemId).eq('tipo_item', 'vitrina').order('created_at', { ascending: true })
  if (data && data.length > 0) {
    const userIds = [...new Set(data.map(p => p.remitente_id))]
    const { data: perfiles } = await supabase.from('perfiles').select('id, username').in('id', userIds)
    const map = {}
    if(perfiles) perfiles.forEach(p => map[p.id] = p.username)
    preguntas.value = data.map(p => ({ ...p, remitente_nombre: map[p.remitente_id] || 'Usuario' }))
  } else {
    preguntas.value = []
  }
}

const abrirDetalle = async (item) => {
  itemSeleccionado.value = item
  fotoActiva.value = 0
  vendedorSeleccionado.value = null
  preguntas.value = []

  const { data: { session } } = await supabase.auth.getSession()
  currentUser.value = session ? session.user : null

  if (item.user_id) {
    const { data } = await supabase.from('perfiles').select('username, ciudad').eq('id', item.user_id).single()
    if (data) vendedorSeleccionado.value = data
  }

  await cargarPreguntas(item.id)
}

const cerrarDetalle = () => { itemSeleccionado.value = null }
const formatearPrecio = (precio) => new Intl.NumberFormat('es-CL').format(precio)

const cargarFavoritos = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { data } = await supabase.from('favoritos').select('item_id').eq('user_id', session.user.id).eq('tipo', 'Vitrina')
    if (data) misFavoritosIds.value = data.map(f => f.item_id)
  }
}

onMounted(async () => {
  try {
    const { data } = await supabase.from('colecciones').select('*').order('id', { ascending: false })
    if (data) colItems.value = data
    await cargarFavoritos()
  } catch (error) { console.error(error) } 
  finally { cargando.value = false }
})

const itemsFiltrados = computed(() => {
  let resultado = colItems.value.filter(item => {
    const coincideTexto = item.item_nombre.toLowerCase().includes(busqueda.value.toLowerCase())
    const coincideCategoria = categoriaFiltro.value === 'Todas' || item.categoria === categoriaFiltro.value
    return coincideTexto && coincideCategoria
  })
  if (orden.value === 'menor') resultado.sort((a, b) => a.precio - b.precio)
  else if (orden.value === 'mayor') resultado.sort((a, b) => b.precio - a.precio)
  else resultado.sort((a, b) => b.id - a.id)
  return resultado
})

const toggleFavorito = async (item) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return alert('Inicia sesión para favoritos')
  if (misFavoritosIds.value.includes(item.id)) {
    await supabase.from('favoritos').delete().eq('item_id', item.id).eq('user_id', session.user.id)
    misFavoritosIds.value = misFavoritosIds.value.filter(id => id !== item.id)
  } else {
    await supabase.from('favoritos').insert({ user_id: session.user.id, item_id: item.id, tipo: 'Vitrina', titulo: item.item_nombre, imagen_url: item.imagen_url, precio: item.precio })
    misFavoritosIds.value.push(item.id)
  }
}

const enviarPregunta = async () => {
  if(!nuevaPregunta.value.trim() || !currentUser.value) return
  enviandoPregunta.value = true
  try {
    const { error } = await supabase.from('preguntas').insert({
      item_id: itemSeleccionado.value.id, tipo_item: 'vitrina',
      remitente_id: currentUser.value.id, vendedor_id: itemSeleccionado.value.user_id,
      pregunta: nuevaPregunta.value
    })
    if (error) throw error
    nuevaPregunta.value = ''
    await cargarPreguntas(itemSeleccionado.value.id)
  } catch (e) { alert(e.message) } finally { enviandoPregunta.value = false }
}

const enviarRespuesta = async (preguntaId) => {
  const texto = respuestasPendientes.value[preguntaId]
  if (!texto || !texto.trim()) return
  try {
    const { error } = await supabase.from('preguntas').update({ respuesta: texto }).eq('id', preguntaId)
    if (error) throw error
    respuestasPendientes.value[preguntaId] = ''
    await cargarPreguntas(itemSeleccionado.value.id)
  } catch(e) { alert(e.message) }
}
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
      <h2 class="text-3xl font-black italic text-purple-400 flex items-center gap-3 mb-6 uppercase">
        <Gem class="w-8 h-8" /> Vitrina Geek
      </h2>
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="Buscar figura, consola..." class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-purple-500 outline-none font-bold">
        </div>
        <select v-model="categoriaFiltro" class="bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold outline-none appearance-none"><option value="Todas">Todas</option><option>Figuras</option><option>Consolas</option><option>Retro</option><option>Manga</option></select>
        <select v-model="orden" class="bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold outline-none appearance-none"><option value="recientes">Recientes</option><option value="menor">Precio Bajo</option><option value="mayor">Precio Alto</option></select>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12"><Loader2 class="w-10 h-10 animate-spin mx-auto text-purple-500" /></div>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in itemsFiltrados" :key="item.id" @click="abrirDetalle(item)" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-purple-500 transition-all cursor-pointer relative group">
        <button @click.stop="toggleFavorito(item)" class="absolute top-4 left-4 z-10 p-2 rounded-xl backdrop-blur-md border border-slate-700" :class="misFavoritosIds.includes(item.id) ? 'bg-pink-600 text-white' : 'bg-slate-950/80 text-slate-400'"><Heart class="w-4 h-4" :fill="misFavoritosIds.includes(item.id) ? 'currentColor' : 'none'" /></button>
        <div class="h-44 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
        <h4 class="font-bold text-sm text-white truncate">{{ item.item_nombre }}</h4>
        <p class="text-xs text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
      </div>
    </div>

    <div v-if="itemSeleccionado" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col md:flex-row">
        <button @click="cerrarDetalle" class="absolute top-4 right-4 z-50 bg-slate-800 p-2 rounded-full text-white hover:bg-red-500 transition-colors"><X class="w-6 h-6" /></button>

        <div class="w-full md:w-1/2 p-6 bg-slate-950/50 flex flex-col items-center justify-center overflow-y-auto">
          <div class="w-full aspect-square rounded-2xl bg-slate-900 bg-contain bg-no-repeat bg-center border border-slate-800 mb-4" :style="{ backgroundImage: `url(${fotoActiva === 0 ? itemSeleccionado.imagen_url : (fotoActiva === 1 ? itemSeleccionado.imagen_url_2 : itemSeleccionado.imagen_url_3)})` }"></div>
          <div class="flex gap-2">
            <button v-if="itemSeleccionado.imagen_url" @click="fotoActiva = 0" class="w-16 h-16 rounded-lg border-2" :class="fotoActiva === 0 ? 'border-purple-500' : 'border-slate-800'"><img :src="itemSeleccionado.imagen_url" class="w-full h-full object-cover rounded-md"></button>
            <button v-if="itemSeleccionado.imagen_url_2" @click="fotoActiva = 1" class="w-16 h-16 rounded-lg border-2" :class="fotoActiva === 1 ? 'border-purple-500' : 'border-slate-800'"><img :src="itemSeleccionado.imagen_url_2" class="w-full h-full object-cover rounded-md"></button>
            <button v-if="itemSeleccionado.imagen_url_3" @click="fotoActiva = 2" class="w-16 h-16 rounded-lg border-2" :class="fotoActiva === 2 ? 'border-purple-500' : 'border-slate-800'"><img :src="itemSeleccionado.imagen_url_3" class="w-full h-full object-cover rounded-md"></button>
          </div>
        </div>

        <div class="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto max-h-[90vh] custom-scrollbar">
          
          <div class="mb-8">
            <span class="text-xs font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">{{ itemSeleccionado.categoria }}</span>
            <h3 class="text-3xl font-black text-white mt-4 italic uppercase">{{ itemSeleccionado.item_nombre }}</h3>
            <p class="text-3xl font-black text-green-400 mt-2">${{ formatearPrecio(itemSeleccionado.precio) }}</p>
            <p class="text-slate-400 mt-4 leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-slate-800">{{ itemSeleccionado.descripcion || 'Sin descripción.' }}</p>
            
            <div v-if="vendedorSeleccionado" class="mt-6 p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700"><User class="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p class="text-[9px] font-black text-slate-500 uppercase">Vendedor</p>
                  <p class="text-sm font-black text-white">{{ vendedorSeleccionado.username }}</p>
                </div>
              </div>
              <router-link :to="'/u/' + vendedorSeleccionado.username" class="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all">Ver Perfil</router-link>
            </div>
            
            <a :href="'https://wa.me/' + itemSeleccionado.telefono" target="_blank" class="mt-4 block text-center bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-xl shadow-lg transition-all uppercase tracking-widest">
              Contactar por WhatsApp
            </a>
          </div>

          <div class="border-t border-slate-800 pt-6">
            <h4 class="text-white font-black uppercase text-sm mb-4 flex items-center gap-2"><MessageCircle class="w-5 h-5 text-sky-400"/> Preguntas al Vendedor</h4>
            
            <form v-if="currentUser && currentUser.id !== itemSeleccionado.user_id" @submit.prevent="enviarPregunta" class="flex gap-2 mb-6">
              <input v-model="nuevaPregunta" type="text" placeholder="Escribe tu pregunta aquí..." class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-sky-500 outline-none font-bold text-sm placeholder:text-slate-600">
              <button type="submit" :disabled="enviandoPregunta || !nuevaPregunta" class="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 rounded-xl transition-colors"><Send class="w-5 h-5" /></button>
            </form>
            <div v-else-if="!currentUser" class="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center mb-6">
              <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Inicia sesión para preguntar</p>
            </div>

            <div class="space-y-4">
              <div v-if="preguntas.length === 0" class="text-center py-6"><p class="text-slate-500 text-xs font-bold uppercase">Aún no hay preguntas. ¡Sé el primero!</p></div>
              <div v-for="preg in preguntas" :key="preg.id" class="bg-slate-900/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <User class="w-3 h-3 text-sky-400" />
                    <span class="text-[10px] font-black uppercase text-sky-400">{{ preg.remitente_nombre }}</span>
                  </div>
                  <p class="text-sm text-slate-300 font-medium">{{ preg.pregunta }}</p>
                </div>
                <div v-if="preg.respuesta" class="ml-4 pl-4 border-l-2 border-slate-700">
                  <div class="flex items-center gap-2 mb-1">
                    <CornerDownRight class="w-3 h-3 text-purple-400" />
                    <span class="text-[10px] font-black uppercase text-purple-400">Vendedor</span>
                  </div>
                  <p class="text-sm text-slate-400 font-medium italic">{{ preg.respuesta }}</p>
                </div>
                <div v-else-if="currentUser && currentUser.id === itemSeleccionado.user_id" class="ml-4 flex gap-2">
                  <input v-model="respuestasPendientes[preg.id]" type="text" placeholder="Escribe tu respuesta..." class="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg focus:border-purple-500 outline-none text-xs font-bold">
                  <button @click="enviarRespuesta(preg.id)" class="bg-purple-600 hover:bg-purple-500 text-white px-3 rounded-lg"><Send class="w-4 h-4"/></button>
                </div>
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
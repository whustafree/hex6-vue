<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { 
  Search, Layers, Loader2, ArrowUpDown, Share2, Heart, X, User 
} from 'lucide-vue-next'

const tcgItems = ref([])
const cargando = ref(true)
const busqueda = ref('') 
const orden = ref('recientes')
const misFavoritosIds = ref([])

// Lógica del Modal y Vendedor
const cartaSeleccionada = ref(null)
const vendedorSeleccionado = ref(null)

const abrirDetalle = async (carta) => {
  cartaSeleccionada.value = carta
  vendedorSeleccionado.value = null
  if (carta.user_id) {
    const { data } = await supabase.from('perfiles').select('username, ciudad').eq('id', carta.user_id).single()
    if (data) vendedorSeleccionado.value = data
  }
}

const cerrarDetalle = () => { cartaSeleccionada.value = null }
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
  } catch (error) { console.error(error) } 
  finally { cargando.value = false }
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
  if (!session) return alert('Debes iniciar sesión para favoritos')
  if (misFavoritosIds.value.includes(carta.id)) {
    await supabase.from('favoritos').delete().eq('item_id', carta.id).eq('user_id', session.user.id).eq('tipo', 'TCG')
    misFavoritosIds.value = misFavoritosIds.value.filter(id => id !== carta.id)
  } else {
    await supabase.from('favoritos').insert({ user_id: session.user.id, item_id: carta.id, tipo: 'TCG', titulo: carta.titulo, imagen_url: carta.imagen_url, precio: carta.precio })
    misFavoritosIds.value.push(carta.id)
  }
}
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
      <h2 class="text-3xl font-black italic text-sky-400 flex items-center gap-3 mb-6 uppercase">
        <Layers class="w-8 h-8" /> Mercado TCG
      </h2>
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="Buscar carta o juego..." class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 outline-none">
        </div>
        <select v-model="orden" class="bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold outline-none"><option value="recientes">Recientes</option><option value="menor">Precio Bajo</option><option value="mayor">Precio Alto</option></select>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12"><Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" /></div>
    <div v-else-if="cartasFiltradas.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="card in cartasFiltradas" :key="card.id" @click="abrirDetalle(card)" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-sky-500 transition-all cursor-pointer relative group">
        <button @click.stop="toggleFavorito(card)" class="absolute top-4 left-4 z-10 p-2 rounded-xl backdrop-blur-md border border-slate-700" :class="misFavoritosIds.includes(card.id) ? 'bg-pink-600 text-white' : 'bg-slate-950/80 text-slate-400'">
          <Heart class="w-4 h-4" :fill="misFavoritosIds.includes(card.id) ? 'currentColor' : 'none'" />
        </button>
        <div class="h-44 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${card.imagen_url})` }"></div>
        <h4 class="font-bold text-sm text-white truncate">{{ card.titulo }}</h4>
        <div class="flex justify-between items-center mt-2 mb-1">
            <span class="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-bold">{{ card.juego }}</span>
            <p class="text-xs text-green-400 font-black">${{ formatearPrecio(card.precio) }}</p>
        </div>
      </div>
    </div>

    <div v-if="cartaSeleccionada" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-y-auto relative shadow-2xl">
        <button @click="cerrarDetalle" class="absolute top-4 right-4 z-50 bg-slate-800 p-2 rounded-full text-white hover:bg-red-500 transition-colors"><X class="w-6 h-6" /></button>

        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="p-6 bg-slate-950/50 flex items-center justify-center">
            <img :src="cartaSeleccionada.imagen_url" class="max-w-full max-h-[60vh] object-contain rounded-2xl border border-slate-800 shadow-2xl">
          </div>

          <div class="p-8 flex flex-col justify-between">
            <div>
              <span class="text-xs font-black text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full">{{ cartaSeleccionada.juego }}</span>
              <h3 class="text-3xl font-black text-white mt-4 italic uppercase">{{ cartaSeleccionada.titulo }}</h3>
              <p class="text-3xl font-black text-green-400 mt-2">${{ formatearPrecio(cartaSeleccionada.precio) }}</p>
              <div class="h-px bg-slate-800 my-6"></div>
              
              <div v-if="vendedorSeleccionado" class="mt-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                    <User class="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-500 uppercase">Propietario</p>
                    <p class="text-sm font-black text-white">{{ vendedorSeleccionado.username }}</p>
                  </div>
                </div>
                <router-link :to="'/u/' + vendedorSeleccionado.username" class="bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all">
                  Ver Perfil
                </router-link>
              </div>

            </div>
            <a :href="'https://wa.me/' + cartaSeleccionada.telefono" target="_blank" class="mt-8 block text-center bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase tracking-widest">
              Contactar para Cambio
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { 
  Search, 
  Gem, 
  Loader2, 
  Filter, 
  ArrowUpDown, 
  Share2, 
  Heart 
} from 'lucide-vue-next'

const colItems = ref([])
const cargando = ref(true)
const busqueda = ref('') 
const categoriaFiltro = ref('Todas')
const orden = ref('recientes')
const misFavoritosIds = ref([])

// Función para formatear el dinero
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL').format(precio)
}

// Cargar favoritos del usuario (Tipo Vitrina)
const cargarFavoritos = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { data } = await supabase
      .from('favoritos')
      .select('item_id')
      .eq('user_id', session.user.id)
      .eq('tipo', 'Vitrina')
    
    if (data) misFavoritosIds.value = data.map(f => f.item_id)
  }
}

onMounted(async () => {
  try {
    const { data } = await supabase
      .from('colecciones')
      .select('*')
      .order('id', { ascending: false })
    
    if (data) colItems.value = data
    await cargarFavoritos()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
})

// Filtros y Ordenamiento
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

// Función: Compartir
const compartirArticulo = async (item) => {
  const textoPromo = `🔥 ¡Mira esto! ${item.item_nombre} a $${formatearPrecio(item.precio)} en HEX6\n\nVer aquí: https://hex6.vercel.app/vitrina`
  if (navigator.share) {
    try { await navigator.share({ title: 'HEX6 Vitrina', text: textoPromo }) } 
    catch (e) { console.log(e) }
  } else {
    navigator.clipboard.writeText(textoPromo)
    alert('¡Link copiado!')
  }
}

// Función: Toggle Favorito
const toggleFavorito = async (item) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return alert('Inicia sesión para guardar favoritos')

  if (misFavoritosIds.value.includes(item.id)) {
    const { error } = await supabase.from('favoritos').delete()
      .eq('item_id', item.id).eq('user_id', session.user.id).eq('tipo', 'Vitrina')
    if (!error) misFavoritosIds.value = misFavoritosIds.value.filter(id => id !== item.id)
  } else {
    const { error } = await supabase.from('favoritos').insert({
      user_id: session.user.id,
      item_id: item.id,
      tipo: 'Vitrina',
      titulo: item.item_nombre,
      imagen_url: item.imagen_url,
      precio: item.precio
    })
    if (!error) misFavoritosIds.value.push(item.id)
  }
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
          <input v-model="busqueda" type="text" placeholder="Buscar figura, consola..." class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-purple-500">
        </div>
        
        <div class="relative w-full md:w-48">
          <Filter class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <select v-model="categoriaFiltro" class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl appearance-none cursor-pointer font-bold">
            <option value="Todas">Todas</option>
            <option value="Figuras">Figuras</option>
            <option value="Consolas">Consolas</option>
            <option value="Retro">Retro</option>
            <option value="Manga">Manga</option>
          </select>
        </div>

        <div class="relative w-full md:w-56">
          <ArrowUpDown class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <select v-model="orden" class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl appearance-none cursor-pointer font-bold">
            <option value="recientes">Más Recientes</option>
            <option value="menor">Menor Precio</option>
            <option value="mayor">Mayor Precio</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12">
        <Loader2 class="w-10 h-10 animate-spin mx-auto text-purple-500" />
    </div>

    <div v-else-if="itemsFiltrados.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in itemsFiltrados" :key="item.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-purple-500 transition-all hover:-translate-y-1 group flex flex-col justify-between relative overflow-hidden shadow-xl">
        
        <button @click="compartirArticulo(item)" class="absolute top-4 right-4 bg-slate-950/80 hover:bg-purple-600 text-white p-2 rounded-xl backdrop-blur-md z-20 border border-slate-700 transition-all">
          <Share2 class="w-4 h-4" />
        </button>

        <button @click="toggleFavorito(item)" 
          class="absolute top-4 left-4 p-2 rounded-xl backdrop-blur-md z-20 border transition-all"
          :class="misFavoritosIds.includes(item.id) ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-950/80 border-slate-700 text-slate-400'">
          <Heart class="w-4 h-4" :fill="misFavoritosIds.includes(item.id) ? 'currentColor' : 'none'" />
        </button>

        <div>
          <div class="h-44 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
          <h4 class="font-bold text-sm text-white truncate">{{ item.item_nombre }}</h4>
          <div class="flex justify-between items-center mt-2 mb-3">
              <span class="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-1 rounded uppercase font-bold">{{ item.categoria }}</span>
              <p class="text-xs text-green-400 font-black">${{ formatearPrecio(item.precio) }}</p>
          </div>
        </div>
        
        <a :href="'https://wa.me/' + item.telefono + '?text=Hola,%20vi%20tu%20anuncio%20de%20' + item.item_nombre + '%20en%20HEX6'" target="_blank" class="block text-center w-full bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest mt-auto">
          Comprar
        </a>
      </div>
    </div>

  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { 
  Search, Gem, Loader2, ArrowUpDown, Share2, Heart, X, User 
} from 'lucide-vue-next'

const colItems = ref([])
const cargando = ref(true)
const busqueda = ref('') 
const categoriaFiltro = ref('Todas')
const orden = ref('recientes')
const misFavoritosIds = ref([])

// Lógica del Modal y Vendedor
const itemSeleccionado = ref(null)
const fotoActiva = ref(0)
const vendedorSeleccionado = ref(null)

const abrirDetalle = async (item) => {
  itemSeleccionado.value = item
  fotoActiva.value = 0
  vendedorSeleccionado.value = null // Limpiar el anterior

  // Buscar perfil del dueño del artículo
  if (item.user_id) {
    const { data } = await supabase.from('perfiles').select('username, ciudad').eq('id', item.user_id).single()
    if (data) vendedorSeleccionado.value = data
  }
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
        <select v-model="categoriaFiltro" class="bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold outline-none"><option value="Todas">Todas</option><option>Figuras</option><option>Consolas</option><option>Retro</option><option>Manga</option></select>
        <select v-model="orden" class="bg-slate-900 border border-slate-700 text-white px-6 py-3 rounded-xl font-bold outline-none"><option value="recientes">Recientes</option><option value="menor">Precio Bajo</option><option value="mayor">Precio Alto</option></select>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12"><Loader2 class="w-10 h-10 animate-spin mx-auto text-purple-500" /></div>
    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="item in itemsFiltrados" :key="item.id" @click="abrirDetalle(item)" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-purple-500 transition-all cursor-pointer relative group">
        <button @click.stop="toggleFavorito(item)" class="absolute top-4 left-4 z-10 p-2 rounded-xl backdrop-blur-md border border-slate-700" :class="misFavoritosIds.includes(item.id) ? 'bg-pink-600 text-white' : 'bg-slate-950/80 text-slate-400'">
          <Heart class="w-4 h-4" :fill="misFavoritosIds.includes(item.id) ? 'currentColor' : 'none'" />
        </button>
        <div class="h-44 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
        <h4 class="font-bold text-sm text-white truncate">{{ item.item_nombre }}</h4>
        <p class="text-xs text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
      </div>
    </div>

    <div v-if="itemSeleccionado" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div class="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-y-auto relative shadow-2xl">
        <button @click="cerrarDetalle" class="absolute top-4 right-4 z-50 bg-slate-800 p-2 rounded-full text-white hover:bg-red-500 transition-colors"><X class="w-6 h-6" /></button>

        <div class="grid grid-cols-1 md:grid-cols-2">
          <div class="p-6 space-y-4 bg-slate-950/50">
            <div class="aspect-square rounded-2xl bg-slate-900 bg-contain bg-no-repeat bg-center border border-slate-800" :style="{ backgroundImage: `url(${fotoActiva === 0 ? itemSeleccionado.imagen_url : (fotoActiva === 1 ? itemSeleccionado.imagen_url_2 : itemSeleccionado.imagen_url_3)})` }"></div>
            <div class="flex gap-2 justify-center">
              <button v-if="itemSeleccionado.imagen_url" @click="fotoActiva = 0" class="w-16 h-16 rounded-lg border-2" :class="fotoActiva === 0 ? 'border-purple-500' : 'border-slate-800'"><img :src="itemSeleccionado.imagen_url" class="w-full h-full object-cover rounded-md"></button>
              <button v-if="itemSeleccionado.imagen_url_2" @click="fotoActiva = 1" class="w-16 h-16 rounded-lg border-2" :class="fotoActiva === 1 ? 'border-purple-500' : 'border-slate-800'"><img :src="itemSeleccionado.imagen_url_2" class="w-full h-full object-cover rounded-md"></button>
              <button v-if="itemSeleccionado.imagen_url_3" @click="fotoActiva = 2" class="w-16 h-16 rounded-lg border-2" :class="fotoActiva === 2 ? 'border-purple-500' : 'border-slate-800'"><img :src="itemSeleccionado.imagen_url_3" class="w-full h-full object-cover rounded-md"></button>
            </div>
          </div>

          <div class="p-8 flex flex-col justify-between">
            <div>
              <span class="text-xs font-black text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">{{ itemSeleccionado.categoria }}</span>
              <h3 class="text-3xl font-black text-white mt-4 italic uppercase">{{ itemSeleccionado.item_nombre }}</h3>
              <p class="text-3xl font-black text-green-400 mt-2">${{ formatearPrecio(itemSeleccionado.precio) }}</p>
              <div class="h-px bg-slate-800 my-6"></div>
              <p class="text-slate-400 leading-relaxed">{{ itemSeleccionado.descripcion || 'Sin descripción.' }}</p>
              
              <div v-if="vendedorSeleccionado" class="mt-6 p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                    <User class="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <p class="text-[9px] font-black text-slate-500 uppercase">Publicado por</p>
                    <p class="text-sm font-black text-white">{{ vendedorSeleccionado.username }}</p>
                  </div>
                </div>
                <router-link :to="'/u/' + vendedorSeleccionado.username" class="bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all">
                  Ver Perfil
                </router-link>
              </div>

            </div>
            <a :href="'https://wa.me/' + itemSeleccionado.telefono" target="_blank" class="mt-8 block text-center bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase tracking-widest">
              Contactar al Vendedor
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
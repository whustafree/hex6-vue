<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { 
  Search, 
  Layers, 
  Loader2, 
  ArrowUpDown, 
  Share2, 
  Heart 
} from 'lucide-vue-next'

const tcgItems = ref([])
const cargando = ref(true)
const busqueda = ref('') 
const orden = ref('recientes')
const misFavoritosIds = ref([])

// Función para formatear el dinero al estilo chileno
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL').format(precio)
}

// Cargar favoritos actuales del usuario para marcar los corazones
const cargarFavoritos = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    const { data } = await supabase
      .from('favoritos')
      .select('item_id')
      .eq('user_id', session.user.id)
      .eq('tipo', 'TCG')
    
    if (data) misFavoritosIds.value = data.map(f => f.item_id)
  }
}

const cargarDatos = async () => {
  try {
    const { data } = await supabase
      .from('tcg_exchange')
      .select('*')
      .order('id', { ascending: false })
    
    if (data) tcgItems.value = data
    await cargarFavoritos()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})

// Lógica de Filtro y Ordenamiento
const cartasFiltradas = computed(() => {
  let resultado = tcgItems.value.filter(carta => 
    carta.titulo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    carta.juego.toLowerCase().includes(busqueda.value.toLowerCase())
  )

  if (orden.value === 'menor') {
    resultado.sort((a, b) => a.precio - b.precio)
  } else if (orden.value === 'mayor') {
    resultado.sort((a, b) => b.precio - a.precio)
  } else {
    resultado.sort((a, b) => b.id - a.id)
  }

  return resultado
})

// Función: Compartir
const compartirCarta = async (carta) => {
  const textoPromo = `🔥 ¡Mira esta carta ${carta.titulo} a $${formatearPrecio(carta.precio)} en HEX6!\n\nRevisa el mercado aquí: https://hex6.vercel.app/tcg`
  
  if (navigator.share) {
    try {
      await navigator.share({ title: 'HEX6 Mercado TCG', text: textoPromo })
    } catch (error) { console.log('Compartir cancelado', error) }
  } else {
    navigator.clipboard.writeText(textoPromo)
    alert('¡Copiado al portapapeles!')
  }
}

// Función: Toggle Favorito
const toggleFavorito = async (carta) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    alert('Debes iniciar sesión para guardar favoritos')
    return
  }

  if (misFavoritosIds.value.includes(carta.id)) {
    // Quitar de favoritos
    const { error } = await supabase
      .from('favoritos')
      .delete()
      .eq('item_id', carta.id)
      .eq('user_id', session.user.id)
      .eq('tipo', 'TCG')
    
    if (!error) {
      misFavoritosIds.value = misFavoritosIds.value.filter(id => id !== carta.id)
    }
  } else {
    // Agregar a favoritos
    const { error } = await supabase.from('favoritos').insert({
      user_id: session.user.id,
      item_id: carta.id,
      tipo: 'TCG',
      titulo: carta.titulo,
      imagen_url: carta.imagen_url,
      precio: carta.precio
    })
    
    if (!error) {
      misFavoritosIds.value.push(carta.id)
    }
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
          <input 
            v-model="busqueda"
            type="text" 
            placeholder="Buscar carta o juego..." 
            class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
          >
        </div>
        
        <div class="relative w-full md:w-64">
          <ArrowUpDown class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <select 
            v-model="orden"
            class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 appearance-none cursor-pointer font-bold"
          >
            <option value="recientes">Más Recientes</option>
            <option value="menor">Menor Precio</option>
            <option value="mayor">Mayor Precio</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12">
        <Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" />
    </div>

    <div v-else-if="cartasFiltradas.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="card in cartasFiltradas" :key="card.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-sky-500 transition-all hover:-translate-y-1 group flex flex-col justify-between relative overflow-hidden">
        
        <button @click="compartirCarta(card)" class="absolute top-4 right-4 bg-slate-950/80 hover:bg-sky-600 text-white p-2 rounded-xl backdrop-blur-md z-20 border border-slate-700 transition-all">
          <Share2 class="w-4 h-4" />
        </button>

        <button @click="toggleFavorito(card)" 
          class="absolute top-4 left-4 p-2 rounded-xl backdrop-blur-md z-20 border transition-all"
          :class="misFavoritosIds.includes(card.id) ? 'bg-pink-600 border-pink-400 text-white' : 'bg-slate-950/80 border-slate-700 text-slate-400'">
          <Heart class="w-4 h-4" :fill="misFavoritosIds.includes(card.id) ? 'currentColor' : 'none'" />
        </button>

        <div>
          <div class="h-44 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${card.imagen_url})` }"></div>
          <h4 class="font-bold text-sm text-white truncate">{{ card.titulo }}</h4>
          <div class="flex justify-between items-center mt-2 mb-3">
              <span class="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-bold">{{ card.juego }}</span>
              <p class="text-xs text-green-400 font-black">${{ formatearPrecio(card.precio) }}</p>
          </div>
        </div>
        
        <a :href="'https://wa.me/' + card.telefono + '?text=Hola,%20me%20interesa%20tu%20carta%20' + card.titulo + '%20en%20HEX6'" target="_blank" class="block text-center w-full bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest mt-auto">
          Contactar
        </a>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-slate-800 rounded-3xl border border-slate-800 opacity-50 font-bold uppercase tracking-widest">
        No se encontraron cartas
    </div>

  </div>
</template>
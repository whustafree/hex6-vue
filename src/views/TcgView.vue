<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Search, Layers, Loader2 } from 'lucide-vue-next'

const tcgItems = ref([])
const cargando = ref(true)
const busqueda = ref('') // Aquí guardamos lo que el usuario escribe

// Traer TODAS las cartas
onMounted(async () => {
  try {
    const { data } = await supabase
      .from('tcg_exchange')
      .select('*')
      .order('id', { ascending: false })
    
    if (data) tcgItems.value = data
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
})

// Esta función filtra las cartas en tiempo real
const cartasFiltradas = computed(() => {
  return tcgItems.value.filter(carta => 
    carta.titulo.toLowerCase().includes(busqueda.value.toLowerCase()) ||
    carta.juego.toLowerCase().includes(busqueda.value.toLowerCase())
  )
})

// Formato de precio chileno
const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL').format(precio)
}
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    
    <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
      <h2 class="text-3xl font-black italic text-sky-400 flex items-center gap-3 mb-6 uppercase">
        <Layers class="w-8 h-8" /> Mercado TCG Completo
      </h2>
      
      <div class="relative">
        <Search class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input 
          v-model="busqueda"
          type="text" 
          placeholder="Buscar carta o juego (Ej: Pikachu, Yugi-Oh)..." 
          class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
        >
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12">
        <Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" />
    </div>

    <div v-else-if="cartasFiltradas.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="card in cartasFiltradas" :key="card.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-sky-500 transition-all hover:-translate-y-1 group">
        <div class="h-44 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${card.imagen_url})` }"></div>
        <h4 class="font-bold text-sm text-white truncate">{{ card.titulo }}</h4>
        <div class="flex justify-between items-center mt-2">
            <span class="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-bold">{{ card.juego }}</span>
            <p class="text-xs text-green-400 font-black">${{ formatearPrecio(card.precio) }}</p>
        </div>
        <a :href="'https://wa.me/' + card.telefono + '?text=Hola,%20me%20interesa%20tu%20carta%20' + card.titulo" target="_blank" class="mt-3 block text-center w-full bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white py-2 rounded-lg transition-all text-xs font-bold uppercase tracking-widest">
          Contactar
        </a>
      </div>
    </div>

    <div v-else class="text-center py-10 opacity-50 bg-slate-800 rounded-3xl border border-slate-700">
        <p>No encontramos ninguna carta con ese nombre.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase' // Importamos tu conexión
import { Layers, Gem, Loader2 } from 'lucide-vue-next'

// Variables para guardar los datos
const tcgItems = ref([])
const colItems = ref([])
const cargando = ref(true)

// Función que se ejecuta al cargar la página
onMounted(async () => {
  try {
    // 1. Traer últimas 4 cartas TCG
    const { data: tcg } = await supabase
      .from('tcg_exchange')
      .select('*')
      .order('id', { ascending: false }) // Ordenar por ID descendente (lo más nuevo primero)
      .limit(4)
    
    if (tcg) tcgItems.value = tcg

    // 2. Traer últimos 4 coleccionables
    const { data: col } = await supabase
      .from('colecciones')
      .select('*')
      .order('id', { ascending: false })
      .limit(4)

    if (col) colItems.value = col

  } catch (error) {
    console.error('Error cargando datos:', error)
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="space-y-12 pb-20">
    
    <section class="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700 text-center shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
      <div class="relative z-10">
        <h2 class="text-4xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-400 mb-4">
          HEX6 RANCAGUA
        </h2>
        <p class="text-slate-400 text-sm md:text-lg font-bold uppercase tracking-widest mb-8">
          El Hub Geek de la Sexta Región
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <button class="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-sky-900/50">
            🔥 Ver Ofertas
          </button>
        </div>
      </div>
    </section>

    <div v-if="cargando" class="text-center py-12">
        <Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" />
        <p class="text-slate-500 mt-4 text-sm font-bold animate-pulse">Conectando con Supabase...</p>
    </div>

    <div v-else>
        <section v-if="tcgItems.length > 0">
        <div class="flex justify-between items-end mb-6">
            <h3 class="text-2xl font-black italic text-sky-400 flex items-center gap-2">
            <Layers class="w-8 h-8" /> Mercado TCG
            </h3>
            <button class="text-xs font-bold text-slate-500 hover:text-sky-400 transition-colors">VER TODO ➔</button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="card in tcgItems" :key="card.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-sky-500 transition-all hover:-translate-y-1 group">
                <div class="h-32 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${card.imagen_url})` }"></div>
                
                <h4 class="font-bold text-sm text-white truncate">{{ card.titulo }}</h4>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-bold">{{ card.juego }}</span>
                    <p class="text-xs text-green-400 font-black">${{ card.precio }}</p>
                </div>
            </div>
        </div>
        </section>

        <div v-else class="text-center py-10 opacity-50">
            <Layers class="w-12 h-12 mx-auto mb-2" />
            <p>No hay cartas publicadas aún.</p>
        </div>

        <div class="h-12"></div> <section v-if="colItems.length > 0">
        <div class="flex justify-between items-end mb-6">
            <h3 class="text-2xl font-black italic text-purple-400 flex items-center gap-2">
            <Gem class="w-8 h-8" /> Vitrina
            </h3>
            <button class="text-xs font-bold text-slate-500 hover:text-purple-400 transition-colors">VER TODO ➔</button>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="item in colItems" :key="item.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-purple-500 transition-all hover:-translate-y-1">
                <div class="h-32 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
                <h4 class="font-bold text-sm text-white truncate">{{ item.item_nombre }}</h4>
                <div class="flex justify-between items-center mt-2">
                    <span class="text-[10px] bg-purple-900/30 text-purple-400 px-2 py-1 rounded uppercase font-bold">{{ item.categoria }}</span>
                    <p class="text-xs text-green-400 font-black">${{ item.precio }}</p>
                </div>
            </div>
        </div>
        </section>
    </div>

  </div>
</template>
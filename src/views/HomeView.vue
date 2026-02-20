<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { Hexagon, Layers, Gem, Users, ArrowRight } from 'lucide-vue-next'

const tcgDestacados = ref([])
const vitrinaDestacados = ref([])

const formatearPrecio = (precio) => new Intl.NumberFormat('es-CL').format(precio)

onMounted(async () => {
  const { data: tcg } = await supabase.from('tcg_exchange').select('*').order('id', { ascending: false }).limit(4)
  if (tcg) tcgDestacados.value = tcg

  const { data: vitrina } = await supabase.from('colecciones').select('*').order('id', { ascending: false }).limit(4)
  if (vitrina) vitrinaDestacados.value = vitrina
})
</script>

<template>
  <div class="space-y-12 pb-20 animate-in fade-in duration-700">
    
    <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 overflow-hidden shadow-2xl">
      <div class="absolute -right-20 -top-20 opacity-10 rotate-12 pointer-events-none">
        <Hexagon class="w-96 h-96 text-sky-400" stroke-width="1" />
      </div>
      
      <div class="relative z-10 max-w-2xl">
        <div class="inline-block bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          Sexta Región
        </div>
        <h1 class="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 leading-tight uppercase">
          El Nexus Geek <br><span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">de Rancagua</span>
        </h1>
        <p class="text-slate-400 text-sm md:text-base leading-relaxed mb-8 font-medium">
          Compra, vende e intercambia cartas TCG, figuras de colección y encuentra tu próxima party para jugar rol. Todo centralizado para la comunidad local.
        </p>
        
        <div class="flex flex-wrap gap-4">
          <router-link to="/tcg" class="bg-sky-600 hover:bg-sky-500 text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg shadow-sky-900/50 uppercase tracking-widest text-xs flex items-center gap-2">
            Explorar TCG <ArrowRight class="w-4 h-4" />
          </router-link>
          <router-link to="/vitrina" class="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black px-6 py-3 rounded-xl transition-all uppercase tracking-widest text-xs flex items-center gap-2">
            Ver Vitrina
          </router-link>
        </div>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-black italic text-white flex items-center gap-2 uppercase">
          <Layers class="text-sky-400" /> Recién llegado TCG
        </h2>
        <router-link to="/tcg" class="text-xs text-sky-400 font-bold hover:text-white uppercase tracking-widest">Ver todo</router-link>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link to="/tcg" v-for="item in tcgDestacados" :key="item.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-sky-500 transition-all group block shadow-md">
          <div class="h-32 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
          <h4 class="font-bold text-sm text-white truncate">{{ item.titulo }}</h4>
          <p class="text-xs text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
        </router-link>
      </div>
    </section>

    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-black italic text-white flex items-center gap-2 uppercase">
          <Gem class="text-purple-400" /> Destacados Vitrina
        </h2>
        <router-link to="/vitrina" class="text-xs text-purple-400 font-bold hover:text-white uppercase tracking-widest">Ver todo</router-link>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <router-link to="/vitrina" v-for="item in vitrinaDestacados" :key="item.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 hover:border-purple-500 transition-all group block shadow-md">
          <div class="h-32 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
          <h4 class="font-bold text-sm text-white truncate">{{ item.item_nombre }}</h4>
          <p class="text-xs text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
        </router-link>
      </div>
    </section>

  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Search, Users, Loader2, Monitor, MapPin } from 'lucide-vue-next'

const lfgItems = ref([])
const cargando = ref(true)
const busqueda = ref('')
const filtroTipo = ref('Todos')

onMounted(async () => {
  try {
    const { data } = await supabase.from('lfg_posts').select('*').order('id', { ascending: false })
    if (data) lfgItems.value = data
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
})

const gruposFiltrados = computed(() => {
  return lfgItems.value.filter(item => {
    const coincideTexto = item.juego_nombre.toLowerCase().includes(busqueda.value.toLowerCase())
    const coincideTipo = filtroTipo.value === 'Todos' || item.tipo === filtroTipo.value
    return coincideTexto && coincideTipo
  })
})
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    
    <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
      <h2 class="text-3xl font-black italic text-green-400 flex items-center gap-3 mb-6 uppercase">
        <Users class="w-8 h-8" /> Buscar Squad / Grupo
      </h2>
      
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="¿Qué juego buscas? (Ej: D&D, Valorant)..." class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-green-500 transition-colors">
        </div>
        
        <div class="flex gap-2">
          <button @click="filtroTipo = 'Todos'" :class="filtroTipo === 'Todos' ? 'bg-slate-600 text-white' : 'bg-slate-900 text-slate-400'" class="px-4 py-3 rounded-xl font-bold transition-colors border border-slate-700 hover:border-slate-500">Todos</button>
          <button @click="filtroTipo = 'Online'" :class="filtroTipo === 'Online' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 text-slate-400 border-slate-700'" class="px-4 py-3 rounded-xl font-bold transition-colors border">Online</button>
          <button @click="filtroTipo = 'Presencial'" :class="filtroTipo === 'Presencial' ? 'bg-green-600 border-green-500 text-white' : 'bg-slate-900 text-slate-400 border-slate-700'" class="px-4 py-3 rounded-xl font-bold transition-colors border">Presencial</button>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12">
        <Loader2 class="w-10 h-10 animate-spin mx-auto text-green-500" />
    </div>

    <div v-else-if="gruposFiltrados.length > 0" class="space-y-4">
      <div v-for="item in gruposFiltrados" :key="item.id" 
           :class="item.tipo === 'Online' ? 'border-indigo-500' : 'border-green-500'"
           class="bg-slate-800 p-5 rounded-2xl border-l-4 flex flex-col md:flex-row justify-between items-center gap-4 hover:bg-slate-800/80 transition-colors">
        
        <div class="flex-1 w-full">
          <div class="flex items-center gap-2 mb-2">
            <span :class="item.tipo === 'Online' ? 'bg-indigo-900/40 text-indigo-400' : 'bg-green-900/40 text-green-400'" class="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
              {{ item.tipo }}
            </span>
            <h4 class="font-black text-xl italic text-slate-100">{{ item.juego_nombre }}</h4>
          </div>
          <p class="text-xs text-slate-400 flex items-center gap-1 uppercase font-bold mb-2">
            <Monitor v-if="item.tipo === 'Online'" class="w-4 h-4 text-indigo-400" />
            <MapPin v-else class="w-4 h-4 text-green-400" />
            {{ item.lugar }}
          </p>
          <p class="text-sm text-slate-300">{{ item.descripcion }}</p>
        </div>
        
        <div class="w-full md:w-auto">
          <a v-if="item.telefono.startsWith('http')" :href="item.telefono" target="_blank" 
             class="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg">
            Unirme al Link
          </a>
          <div v-else class="bg-slate-900 px-6 py-2 rounded-xl border border-slate-700 text-center">
            <span class="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Discord / Contacto</span>
            <span class="font-black text-indigo-400 select-all">{{ item.telefono }}</span>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="text-center py-10 opacity-50 bg-slate-800 rounded-3xl border border-slate-700">
        <p>No hay grupos buscando gente con esos filtros.</p>
    </div>

  </div>
</template>
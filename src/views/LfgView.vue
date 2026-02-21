<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Search, Loader2, PlusCircle, ArrowDownCircle, Users } from 'lucide-vue-next'

const grupos = ref([])
const buscador = ref('')
const cargando = ref(true)
const cargandoMas = ref(false)

// Configuración de paginación
const limite = 12
const paginaActual = ref(0)
const hayMasGrupos = ref(true)

const cargarGrupos = async (esCargaInicial = true) => {
  if (esCargaInicial) {
    cargando.value = true
    paginaActual.value = 0
    grupos.value = []
  } else {
    cargandoMas.value = true
  }

  const rangoInicio = paginaActual.value * limite
  const rangoFin = rangoInicio + limite - 1

  try {
    const { data, error } = await supabase
      .from('lfg_posts')
      .select(`*, perfiles(username)`)
      .order('created_at', { ascending: false })
      .range(rangoInicio, rangoFin)

    if (error) throw error

    if (data.length < limite) {
      hayMasGrupos.value = false
    } else {
      hayMasGrupos.value = true
    }

    if (esCargaInicial) {
      grupos.value = data
    } else {
      grupos.value = [...grupos.value, ...data]
    }
  } catch (error) {
    console.error('Error cargando Grupos:', error.message)
  } finally {
    cargando.value = false
    cargandoMas.value = false
  }
}

const cargarMasPaginas = () => {
  paginaActual.value++
  cargarGrupos(false)
}

onMounted(() => {
  cargarGrupos()
})

const gruposFiltrados = computed(() => {
  return grupos.value.filter(grupo => 
    grupo.titulo.toLowerCase().includes(buscador.value.toLowerCase()) ||
    grupo.descripcion.toLowerCase().includes(buscador.value.toLowerCase())
  )
})
</script>

<template>
  <div class="space-y-6 md:space-y-8 animate-in fade-in duration-500">
    
    <div class="bg-slate-800/40 p-6 md:p-10 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none"></div>
      <div class="relative z-10 w-full max-w-2xl">
        <h2 class="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-4 drop-shadow-md">Grupos & <span class="text-green-400">LFG</span></h2>
        <p class="text-slate-400 text-sm md:text-base font-medium mb-8">Encuentra party para tus juegos favoritos, rol o torneos.</p>
        
        <div class="relative w-full group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-green-400 transition-colors" />
          <input v-model="buscador" type="text" placeholder="Buscar juego, campaña D&D, clan..." class="w-full bg-slate-900/80 border-2 border-slate-700/50 text-white pl-12 pr-4 py-4 md:py-5 rounded-2xl outline-none focus:border-green-500 transition-all shadow-inner font-bold placeholder:text-slate-600 text-sm md:text-base backdrop-blur-sm">
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center px-2">
      <p class="text-slate-500 font-bold uppercase tracking-widest text-xs"><span class="text-green-400">{{ gruposFiltrados.length }}</span> Grupos</p>
      <router-link to="/add-lfg" class="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"><PlusCircle class="w-4 h-4" /> Crear Grupo</router-link>
    </div>

    <div v-if="cargando" class="flex justify-center py-20"><Loader2 class="w-12 h-12 text-green-500 animate-spin" /></div>
    
    <div v-else-if="gruposFiltrados.length === 0" class="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-700">
      <p class="text-slate-500 font-bold uppercase tracking-widest">No hay grupos buscando gente.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div v-for="grupo in gruposFiltrados" :key="grupo.id" class="bg-slate-800/80 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-700 hover:border-green-500/50 transition-all shadow-lg flex flex-col">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-black text-white text-lg md:text-xl leading-tight pr-4">{{ grupo.titulo }}</h3>
          <Users class="w-6 h-6 text-green-400 shrink-0" />
        </div>
        
        <p class="text-slate-400 text-sm mb-6 flex-1 whitespace-pre-wrap">{{ grupo.descripcion }}</p>
        
        <div class="flex justify-between items-center border-t border-slate-700 pt-4 mt-auto">
          <p class="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 truncate max-w-[150px]">
            <span class="w-2 h-2 rounded-full bg-green-500"></span>{{ grupo.perfiles?.username || 'Usuario' }}
          </p>
          <a :href="'https://wa.me/' + grupo.telefono.replace(/\D/g, '')" target="_blank" class="bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors text-center shadow-lg">Unirse</a>
        </div>
      </div>
    </div>

    <div v-if="hayMasGrupos && !cargando && buscador === ''" class="flex justify-center mt-8 pb-8">
      <button @click="cargarMasPaginas" :disabled="cargandoMas" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg disabled:opacity-50">
        <Loader2 v-if="cargandoMas" class="w-4 h-4 animate-spin" />
        <ArrowDownCircle v-else class="w-4 h-4 text-green-400" />
        {{ cargandoMas ? 'Cargando...' : 'Cargar Más Grupos' }}
      </button>
    </div>

  </div>
</template>
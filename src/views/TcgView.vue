<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Search, Loader2, PlusCircle, ArrowDownCircle } from 'lucide-vue-next'

const cartas = ref([])
const buscador = ref('')
const cargando = ref(true)
const cargandoMas = ref(false)

// Configuración de paginación
const limite = 12
const paginaActual = ref(0)
const hayMasCartas = ref(true)

const cargarCartas = async (esCargaInicial = true) => {
  if (esCargaInicial) {
    cargando.value = true
    paginaActual.value = 0
    cartas.value = []
  } else {
    cargandoMas.value = true
  }

  const rangoInicio = paginaActual.value * limite
  const rangoFin = rangoInicio + limite - 1

  try {
    const { data, error } = await supabase
      .from('tcg_exchange')
      .select(`*, perfiles(username)`)
      .order('id', { ascending: false })
      .range(rangoInicio, rangoFin)

    if (error) throw error

    if (data.length < limite) {
      hayMasCartas.value = false // Ya no hay más para cargar
    } else {
      hayMasCartas.value = true
    }

    if (esCargaInicial) {
      cartas.value = data
    } else {
      cartas.value = [...cartas.value, ...data] // Agrega las nuevas al final
    }
  } catch (error) {
    console.error('Error cargando TCG:', error.message)
  } finally {
    cargando.value = false
    cargandoMas.value = false
  }
}

const cargarMasPaginas = () => {
  paginaActual.value++
  cargarCartas(false)
}

onMounted(() => {
  cargarCartas()
})

const cartasFiltradas = computed(() => {
  return cartas.value.filter(carta => 
    carta.titulo.toLowerCase().includes(buscador.value.toLowerCase()) ||
    carta.descripcion.toLowerCase().includes(buscador.value.toLowerCase())
  )
})

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL').format(precio)
}
</script>

<template>
  <div class="space-y-6 md:space-y-8 animate-in fade-in duration-500">
    
    <div class="bg-slate-800/40 p-6 md:p-10 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
      <div class="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-transparent pointer-events-none"></div>
      <div class="relative z-10 w-full max-w-2xl">
        <h2 class="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-4 drop-shadow-md">Mercado <span class="text-sky-400">TCG</span></h2>
        <p class="text-slate-400 text-sm md:text-base font-medium mb-8">Intercambia, compra y vende cartas en Rancagua.</p>
        
        <div class="relative w-full group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-sky-400 transition-colors" />
          <input v-model="buscador" type="text" placeholder="Buscar carta, mazo o edición..." class="w-full bg-slate-900/80 border-2 border-slate-700/50 text-white pl-12 pr-4 py-4 md:py-5 rounded-2xl outline-none focus:border-sky-500 transition-all shadow-inner font-bold placeholder:text-slate-600 text-sm md:text-base backdrop-blur-sm">
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center px-2">
      <p class="text-slate-500 font-bold uppercase tracking-widest text-xs"><span class="text-sky-400">{{ cartasFiltradas.length }}</span> Resultados</p>
      <router-link to="/add-tcg" class="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg shadow-sky-900/20"><PlusCircle class="w-4 h-4" /> Publicar Carta</router-link>
    </div>

    <div v-if="cargando" class="flex justify-center py-20"><Loader2 class="w-12 h-12 text-sky-500 animate-spin" /></div>
    
    <div v-else-if="cartasFiltradas.length === 0" class="text-center py-20 bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-700">
      <p class="text-slate-500 font-bold uppercase tracking-widest">No se encontraron cartas.</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <div v-for="carta in cartasFiltradas" :key="carta.id" class="bg-slate-800/80 rounded-2xl md:rounded-3xl overflow-hidden border border-slate-700 hover:border-sky-500/50 transition-all group shadow-lg flex flex-col" :class="{'opacity-60 grayscale': carta.estado === 'vendido'}">
        <div class="h-40 md:h-56 bg-slate-900 relative overflow-hidden shrink-0">
          <img :src="carta.imagen_url" :alt="carta.titulo" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          
          <div class="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col gap-1 items-end">
             <span v-if="carta.estado === 'reservado'" class="bg-yellow-500 text-slate-900 text-[9px] md:text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">Reservado</span>
             <span v-if="carta.estado === 'vendido'" class="bg-red-500 text-white text-[9px] md:text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-lg">Vendido</span>
          </div>
          
          <div class="absolute bottom-2 md:bottom-3 left-2 md:left-3"><p class="text-white font-black text-lg md:text-xl drop-shadow-md">${{ formatearPrecio(carta.precio) }}</p></div>
        </div>
        
        <div class="p-3 md:p-5 flex-1 flex flex-col">
          <h3 class="font-bold text-white leading-tight mb-2 text-sm md:text-base line-clamp-2">{{ carta.titulo }}</h3>
          <p class="text-slate-400 text-xs line-clamp-2 mb-4">{{ carta.descripcion }}</p>
          <div class="mt-auto flex justify-between items-center border-t border-slate-700 pt-3">
             <p class="text-[10px] md:text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 truncate max-w-[120px]">
                <span class="w-2 h-2 rounded-full bg-sky-500"></span>{{ carta.perfiles?.username || 'Usuario' }}
             </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="hayMasCartas && !cargando && buscador === ''" class="flex justify-center mt-8 pb-8">
      <button @click="cargarMasPaginas" :disabled="cargandoMas" class="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg disabled:opacity-50">
        <Loader2 v-if="cargandoMas" class="w-4 h-4 animate-spin" />
        <ArrowDownCircle v-else class="w-4 h-4 text-sky-400" />
        {{ cargandoMas ? 'Cargando...' : 'Cargar Más Cartas' }}
      </button>
    </div>

  </div>
</template>
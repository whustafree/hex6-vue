<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { Heart, Trash2, Loader2, ExternalLink } from 'lucide-vue-next'
import { showToast } from '../utils/toast' // <--- NUEVA CONEXIÓN: Agregamos los Toasts

const favoritos = ref([])
const cargando = ref(true)

const formatearPrecio = (precio) => {
  return new Intl.NumberFormat('es-CL').format(precio)
}

const cargarFavoritos = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from('favoritos')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (data) favoritos.value = data
  } catch (error) {
    console.error('Error:', error)
  } finally {
    cargando.value = false
  }
}

const quitarFavorito = async (id) => {
  try {
    const { error } = await supabase.from('favoritos').delete().eq('id', id)
    if (error) throw error
    
    // Eliminación visual al instante
    favoritos.value = favoritos.value.filter(f => f.id !== id)
    
    // <--- NUEVA CONEXIÓN: Alerta visual
    showToast('Artículo eliminado de tus favoritos', 'info') 
  } catch (error) {
    showToast('Error al quitar de favoritos: ' + error.message, 'error')
  }
}

onMounted(() => {
  cargarFavoritos()
})
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
    <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
      <h2 class="text-3xl font-black italic text-pink-500 flex items-center gap-3 uppercase">
        <Heart class="w-8 h-8 fill-current" /> Mis Guardados
      </h2>
    </div>

    <div v-if="cargando" class="text-center py-20">
      <Loader2 class="w-12 h-12 animate-spin mx-auto text-pink-500" />
    </div>

    <div v-else-if="favoritos.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="fav in favoritos" :key="fav.id" class="bg-slate-800 rounded-2xl p-3 border border-slate-700 group relative flex flex-col justify-between overflow-hidden hover:border-pink-500/50 transition-all">
        <button @click="quitarFavorito(fav.id)" class="absolute top-4 right-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all z-20 border border-red-500/20 shadow-lg">
          <Trash2 class="w-4 h-4" />
        </button>
        <div>
          <div class="h-40 bg-slate-900 rounded-xl mb-3 bg-cover bg-center" :style="{ backgroundImage: `url(${fav.imagen_url})` }"></div>
          <h4 class="font-bold text-sm text-white truncate px-1">{{ fav.titulo }}</h4>
          <div class="flex justify-between items-center mt-2 mb-3 px-1">
            <span class="text-[9px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-black tracking-widest">{{ fav.tipo }}</span>
            <p class="text-xs text-green-400 font-black">${{ formatearPrecio(fav.precio) }}</p>
          </div>
        </div>
        <router-link :to="fav.tipo === 'TCG' ? '/tcg' : '/vitrina'" class="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-pink-600 text-slate-300 hover:text-white py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest mt-auto border border-slate-700 hover:border-pink-500 shadow-md">
          <ExternalLink class="w-3 h-3" /> Ver en Mercado
        </router-link>
      </div>
    </div>

    <div v-else class="text-center py-32 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700 shadow-inner">
      <Heart class="w-12 h-12 mx-auto text-slate-700 mb-4" />
      <p class="text-slate-500 font-black uppercase tracking-widest">Aún no tienes favoritos guardados</p>
      <router-link to="/tcg" class="mt-6 inline-block bg-sky-600/20 text-sky-400 hover:bg-sky-600 hover:text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">Explorar TCG</router-link>
    </div>
  </div>
</template>
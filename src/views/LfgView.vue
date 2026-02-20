<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { Search, Users, Loader2, MessageSquare, Plus, User } from 'lucide-vue-next'

const lfgItems = ref([])
const cargando = ref(true)
const busqueda = ref('')
const filtroJuego = ref('Todos')

const formatearFecha = (fechaString) => {
  const fecha = new Date(fechaString)
  return fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const cargarGrupos = async () => {
  try {
    const { data: posts } = await supabase.from('lfg_posts').select('*').order('created_at', { ascending: false })
    
    if (posts && posts.length > 0) {
      // Buscar los nombres de usuario de quienes publicaron
      const userIds = [...new Set(posts.map(p => p.user_id))]
      const { data: perfiles } = await supabase.from('perfiles').select('id, username').in('id', userIds)
      
      const perfilesMap = {}
      if (perfiles) perfiles.forEach(p => perfilesMap[p.id] = p.username)

      // Unir los posts con el nombre del autor
      lfgItems.value = posts.map(p => ({
        ...p,
        username: perfilesMap[p.user_id] || 'Anónimo'
      }))
    }
  } catch (error) {
    console.error(error)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarGrupos()
})

const itemsFiltrados = computed(() => {
  return lfgItems.value.filter(item => {
    const coincideTexto = item.titulo.toLowerCase().includes(busqueda.value.toLowerCase()) || 
                          item.descripcion.toLowerCase().includes(busqueda.value.toLowerCase())
    const coincideJuego = filtroJuego.value === 'Todos' || item.juego === filtroJuego.value
    return coincideTexto && coincideJuego
  })
})
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
      <div class="flex justify-between items-start mb-6">
        <h2 class="text-3xl font-black italic text-green-400 flex items-center gap-3 uppercase">
          <Users class="w-8 h-8" /> Grupos & LFG
        </h2>
        <router-link to="/add-lfg" class="bg-green-600 hover:bg-green-500 text-white p-3 rounded-xl transition-all shadow-lg flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
          <Plus class="w-4 h-4" /> <span class="hidden sm:inline">Publicar</span>
        </router-link>
      </div>
      
      <div class="flex flex-col md:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input v-model="busqueda" type="text" placeholder="Buscar jugadores, campañas..." class="w-full bg-slate-900 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-green-500 outline-none font-bold">
        </div>
        <select v-model="filtroJuego" class="w-full md:w-48 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-green-500 outline-none font-bold appearance-none">
          <option value="Todos">Todos</option>
          <option>D&D / Rol</option>
          <option>TCG</option>
          <option>Videojuegos</option>
          <option>Juegos de Mesa</option>
        </select>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-12"><Loader2 class="w-10 h-10 animate-spin mx-auto text-green-500" /></div>

    <div v-else-if="itemsFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="post in itemsFiltrados" :key="post.id" class="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-green-500 transition-colors group flex flex-col justify-between h-full">
        <div>
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="text-[10px] bg-green-900/30 text-green-400 px-2 py-1 rounded uppercase font-bold">{{ post.juego }}</span>
              <h3 class="font-bold text-white mt-2 text-lg leading-tight">{{ post.titulo }}</h3>
              
              <router-link v-if="post.username !== 'Anónimo'" :to="'/u/' + post.username" class="inline-flex items-center gap-1 mt-2 text-[10px] text-sky-400 font-black uppercase hover:underline bg-sky-500/10 px-2 py-1 rounded">
                <User class="w-3 h-3" /> {{ post.username }}
              </router-link>

            </div>
            <span class="text-[10px] text-slate-400 font-bold shrink-0 text-right">{{ formatearFecha(post.created_at) }}</span>
          </div>
          <p class="text-sm text-slate-300 leading-relaxed">{{ post.descripcion }}</p>
        </div>
        
        <a :href="'https://wa.me/' + post.telefono" target="_blank" class="mt-6 flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-green-600 text-green-400 hover:text-white py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest border border-slate-700 hover:border-green-500">
          <MessageSquare class="w-4 h-4" /> Escribir por WhatsApp
        </a>
      </div>
    </div>
  </div>
</template>
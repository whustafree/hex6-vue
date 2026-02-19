<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { 
  PlusCircle, ShoppingCart, UserPlus, UserCog, 
  LayoutDashboard, ExternalLink, Clock, Trash2 
} from 'lucide-vue-next'

const router = useRouter()
const usuario = ref(null)
const cargando = ref(true)
const misPublicaciones = ref([])

const cargarMisPublicaciones = async (userId) => {
  try {
    // Buscamos en las 3 tablas simultáneamente
    const [tcg, col, lfg] = await Promise.all([
      supabase.from('tcg_exchange').select('id, titulo, created_at').eq('user_id', userId),
      supabase.from('colecciones').select('id, item_nombre, created_at').eq('user_id', userId),
      supabase.from('lfg_posts').select('id, juego_nombre, created_at').eq('user_id', userId)
    ])

    // Juntamos todo en una sola lista etiquetada
    const combinada = [
      ...(tcg.data || []).map(i => ({ ...i, tipo: 'TCG', nombre: i.titulo, tabla: 'tcg_exchange' })),
      ...(col.data || []).map(i => ({ ...i, tipo: 'Vitrina', nombre: i.item_nombre, tabla: 'colecciones' })),
      ...(lfg.data || []).map(i => ({ ...i, tipo: 'LFG', nombre: i.juego_nombre, tabla: 'lfg_posts' }))
    ]

    // Ordenar por fecha (más reciente primero)
    misPublicaciones.value = combinada.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  } catch (error) {
    console.error("Error cargando publicaciones:", error)
  }
}

const eliminarPublicacion = async (id, tabla) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return

  const { error } = await supabase.from(tabla).delete().eq('id', id)
  
  if (error) alert("Error al eliminar: " + error.message)
  else {
    // Refrescar la lista localmente
    misPublicaciones.value = misPublicaciones.value.filter(p => p.id !== id)
  }
}

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    router.push('/login')
  } else {
    usuario.value = session.user
    await cargarMisPublicaciones(session.user.id)
  }
  cargando.value = false
})
</script>

<template>
  <div v-if="usuario" class="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in zoom-in duration-500">
    
    <div class="bg-slate-800/40 p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
      <div class="text-center md:text-left">
        <h2 class="text-3xl font-black italic text-sky-400 flex items-center justify-center md:justify-start gap-3 uppercase">
          <LayoutDashboard class="w-8 h-8" /> Central HEX6
        </h2>
        <p class="text-slate-400 text-sm mt-1 font-bold uppercase tracking-widest">
          Sesión: <span class="text-white">{{ usuario.email }}</span>
        </p>
      </div>
      <router-link to="/perfil" class="bg-slate-900 p-4 rounded-2xl border border-slate-700 hover:border-sky-500 transition-all flex items-center gap-2 group">
        <UserCog class="w-5 h-5 text-slate-400 group-hover:text-sky-400" />
        <span class="text-xs font-black uppercase text-slate-300">Configurar Perfil</span>
      </router-link>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <router-link to="/add-tcg" class="bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-sky-500 transition-all text-center">
        <PlusCircle class="w-10 h-10 text-sky-400 mx-auto mb-3" />
        <h3 class="font-black text-white uppercase italic">Nueva Carta</h3>
      </router-link>
      <router-link to="/add-vitrina" class="bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-purple-500 transition-all text-center">
        <ShoppingCart class="w-10 h-10 text-purple-400 mx-auto mb-3" />
        <h3 class="font-black text-white uppercase italic">Nuevo Objeto</h3>
      </router-link>
      <router-link to="/add-lfg" class="bg-slate-800 p-6 rounded-3xl border border-slate-700 hover:border-green-500 transition-all text-center">
        <UserPlus class="w-10 h-10 text-green-400 mx-auto mb-3" />
        <h3 class="font-black text-white uppercase italic">Crear Grupo</h3>
      </router-link>
    </div>

    <div class="bg-slate-800/50 border border-slate-800 rounded-3xl p-8">
      <h4 class="font-black text-slate-100 uppercase italic mb-6 flex items-center gap-2">
        <Clock class="w-5 h-5 text-slate-500" /> Mis Publicaciones Recientes
      </h4>
      
      <div v-if="misPublicaciones.length > 0" class="space-y-3">
        <div v-for="pub in misPublicaciones" :key="pub.id" class="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all">
          <div class="flex items-center gap-4">
            <span :class="{
              'text-sky-400 bg-sky-400/10': pub.tipo === 'TCG',
              'text-purple-400 bg-purple-400/10': pub.tipo === 'Vitrina',
              'text-green-400 bg-green-400/10': pub.tipo === 'LFG'
            }" class="text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">
              {{ pub.tipo }}
            </span>
            <p class="font-bold text-slate-200 text-sm">{{ pub.nombre }}</p>
          </div>
          <button @click="eliminarPublicacion(pub.id, pub.tabla)" class="p-2 text-slate-600 hover:text-red-500 transition-colors">
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div v-else class="py-12 text-center border-2 border-dashed border-slate-700 rounded-2xl">
        <p class="text-slate-600 text-sm font-bold uppercase tracking-widest italic">Aún no has publicado nada</p>
      </div>
    </div>

  </div>
  <div v-else-if="cargando" class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
  </div>
</template>
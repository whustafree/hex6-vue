<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { 
  PlusCircle, 
  ShoppingCart, 
  UserPlus, 
  UserCog, 
  LayoutDashboard,
  ExternalLink,
  Clock
} from 'lucide-vue-next'

const router = useRouter()
const usuario = ref(null)
const cargando = ref(true)

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Si no hay sesión, mandarlo al login
    router.push('/login')
  } else {
    usuario.value = session.user
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
        <p class="text-slate-400 text-sm mt-1 font-bold uppercase tracking-widest flex items-center gap-2">
          Sesión iniciada como: <span class="text-white">{{ usuario.email }}</span>
        </p>
      </div>
      
      <div class="flex gap-3">
        <a href="https://github.com/whustafree/hex6-vue" target="_blank" class="bg-slate-900 p-3 rounded-xl border border-slate-700 hover:border-sky-500 transition-colors">
          <ExternalLink class="w-5 h-5 text-slate-400" />
        </a>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <router-link to="/add-tcg" class="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-sky-500 transition-all group text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-sky-500/10 transition-colors"></div>
        <PlusCircle class="w-12 h-12 text-sky-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 class="font-black text-xl text-white uppercase italic">Publicar Carta</h3>
        <p class="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tighter">Mercado de Cartas TCG</p>
      </router-link>

      <router-link to="/add-vitrina" class="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-purple-500 transition-all group text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-purple-500/10 transition-colors"></div>
        <ShoppingCart class="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 class="font-black text-xl text-white uppercase italic">Vender Objeto</h3>
        <p class="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tighter">Vitrina de Coleccionables</p>
      </router-link>

      <router-link to="/add-lfg" class="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-green-500 transition-all group text-center relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-green-500/10 transition-colors"></div>
        <UserPlus class="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 class="font-black text-xl text-white uppercase italic">Crear Grupo</h3>
        <p class="text-xs text-slate-500 mt-2 font-bold uppercase tracking-tighter">Squads & Partidas LFG</p>
      </router-link>

    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="bg-slate-800/50 border border-slate-800 rounded-3xl p-8">
        <h4 class="font-black text-slate-100 uppercase italic mb-6 flex items-center gap-2">
          <Clock class="w-5 h-5 text-slate-500" /> Mis Publicaciones Recientes
        </h4>
        <div class="space-y-4">
          <div class="py-12 text-center border-2 border-dashed border-slate-700 rounded-2xl">
            <p class="text-slate-600 text-sm font-bold uppercase tracking-widest italic">Aún no tienes publicaciones activas</p>
          </div>
        </div>
      </div>

      <div class="bg-slate-800/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-center items-center text-center">
        <UserCog class="w-12 h-12 text-slate-600 mb-4" />
        <h4 class="font-black text-slate-100 uppercase italic">Ajustes de Perfil</h4>
        <p class="text-sm text-slate-500 mt-2 mb-6">Gestiona tu información de contacto y preferencias de usuario.</p>
        <button class="bg-slate-700 hover:bg-slate-600 text-white text-xs font-black px-6 py-3 rounded-xl uppercase tracking-widest transition-all">
          Editar Perfil
        </button>
      </div>

    </div>

  </div>

  <div v-else-if="cargando" class="flex justify-center items-center h-64">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
  </div>
</template>
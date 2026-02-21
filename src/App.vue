<script setup>
import { ref, onMounted } from 'vue'
import { 
  Hexagon, LogOut, User, Layers, Gem, Users, LayoutDashboard, ShieldCheck, Heart,
  CheckCircle, AlertCircle, Info 
} from 'lucide-vue-next'
import { supabase } from './supabase'
import { useRouter } from 'vue-router'
import { toasts, showToast } from './utils/toast'

const router = useRouter()
const usuario = ref(null)
let canalGlobal = null 

const iniciarNotificacionesGlobales = (userId) => {
  if (canalGlobal) supabase.removeChannel(canalGlobal)

  canalGlobal = supabase.channel('global_notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'preguntas', filter: `vendedor_id=eq.${userId}` }, payload => {
      showToast('🔔 ¡Alguien hizo una pregunta en tu publicación!', 'info')
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'preguntas', filter: `remitente_id=eq.${userId}` }, payload => {
       if (payload.new.respuesta && payload.old.respuesta !== payload.new.respuesta) {
          showToast('🔔 ¡El vendedor respondió tu pregunta!', 'success')
       }
    })
    .subscribe()
}

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    usuario.value = data.session?.user ?? null
    if (usuario.value) iniciarNotificacionesGlobales(usuario.value.id)
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    usuario.value = session?.user ?? null
    if (usuario.value) iniciarNotificacionesGlobales(usuario.value.id)
  })
})

const cerrarSesion = async () => {
  if (canalGlobal) supabase.removeChannel(canalGlobal)
  await supabase.auth.signOut()
  usuario.value = null
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col relative pb-20 md:pb-0">
    
    <nav class="sticky top-0 z-50 p-4 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div class="max-w-6xl mx-auto flex justify-between items-center gap-2">
        <router-link to="/" class="flex items-center gap-2 md:gap-3 group shrink-0">
          <div class="relative flex items-center justify-center">
            <Hexagon class="w-8 h-8 md:w-9 md:h-9 text-sky-400 relative z-10" stroke-width="2.5" />
            <div class="absolute w-2 h-2 bg-purple-400 rounded-full z-20 group-hover:animate-ping"></div>
          </div>
          <div class="flex flex-col -space-y-1">
            <span class="text-xl md:text-2xl font-black italic tracking-tighter uppercase">HEX<span class="text-sky-400">6</span></span>
            <span class="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Rancagua</span>
          </div>
        </router-link>

        <div class="hidden md:flex items-center gap-6 border-r border-slate-800 pr-6 h-8">
          <router-link to="/tcg" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-sky-400"><Layers class="w-4 h-4" /> TCG</router-link>
          <router-link to="/vitrina" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-purple-400"><Gem class="w-4 h-4" /> Vitrina</router-link>
          <router-link to="/grupos" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-green-400"><Users class="w-4 h-4" /> Grupos</router-link>
          <router-link to="/favoritos" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-pink-400"><Heart class="w-4 h-4" /> Favoritos</router-link>
        </div>

        <div class="flex items-center gap-2">
          <div v-if="usuario" class="flex items-center gap-2">
            <router-link to="/dashboard" class="hidden md:flex items-center gap-2 bg-slate-900/50 p-1.5 pr-4 rounded-xl border border-slate-800 hover:border-sky-500 transition-all">
              <div class="bg-sky-500/20 p-2 rounded-lg"><LayoutDashboard class="w-4 h-4 text-sky-400" /></div>
              <p class="text-xs font-black truncate max-w-[100px] uppercase">{{ usuario.email.split('@')[0] }}</p>
            </router-link>
            <button @click="cerrarSesion" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl border border-red-500/20 transition-all shadow-lg" title="Cerrar Sesión"><LogOut class="w-5 h-5" /></button>
          </div>
          <router-link v-else to="/login" class="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg">
            <User class="w-4 h-4" /><span>Entrar</span>
          </router-link>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto w-full p-4 flex-1">
      <router-view v-slot="{ Component }"><transition name="fade" mode="out-in"><component :is="Component" /></transition></router-view>
    </main>

    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 z-50 flex justify-around items-end px-2 py-2 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <router-link to="/tcg" class="flex flex-col items-center gap-1 p-2 text-slate-500" active-class="text-sky-400">
        <Layers class="w-6 h-6" /><span class="text-[9px] font-black uppercase tracking-wider">TCG</span>
      </router-link>
      <router-link to="/vitrina" class="flex flex-col items-center gap-1 p-2 text-slate-500" active-class="text-purple-400">
        <Gem class="w-6 h-6" /><span class="text-[9px] font-black uppercase tracking-wider">Vitrina</span>
      </router-link>
      
      <router-link to="/dashboard" class="relative flex flex-col items-center group mb-1 text-slate-500" active-class="text-orange-400">
        <div class="absolute -top-7 bg-slate-900 border border-slate-700 p-3 rounded-2xl shadow-xl shadow-black transition-all" :class="$route.path === '/dashboard' ? 'bg-orange-600 border-orange-500 shadow-orange-900/50 text-white' : 'text-slate-400 group-hover:text-orange-400 group-hover:border-orange-500'">
          <LayoutDashboard class="w-6 h-6" />
        </div>
        <span class="text-[9px] font-black uppercase tracking-wider mt-6">Panel</span>
      </router-link>

      <router-link to="/grupos" class="flex flex-col items-center gap-1 p-2 text-slate-500" active-class="text-green-400">
        <Users class="w-6 h-6" /><span class="text-[9px] font-black uppercase tracking-wider">Grupos</span>
      </router-link>
      <router-link to="/favoritos" class="flex flex-col items-center gap-1 p-2 text-slate-500" active-class="text-pink-400">
        <Heart class="w-6 h-6" /><span class="text-[9px] font-black uppercase tracking-wider">Favs</span>
      </router-link>
    </nav>

    <div class="fixed top-20 right-4 z-[999] flex flex-col gap-3 pointer-events-none md:bottom-6 md:top-auto md:right-6">
      <transition-group name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border backdrop-blur-md font-bold text-sm min-w-[280px]" :class="{'bg-green-500/10 border-green-500/30 text-green-400': toast.tipo === 'success', 'bg-red-500/10 border-red-500/30 text-red-400': toast.tipo === 'error', 'bg-sky-500/10 border-sky-500/30 text-sky-400': toast.tipo === 'info'}">
          <CheckCircle v-if="toast.tipo === 'success'" class="w-5 h-5 shrink-0" />
          <AlertCircle v-if="toast.tipo === 'error'" class="w-5 h-5 shrink-0" />
          <Info v-if="toast.tipo === 'info'" class="w-5 h-5 shrink-0" />
          <span class="leading-tight">{{ toast.mensaje }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style>
/* Soportes para pantallas de iPhone (Notch) */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe { padding-bottom: calc(0.5rem + env(safe-area-inset-bottom)); }
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.toast-enter-from { opacity: 0; transform: translateX(50px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translateX(50px) scale(0.9); }
</style>
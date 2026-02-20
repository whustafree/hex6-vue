<script setup>
import { ref, onMounted } from 'vue'
import { 
  Hexagon, 
  LogOut, 
  User, 
  Layers, 
  Gem, 
  Users, 
  LayoutDashboard 
} from 'lucide-vue-next'
import { supabase } from './supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = ref(null)

onMounted(() => {
  // 1. Revisar si ya existe una sesión activa al cargar la web
  supabase.auth.getSession().then(({ data }) => {
    usuario.value = data.session?.user ?? null
  })

  // 2. Escuchar cambios en el estado de autenticación (Login o Logout)
  supabase.auth.onAuthStateChange((_event, session) => {
    usuario.value = session?.user ?? null
  })
})

// Función para cerrar sesión
const cerrarSesion = async () => {
  await supabase.auth.signOut()
  usuario.value = null
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
    
    <nav class="sticky top-0 z-50 p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-lg shadow-sky-900/10">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        
        <router-link to="/" class="flex items-center gap-3 group relative pl-2">
          <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 bg-sky-500 blur-md opacity-20 group-hover:opacity-60 transition-opacity duration-500 rounded-full"></div>
            <Hexagon class="w-9 h-9 text-sky-400 relative z-10" stroke-width="2.5" />
            <div class="absolute w-2 h-2 bg-purple-400 rounded-full z-20 shadow-[0_0_10px_#c084fc] group-hover:animate-ping"></div>
          </div>
          
          <div class="flex flex-col justify-center -space-y-1 mt-1">
            <span class="text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-300">
              HEX<span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">6</span>
            </span>
            <span class="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover:text-sky-400 transition-colors ml-0.5">
              Rancagua
            </span>
          </div>
        </router-link>
<router-link to="/reglas" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-yellow-400">
  <ShieldCheck class="w-3 h-3" /> Reglas
</router-link>
        <div class="flex items-center gap-4 md:gap-8">
          
          <div class="hidden md:flex gap-6 mr-4 border-r border-slate-800 pr-6">
            <router-link to="/tcg" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
              <Layers class="w-3 h-3" /> TCG
            </router-link>
            <router-link to="/vitrina" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]">
              <Gem class="w-3 h-3" /> Vitrina
            </router-link>
            <router-link to="/grupos" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
              <Users class="w-3 h-3" /> Grupos
            </router-link>
          </div>

          <div v-if="usuario" class="flex items-center gap-3">
            <router-link to="/dashboard" class="flex items-center gap-3 group bg-slate-900/50 p-1.5 pr-4 rounded-xl border border-slate-800 hover:border-sky-500 transition-all">
              <div class="bg-sky-500/20 p-2 rounded-lg group-hover:bg-sky-500 transition-colors">
                <LayoutDashboard class="w-4 h-4 text-sky-400 group-hover:text-white" />
              </div>
              <div class="hidden sm:block text-left">
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1">Mi Panel</p>
                <p class="text-xs font-black text-slate-200 group-hover:text-sky-400 transition-colors truncate max-w-[100px]">
                  {{ usuario.email.split('@')[0] }}
                </p>
              </div>
            </router-link>

            <button @click="cerrarSesion" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all border border-red-500/20" title="Cerrar Sesión">
              <LogOut class="w-5 h-5" />
            </button>
          </div>

          <router-link v-else to="/login" class="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-sky-900/20 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <User class="w-4 h-4 relative z-10" />
            <span class="relative z-10">Entrar</span>
          </router-link>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto p-4 mt-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<style>
/* Animación de transición entre páginas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Animación de brillo para el botón Entrar */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}

/* Scrollbar personalizada estilo Geek */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #38bdf8;
}
</style>
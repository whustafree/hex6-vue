<script setup>
import { ref, onMounted } from 'vue'
import { 
  Hexagon, LogOut, User, Layers, Gem, Users, LayoutDashboard, ShieldCheck, Heart 
} from 'lucide-vue-next'
import { supabase } from './supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const usuario = ref(null)

onMounted(() => {
  supabase.auth.getSession().then(({ data }) => {
    usuario.value = data.session?.user ?? null
  })
  supabase.auth.onAuthStateChange((_event, session) => {
    usuario.value = session?.user ?? null
  })
})

const cerrarSesion = async () => {
  await supabase.auth.signOut()
  usuario.value = null
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
    
    <nav class="sticky top-0 z-50 p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div class="max-w-6xl mx-auto flex justify-between items-center gap-2">
        
        <router-link to="/" class="flex items-center gap-2 md:gap-3 group shrink-0">
          <div class="relative flex items-center justify-center">
            <Hexagon class="w-8 h-8 md:w-9 md:h-9 text-sky-400 relative z-10" stroke-width="2.5" />
            <div class="absolute w-2 h-2 bg-purple-400 rounded-full z-20 group-hover:animate-ping"></div>
          </div>
          <div class="flex flex-col -space-y-1">
            <span class="text-xl md:text-2xl font-black italic tracking-tighter">
              HEX<span class="text-sky-400">6</span>
            </span>
            <span class="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Rancagua</span>
          </div>
        </router-link>

        <div class="hidden md:flex items-center gap-6 border-r border-slate-800 pr-6 h-8">
          <router-link to="/tcg" class="nav-link" active-class="text-sky-400"><Layers class="w-3 h-3" /> TCG</router-link>
          <router-link to="/vitrina" class="nav-link" active-class="text-purple-400"><Gem class="w-3 h-3" /> Vitrina</router-link>
          <router-link to="/grupos" class="nav-link" active-class="text-green-400"><Users class="w-3 h-3" /> Grupos</router-link>
          <router-link to="/reglas" class="nav-link" active-class="text-yellow-400"><ShieldCheck class="w-3 h-3" /> Reglas</router-link>
        </div>

        <div class="flex items-center gap-2 md:gap-4">
          
          <router-link to="/favoritos" class="p-2 md:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-pink-500 hover:border-pink-500/50 transition-all">
            <Heart class="w-5 h-5" />
          </router-link>

          <div v-if="usuario" class="flex items-center gap-2">
            <router-link to="/dashboard" class="flex items-center gap-2 bg-slate-900/50 p-1.5 md:pr-4 rounded-xl border border-slate-800 hover:border-sky-500 transition-all">
              <div class="bg-sky-500/20 p-2 rounded-lg">
                <LayoutDashboard class="w-4 h-4 text-sky-400" />
              </div>
              <p class="hidden sm:block text-xs font-black truncate max-w-[80px]">
                {{ usuario.email.split('@')[0] }}
              </p>
            </router-link>
            <button @click="cerrarSesion" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl border border-red-500/20 transition-all">
              <LogOut class="w-5 h-5" />
            </button>
          </div>

          <router-link v-else to="/login" class="btn-entrar">
            <User class="w-4 h-4" />
            <span class="hidden xs:block">Entrar</span>
          </router-link>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto w-full p-4 mt-4 flex-1">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

  </div>
</template>

<style scoped>
.nav-link {
  @apply flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors;
}
.btn-entrar {
  @apply flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 400px) {
  .xs\:block { display: none; }
}
</style>
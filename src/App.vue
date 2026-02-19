<script setup>
import { ref, onMounted } from 'vue'
import { Hexagon, LogOut, User, Layers, Gem, Users } from 'lucide-vue-next'
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
    
    <nav class="sticky top-0 z-50 p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        
        <router-link to="/" class="flex items-center gap-2 text-2xl font-black italic text-sky-400 hover:text-sky-300 transition-colors">
          <Hexagon class="w-8 h-8 text-sky-500" />
          HEX6
        </router-link>

        <div class="flex items-center gap-4 md:gap-8">
          <div class="hidden md:flex gap-6 mr-4 border-r border-slate-800 pr-6">
            <router-link to="/tcg" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-sky-400">
              <Layers class="w-3 h-3" /> TCG
            </router-link>
            <router-link to="/vitrina" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-purple-400">
              <Gem class="w-3 h-3" /> Vitrina
            </router-link>
            <router-link to="/grupos" class="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-tighter transition-colors" active-class="text-green-400">
              <Users class="w-3 h-3" /> Grupos
            </router-link>
          </div>

          <div v-if="usuario" class="flex items-center gap-3">
            <div class="hidden sm:block text-right">
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bienvenido</p>
              <p class="text-xs font-black text-sky-400">{{ usuario.email.split('@')[0] }}</p>
            </div>
            <button @click="cerrarSesion" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2.5 rounded-xl transition-all border border-red-500/20">
              <LogOut class="w-5 h-5" />
            </button>
          </div>

          <router-link v-else to="/login" class="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-sky-900/20">
            <User class="w-4 h-4" />
            Entrar
          </router-link>
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto p-4 mt-6">
      <router-view />
    </main>

  </div>
</template>

<style>
/* Animación suave al cambiar de página */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
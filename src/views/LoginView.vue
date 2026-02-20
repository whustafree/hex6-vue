<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { Hexagon, Mail, Lock, Loader2, KeyRound } from 'lucide-vue-next'
import { showToast } from '../utils/toast'

const router = useRouter()
const modo = ref('login') // 'login', 'register', o 'recuperar'
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleAuth = async () => {
  loading.value = true
  try {
    if (modo.value === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      if (error) throw error
      showToast('¡Bienvenido de vuelta!', 'success')
      router.push('/dashboard')
    } else if (modo.value === 'register') {
      const { error } = await supabase.auth.signUp({ email: email.value, password: password.value })
      if (error) throw error
      showToast('Cuenta creada. Revisa tu correo.', 'success')
    } else if (modo.value === 'recuperar') {
      const { error } = await supabase.auth.resetPasswordForEmail(email.value)
      if (error) throw error
      showToast('Correo de recuperación enviado.', 'success')
      modo.value = 'login'
    }
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 md:mt-20 px-4 animate-in fade-in duration-500">
    <div class="bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      
      <div class="absolute -top-10 -right-10 text-sky-500/10"><Hexagon class="w-40 h-40" /></div>

      <div class="text-center mb-8 relative z-10">
        <Hexagon class="w-12 h-12 text-sky-400 mx-auto mb-4" stroke-width="2" />
        <h2 class="text-3xl font-black italic uppercase text-white tracking-tight">
          {{ modo === 'login' ? 'Bienvenido' : (modo === 'register' ? 'Únete' : 'Recuperar') }}
        </h2>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
          {{ modo === 'login' ? 'Accede a tu cuenta' : (modo === 'register' ? 'Crea tu arsenal' : 'Reestablece tu acceso') }}
        </p>
      </div>

      <form @submit.prevent="handleAuth" class="space-y-4 relative z-10">
        
        <div class="relative">
          <Mail class="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input v-model="email" type="email" placeholder="Correo electrónico" required class="w-full bg-slate-900/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 focus:bg-slate-900 outline-none transition-all font-bold placeholder:text-slate-600">
        </div>
        
        <div v-if="modo !== 'recuperar'" class="relative">
          <Lock class="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input v-model="password" type="password" placeholder="Contraseña secreta" required class="w-full bg-slate-900/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 focus:bg-slate-900 outline-none transition-all font-bold placeholder:text-slate-600">
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-900/50 flex justify-center items-center gap-2 mt-6">
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <span v-else>{{ modo === 'login' ? 'Entrar al Sistema' : (modo === 'register' ? 'Registrarse' : 'Enviar Correo') }}</span>
        </button>

      </form>

      <div class="mt-8 pt-6 border-t border-slate-700/50 text-center space-y-4 relative z-10">
        
        <button v-if="modo === 'login'" @click="modo = 'register'" class="text-sm font-bold text-slate-400 hover:text-white transition-colors block w-full">¿No tienes cuenta? <span class="text-sky-400 uppercase tracking-widest">Regístrate</span></button>
        <button v-if="modo === 'register'" @click="modo = 'login'" class="text-sm font-bold text-slate-400 hover:text-white transition-colors block w-full">¿Ya eres miembro? <span class="text-sky-400 uppercase tracking-widest">Inicia Sesión</span></button>
        
        <button v-if="modo === 'login'" @click="modo = 'recuperar'" class="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-pink-400 transition-colors flex justify-center items-center gap-1 w-full mt-2"><KeyRound class="w-3 h-3"/> Olvidé mi contraseña</button>
        <button v-if="modo === 'recuperar'" @click="modo = 'login'" class="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-sky-400 transition-colors w-full">Volver al Login</button>

      </div>
    </div>
  </div>
</template>
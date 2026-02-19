<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { LogIn, UserPlus, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const cargando = ref(false)
const esLogin = ref(true) // Switch entre Login y Registro

const handleAuth = async () => {
  cargando.value = true
  try {
    const { error } = esLogin.value 
      ? await supabase.auth.signInWithPassword({ email: email.value, password: password.value })
      : await supabase.auth.signUp({ email: email.value, password: password.value })

    if (error) throw error
    
    // Si todo sale bien, vamos al Inicio
    router.push('/')
  } catch (error) {
    alert('Error: ' + error.message)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12 p-8 bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-black italic text-sky-400 uppercase">
        {{ esLogin ? 'Entrar' : 'Crear Cuenta' }}
      </h2>
      <p class="text-slate-400 text-sm mt-2">Accede a la comunidad HEX6</p>
    </div>

    <form @submit.prevent="handleAuth" class="space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Email</label>
        <input v-model="email" type="email" placeholder="tu@email.com" required
          class="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-sky-500 text-white">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Contraseña</label>
        <input v-model="password" type="password" placeholder="••••••••" required
          class="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl focus:outline-none focus:border-sky-500 text-white">
      </div>

      <button type="submit" :disabled="cargando"
        class="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex justify-center items-center gap-2">
        <Loader2 v-if="cargando" class="w-5 h-5 animate-spin" />
        <span v-else>{{ esLogin ? 'Entrar' : 'Registrarme' }}</span>
      </button>
    </form>

    <button @click="esLogin = !esLogin" class="w-full mt-6 text-xs text-slate-500 hover:text-sky-400 transition-colors italic">
      {{ esLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión' }}
    </button>
  </div>
</template>
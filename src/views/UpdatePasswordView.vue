<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { KeyRound, Loader2 } from 'lucide-vue-next'
import { showToast } from '../utils/toast'

const router = useRouter()
const newPassword = ref('')
const loading = ref(false)

const actualizarPassword = async () => {
  if (!newPassword.value) return showToast('Escribe una contraseña', 'error')
  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    if (error) throw error
    
    showToast('¡Contraseña actualizada con éxito!', 'success')
    router.push('/dashboard')
  } catch (error) {
    showToast('Error: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 md:mt-20 px-4 animate-in fade-in duration-500">
    <div class="bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      
      <div class="text-center mb-8 relative z-10">
        <KeyRound class="w-12 h-12 text-sky-400 mx-auto mb-4" />
        <h2 class="text-3xl font-black italic uppercase text-white tracking-tight">Nueva Clave</h2>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Ingresa tu nueva contraseña</p>
      </div>

      <form @submit.prevent="actualizarPassword" class="space-y-4 relative z-10">
        <div class="relative">
          <KeyRound class="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
          <input v-model="newPassword" type="password" placeholder="Escribe tu nueva contraseña" required class="w-full bg-slate-900/50 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:border-sky-500 outline-none transition-all font-bold placeholder:text-slate-600">
        </div>

        <button type="submit" :disabled="loading" class="w-full bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex justify-center items-center gap-2 mt-6">
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <span v-else>Guardar Contraseña</span>
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { User, Phone, MapPin, Save, Loader2, CheckCircle } from 'lucide-vue-next'

const loading = ref(true)
const saving = ref(false)
const success = ref(false)

const perfil = ref({ username: '', whatsapp: '', ciudad: 'Rancagua' })

const getProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('perfiles').select('username, whatsapp, ciudad').eq('id', session.user.id).single()
    if (data) perfil.value = data
  } catch (error) { console.error(error) } 
  finally { loading.value = false }
}

const updateProfile = async () => {
  saving.value = true // CORREGIDO: era saving.ref
  success.value = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('perfiles').upsert({ id: session.user.id, ...perfil.value, updated_at: new Date() })
    if (error) throw error
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (error) { alert(error.message) } 
  finally { saving.value = false }
}

onMounted(getProfile)
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8 pb-20 p-4">
    <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
      <h2 class="text-3xl font-black italic text-sky-400 uppercase">Mi Perfil</h2>
      <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Identidad Geek HEX6</p>
    </div>

    <div v-if="loading" class="text-center py-12"><Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" /></div>

    <form v-else @submit.prevent="updateProfile" class="space-y-6">
      <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
        <label class="text-xs font-black uppercase text-slate-500">Nombre de Usuario</label>
        <input v-model="perfil.username" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500 transition-all font-bold">
      </div>
      <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
        <label class="text-xs font-black uppercase text-slate-500">WhatsApp (Sin +)</label>
        <input v-model="perfil.whatsapp" type="text" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-green-500 transition-all font-bold">
      </div>
      <button type="submit" :disabled="saving" class="w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all" :class="success ? 'bg-green-600' : 'bg-sky-600 hover:bg-sky-500 text-white'">
        <Loader2 v-if="saving" class="w-5 h-5 animate-spin" />
        <CheckCircle v-else-if="success" class="w-5 h-5" />
        <Save v-else class="w-5 h-5" />
        {{ success ? 'Guardado' : 'Guardar Cambios' }}
      </button>
    </form>
  </div>
</template>
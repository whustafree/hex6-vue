<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { User, Phone, MapPin, Save, Loader2, CheckCircle } from 'lucide-vue-next'

const loading = ref(true)
const saving = ref(false)
const success = ref(false)

const perfil = ref({
  username: '',
  whatsapp: '',
  ciudad: 'Rancagua'
})

const getProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from('perfiles')
      .select('username, whatsapp, ciudad')
      .eq('id', session.user.id)
      .single()

    if (data) {
      perfil.value = data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  saving.ref = true
  success.value = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const updates = {
      id: session.user.id,
      ...perfil.value,
      updated_at: new Date()
    }

    const { error } = await supabase.from('perfiles').upsert(updates)
    if (error) throw error
    
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (error) {
    alert('Error al actualizar: ' + error.message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  getProfile()
})
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
    
    <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
      <div class="absolute top-0 right-0 p-8 opacity-10">
        <User class="w-32 h-32 text-white" />
      </div>

      <h2 class="text-3xl font-black italic text-sky-400 uppercase mb-2">Mi Perfil</h2>
      <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Configura tu identidad en HEX6</p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" />
    </div>

    <form v-else @submit.prevent="updateProfile" class="space-y-6">
      <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
        <label class="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
          <User class="w-4 h-4 text-sky-400" /> Nombre de Guerrero / Alias
        </label>
        <input 
          v-model="perfil.username"
          type="text" 
          placeholder="Ej: Gustavo_TCG"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-sky-500 outline-none transition-all"
        >
      </div>

      <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
        <label class="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
          <Phone class="w-4 h-4 text-green-400" /> Tu WhatsApp (Sin el +)
        </label>
        <input 
          v-model="perfil.whatsapp"
          type="text" 
          placeholder="56912345678"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none transition-all"
        >
      </div>

      <div class="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
        <label class="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
          <MapPin class="w-4 h-4 text-purple-400" /> Ciudad
        </label>
        <select 
          v-model="perfil.ciudad"
          class="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-all appearance-none"
        >
          <option>Rancagua</option>
          <option>Machalí</option>
          <option>Graneros</option>
          <option>Doñihue</option>
          <option>Rengo</option>
        </select>
      </div>

      <button 
        type="submit"
        :disabled="saving"
        class="w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg"
        :class="success ? 'bg-green-600 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'"
      >
        <Loader2 v-if="saving" class="w-5 h-5 animate-spin" />
        <CheckCircle v-else-if="success" class="w-5 h-5" />
        <Save v-else class="w-5 h-5" />
        {{ success ? 'Perfil Actualizado' : (saving ? 'Guardando...' : 'Guardar Cambios') }}
      </button>
    </form>

  </div>
</template>
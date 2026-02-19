<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { UserCog, Save, Loader2, ArrowLeft, Smartphone, MapPin } from 'lucide-vue-next'

const cargando = ref(true)
const guardando = ref(false)
const perfil = ref({
  full_name: '',
  phone: '',
  city: 'Rancagua'
})

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Intentar traer datos del perfil
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (data) {
    perfil.value = data
  }
  cargando.value = false
})

const actualizarPerfil = async () => {
  guardando.value = true
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: perfil.value.full_name,
      phone: perfil.value.phone,
      city: perfil.value.city,
      updated_at: new Date()
    })

  if (error) alert("Error: " + error.message)
  else alert("¡Perfil actualizado! Ahora tus formularios se auto-rellenarán.")
  
  guardando.value = false
}
</script>

<template>
  <div class="max-w-xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <router-link to="/dashboard" class="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors font-bold text-sm uppercase">
      <ArrowLeft class="w-4 h-4" /> Volver al Panel
    </router-link>

    <div class="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -mr-16 -mt-16"></div>

      <div class="flex items-center gap-4 mb-8">
        <div class="bg-sky-500/20 p-3 rounded-2xl">
          <UserCog class="w-8 h-8 text-sky-400" />
        </div>
        <div>
          <h2 class="text-2xl font-black italic text-white uppercase">Mi Perfil Geek</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Datos de contacto automáticos</p>
        </div>
      </div>

      <div v-if="cargando" class="py-10 text-center">
        <Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" />
      </div>

      <form v-else @submit.prevent="actualizarPerfil" class="space-y-6">
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Nombre Público</label>
          <input v-model="perfil.full_name" type="text" placeholder="Ej: Gustavo Soto" required
            class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-sky-500 text-white">
        </div>

        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">WhatsApp (Sin +)</label>
          <div class="relative">
            <Smartphone class="absolute left-4 top-4 w-5 h-5 text-slate-600" />
            <input v-model="perfil.phone" type="text" placeholder="56912345678" required
              class="w-full bg-slate-900 border border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:border-sky-500 text-white">
          </div>
        </div>

        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Ciudad Base</label>
          <div class="relative">
            <MapPin class="absolute left-4 top-4 w-5 h-5 text-slate-600" />
            <input v-model="perfil.city" type="text" placeholder="Ej: Rancagua" required
              class="w-full bg-slate-900 border border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:border-sky-500 text-white">
          </div>
        </div>

        <button type="submit" :disabled="guardando"
          class="w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-900/40 flex justify-center items-center gap-3">
          <Loader2 v-if="guardando" class="w-6 h-6 animate-spin" />
          <Save v-else class="w-6 h-6" />
          <span>Guardar Cambios</span>
        </button>
      </form>
    </div>
  </div>
</template>
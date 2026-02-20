<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { showToast } from '../utils/toast'
import { 
  User, Phone, MapPin, Save, Loader2, CheckCircle, 
  MessageSquare, Instagram, Link, Eye, EyeOff, ExternalLink, Star 
} from 'lucide-vue-next'

const loading = ref(true)
const saving = ref(false)
const success = ref(false)

const perfil = ref({ 
  username: '', whatsapp: '', ciudad: 'Rancagua', discord: '', instagram: '', link_grupo: '', mostrar_whatsapp: true, mostrar_redes: true
})

// NUEVO: Variables para tu reputación
const valoraciones = ref([])

const getProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    
    // 1. Cargar datos del perfil
    const { data } = await supabase.from('perfiles').select('*').eq('id', session.user.id).single()
    if (data) perfil.value = { ...perfil.value, ...data }

    // 2. Cargar tus estrellas
    const { data: rep } = await supabase.from('reputacion').select('*').eq('evaluado_id', session.user.id)
    if (rep) valoraciones.value = rep

  } catch (error) { 
    console.error(error) 
  } finally { 
    loading.value = false 
  }
}

// Calcular tu promedio
const promedioReputacion = computed(() => {
  if (valoraciones.value.length === 0) return '0.0'
  const suma = valoraciones.value.reduce((acc, curr) => acc + curr.estrellas, 0)
  return (suma / valoraciones.value.length).toFixed(1)
})

const updateProfile = async () => {
  saving.value = true; success.value = false
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.from('perfiles').upsert({ id: session.user.id, ...perfil.value, updated_at: new Date() })
    if (error) throw error
    
    success.value = true
    showToast('¡Configuración guardada con éxito!', 'success')
    setTimeout(() => { success.value = false }, 3000)
    
  } catch (error) { 
    showToast('Error al guardar: ' + error.message, 'error')
  } finally { 
    saving.value = false 
  }
}

onMounted(getProfile)
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-8 pb-20 p-4 animate-in fade-in duration-500">
    
    <div class="bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
      <div class="relative z-10">
        <h2 class="text-3xl font-black italic text-sky-400 uppercase">Mi Perfil</h2>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Identidad Geek HEX6</p>
      </div>
      
      <div class="flex items-center gap-4 relative z-10 w-full md:w-auto">
        <div class="bg-slate-900 border border-yellow-500/30 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg">
          <Star class="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <div class="flex flex-col">
            <span class="text-white font-black leading-none text-sm">{{ promedioReputacion }} / 5.0</span>
            <span class="text-[9px] text-slate-400 uppercase font-bold">{{ valoraciones.length }} Ventas/Votos</span>
          </div>
        </div>

        <router-link v-if="perfil.username" :to="'/u/' + perfil.username" class="bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-2 justify-center border border-sky-600/30 hover:border-sky-500 h-full">
          <ExternalLink class="w-4 h-4" /> Ver Público
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12"><Loader2 class="w-10 h-10 animate-spin mx-auto text-sky-500" /></div>

    <form v-else @submit.prevent="updateProfile" class="space-y-6">
      
      <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
        <h3 class="text-white font-black uppercase text-sm flex items-center gap-2 border-b border-slate-700 pb-3">
          <User class="w-4 h-4 text-sky-400" /> Datos Principales
        </h3>
        
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase text-slate-500">Nombre de Usuario (Público)</label>
          <input v-model="perfil.username" type="text" placeholder="Ej: Gustavo_Geek" class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-700">
        </div>
        
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase text-slate-500">Ciudad</label>
          <select v-model="perfil.ciudad" class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-all font-bold appearance-none">
            <option>Rancagua</option><option>Machalí</option><option>Graneros</option><option>Doñihue</option>
          </select>
        </div>
        
        <div class="space-y-2">
          <div class="flex justify-between items-center mb-1">
            <label class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><Phone class="w-3 h-3" /> WhatsApp</label>
            <button type="button" @click="perfil.mostrar_whatsapp = !perfil.mostrar_whatsapp" class="text-[10px] font-bold uppercase flex items-center gap-1 transition-colors" :class="perfil.mostrar_whatsapp ? 'text-green-400' : 'text-slate-500'">
              <component :is="perfil.mostrar_whatsapp ? Eye : EyeOff" class="w-3 h-3" />
              {{ perfil.mostrar_whatsapp ? 'Público' : 'Oculto' }}
            </button>
          </div>
          <input v-model="perfil.whatsapp" type="text" placeholder="56912345678" class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-700">
        </div>
      </div>

      <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-6">
        <div class="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 class="text-white font-black uppercase text-sm flex items-center gap-2">
            <Link class="w-4 h-4 text-pink-400" /> Redes y Grupos
          </h3>
          <button type="button" @click="perfil.mostrar_redes = !perfil.mostrar_redes" class="text-[10px] font-bold uppercase flex items-center gap-1 transition-colors" :class="perfil.mostrar_redes ? 'text-green-400' : 'text-slate-500'">
            <component :is="perfil.mostrar_redes ? Eye : EyeOff" class="w-3 h-3" />
            {{ perfil.mostrar_redes ? 'Público' : 'Oculto' }}
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><MessageSquare class="w-3 h-3 text-indigo-400"/> Usuario Discord</label>
            <input v-model="perfil.discord" type="text" placeholder="usuario#1234" class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-700">
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><Instagram class="w-3 h-3 text-pink-500"/> Instagram</label>
            <input v-model="perfil.instagram" type="text" placeholder="@tu_cuenta" class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-700">
          </div>
        </div>
        
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><Link class="w-3 h-3 text-sky-400"/> Link Comunidad (Discord/WhatsApp)</label>
          <input v-model="perfil.link_grupo" type="url" placeholder="https://discord.gg/..." class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-700">
        </div>
      </div>

      <button type="submit" :disabled="saving" class="w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg" :class="success ? 'bg-green-600 shadow-green-900/50' : 'bg-sky-600 hover:bg-sky-500 shadow-sky-900/50 text-white'">
        <Loader2 v-if="saving" class="w-5 h-5 animate-spin" />
        <CheckCircle v-else-if="success" class="w-5 h-5" />
        <Save v-else class="w-5 h-5" />
        {{ success ? 'Perfil Guardado' : 'Guardar Configuración' }}
      </button>
    </form>
  </div>
</template>
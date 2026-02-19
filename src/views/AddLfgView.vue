<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { UserPlus, ArrowLeft, Loader2, Monitor, MapPin } from 'lucide-vue-next'

const router = useRouter()
const cargando = ref(false)

const juego_nombre = ref('')
const tipo = ref('Online')
const lugar = ref('')
const descripcion = ref('')
const telefono = ref('')

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('profiles').select('phone, city').eq('id', user.id).single()
  if (data) {
    telefono.value = data.phone || ''
    lugar.value = data.city || '' // Auto-rellena con la ciudad del perfil
  }
})

const guardarGrupo = async () => {
  cargando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('lfg_posts').insert([{ 
      juego_nombre: juego_nombre.value, tipo: tipo.value, lugar: lugar.value, 
      descripcion: descripcion.value, telefono: telefono.value, user_id: user.id 
    }])
    if (error) throw error
    router.push('/grupos')
  } catch (error) {
    alert('Error: ' + error.message)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-white mb-6 font-bold text-sm uppercase">
      <ArrowLeft class="w-4 h-4" /> Volver
    </button>
    <div class="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl">
      <div class="flex items-center gap-4 mb-8">
        <div class="bg-green-500/20 p-3 rounded-2xl"><UserPlus class="w-8 h-8 text-green-400" /></div>
        <div>
          <h2 class="text-2xl font-black italic text-white uppercase">Crear Grupo LFG</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Busca jugadores</p>
        </div>
      </div>
      <form @submit.prevent="guardarGrupo" class="space-y-6">
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Juego</label>
          <input v-model="juego_nombre" type="text" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Modalidad</label>
            <div class="flex gap-2">
              <button type="button" @click="tipo = 'Online'" :class="tipo === 'Online' ? 'bg-blue-600' : 'bg-slate-900 text-slate-500'" class="flex-1 p-4 rounded-2xl border border-slate-700 font-bold">Online</button>
              <button type="button" @click="tipo = 'Presencial'" :class="tipo === 'Presencial' ? 'bg-green-600' : 'bg-slate-900 text-slate-500'" class="flex-1 p-4 rounded-2xl border border-slate-700 font-bold">Presencial</button>
            </div>
          </div>
          <div>
            <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">{{ tipo === 'Online' ? 'Plataforma' : 'Ciudad' }}</label>
            <input v-model="lugar" type="text" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
          </div>
        </div>
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Descripción</label>
          <textarea v-model="descripcion" rows="3" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white"></textarea>
        </div>
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">WhatsApp</label>
          <input v-model="telefono" type="text" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <button type="submit" :disabled="cargando" class="w-full bg-green-600 hover:bg-green-500 py-5 rounded-2xl font-black uppercase text-white">
          <Loader2 v-if="cargando" class="w-6 h-6 animate-spin mx-auto" />
          <span v-else>Publicar Grupo</span>
        </button>
      </form>
    </div>
  </div>
</template>
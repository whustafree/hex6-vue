<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { PlusCircle, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-vue-next'

const router = useRouter()
const cargando = ref(false)

const titulo = ref('')
const juego = ref('Pokémon')
const precio = ref('')
const imagen_url = ref('')
const telefono = ref('')

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
  if (data) {
    telefono.value = data.phone || ''
  }
})

const guardarCarta = async () => {
  cargando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('tcg_exchange').insert([{ 
      titulo: titulo.value, juego: juego.value, precio: parseInt(precio.value), 
      imagen_url: imagen_url.value, telefono: telefono.value, user_id: user.id 
    }])
    if (error) throw error
    router.push('/tcg')
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
        <div class="bg-sky-500/20 p-3 rounded-2xl"><PlusCircle class="w-8 h-8 text-sky-400" /></div>
        <div>
          <h2 class="text-2xl font-black italic text-white uppercase">Publicar Carta</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Mercado TCG</p>
        </div>
      </div>
      <form @submit.prevent="guardarCarta" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Nombre de la carta</label>
          <input v-model="titulo" type="text" placeholder="Ej: Charizard VMAX" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Juego</label>
          <select v-model="juego" class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
            <option>Pokémon</option><option>Yu-Gi-Oh!</option><option>Magic</option><option>Otros</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Precio</label>
          <input v-model="precio" type="number" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">URL Imagen</label>
          <input v-model="imagen_url" type="url" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">WhatsApp</label>
          <input v-model="telefono" type="text" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <button type="submit" :disabled="cargando" class="md:col-span-2 w-full bg-sky-600 hover:bg-sky-500 py-5 rounded-2xl font-black uppercase text-white">
          <Loader2 v-if="cargando" class="w-6 h-6 animate-spin mx-auto" />
          <span v-else>Publicar Ahora</span>
        </button>
      </form>
    </div>
  </div>
</template>
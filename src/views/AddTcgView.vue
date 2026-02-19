<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { PlusCircle, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-vue-next'

const router = useRouter()
const cargando = ref(false)

// Campos del formulario
const titulo = ref('')
const juego = ref('Pokémon') // Valor por defecto
const precio = ref('')
const imagen_url = ref('')
const telefono = ref('')

const guardarCarta = async () => {
  cargando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('tcg_exchange')
      .insert([
        { 
          titulo: titulo.value, 
          juego: juego.value, 
          precio: parseInt(precio.value), 
          imagen_url: imagen_url.value,
          telefono: telefono.value,
          user_id: user.id 
        }
      ])

    if (error) throw error
    
    alert('¡Carta publicada con éxito!')
    router.push('/tcg') // Redirigir al mercado para verla
  } catch (error) {
    alert('Error al publicar: ' + error.message)
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <button @click="router.back()" class="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors font-bold text-sm uppercase">
      <ArrowLeft class="w-4 h-4" /> Volver
    </button>

    <div class="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl">
      <div class="flex items-center gap-4 mb-8">
        <div class="bg-sky-500/20 p-3 rounded-2xl">
          <PlusCircle class="w-8 h-8 text-sky-400" />
        </div>
        <div>
          <h2 class="text-2xl font-black italic text-white uppercase">Publicar Carta</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Mercado TCG</p>
        </div>
      </div>

      <form @submit.prevent="guardarCarta" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Nombre de la carta</label>
          <input v-model="titulo" type="text" placeholder="Ej: Charizard VMAX Shiny" required
            class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-sky-500 text-white transition-colors">
        </div>

        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Franquicia / Juego</label>
          <select v-model="juego" class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-sky-500 text-white appearance-none cursor-pointer">
            <option>Pokémon</option>
            <option>Yu-Gi-Oh!</option>
            <option>Magic: The Gathering</option>
            <option>Mitos y Leyendas</option>
            <option>Otros</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Precio (CLP)</label>
          <input v-model="precio" type="number" placeholder="Ej: 15000" required
            class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-sky-500 text-white">
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">URL de la Imagen (Link)</label>
          <div class="relative">
            <ImageIcon class="absolute left-4 top-4 w-5 h-5 text-slate-600" />
            <input v-model="imagen_url" type="url" placeholder="https://ejemplo.com/imagen.jpg" required
              class="w-full bg-slate-900 border border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:border-sky-500 text-white">
          </div>
          <p class="text-[10px] text-slate-500 mt-2 italic px-1">* Por ahora usa links de imágenes de internet o Discord.</p>
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Tu WhatsApp (Sin +)</label>
          <input v-model="telefono" type="text" placeholder="56912345678" required
            class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-sky-500 text-white">
        </div>

        <button type="submit" :disabled="cargando"
          class="md:col-span-2 w-full bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-sky-900/40 flex justify-center items-center gap-3">
          <Loader2 v-if="cargando" class="w-6 h-6 animate-spin" />
          <span v-else>Publicar Ahora</span>
        </button>

      </form>
    </div>
  </div>
</template>
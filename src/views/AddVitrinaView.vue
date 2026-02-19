<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { ShoppingCart, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-vue-next'

const router = useRouter()
const cargando = ref(false)

// Campos para la tabla 'colecciones'
const item_nombre = ref('')
const categoria = ref('Figuras')
const precio = ref('')
const imagen_url = ref('')
const telefono = ref('')

const guardarObjeto = async () => {
  cargando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('colecciones')
      .insert([
        { 
          item_nombre: item_nombre.value, 
          categoria: categoria.value, 
          precio: parseInt(precio.value), 
          imagen_url: imagen_url.value,
          telefono: telefono.value,
          user_id: user.id 
        }
      ])

    if (error) throw error
    
    alert('¡Objeto publicado en la Vitrina!')
    router.push('/vitrina')
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
      <ArrowLeft class="w-4 h-4" /> Volver al Panel
    </button>

    <div class="bg-slate-800 rounded-3xl border border-slate-700 p-8 shadow-2xl">
      <div class="flex items-center gap-4 mb-8">
        <div class="bg-purple-500/20 p-3 rounded-2xl">
          <ShoppingCart class="w-8 h-8 text-purple-400" />
        </div>
        <div>
          <h2 class="text-2xl font-black italic text-white uppercase">Vender en Vitrina</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Coleccionables & Hardware</p>
        </div>
      </div>

      <form @submit.prevent="guardarObjeto" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">¿Qué estás vendiendo?</label>
          <input v-model="item_nombre" type="text" placeholder="Ej: PlayStation 5 Slim o Figura Luffy" required
            class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-purple-500 text-white transition-colors">
        </div>

        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Categoría</label>
          <select v-model="categoria" class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-purple-500 text-white appearance-none cursor-pointer">
            <option>Figuras</option>
            <option>Consolas</option>
            <option>Retro</option>
            <option>Manga</option>
            <option>Hardware PC</option>
            <option>Otros</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Precio (CLP)</label>
          <input v-model="precio" type="number" placeholder="Ej: 350000" required
            class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-purple-500 text-white">
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Link de la Imagen</label>
          <div class="relative">
            <ImageIcon class="absolute left-4 top-4 w-5 h-5 text-slate-600" />
            <input v-model="imagen_url" type="url" placeholder="https://link-de-tu-foto.jpg" required
              class="w-full bg-slate-900 border border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:border-purple-500 text-white">
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">WhatsApp de Contacto</label>
          <input v-model="telefono" type="text" placeholder="569XXXXXXXX" required
            class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl focus:outline-none focus:border-purple-500 text-white">
        </div>

        <button type="submit" :disabled="cargando"
          class="md:col-span-2 w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-900/40 flex justify-center items-center gap-3 text-white">
          <Loader2 v-if="cargando" class="w-6 h-6 animate-spin" />
          <span v-else>Publicar en Vitrina</span>
        </button>

      </form>
    </div>
  </div>
</template>
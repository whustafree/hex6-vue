<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { ShoppingCart, ArrowLeft, Loader2, UploadCloud } from 'lucide-vue-next'

const router = useRouter()
const cargando = ref(false)

const item_nombre = ref('')
const categoria = ref('Figuras')
const precio = ref('')
const archivoImagen = ref(null) // Para guardar el archivo
const telefono = ref('')

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase.from('profiles').select('phone').eq('id', user.id).single()
  if (data) {
    telefono.value = data.phone || ''
  }
})

// Función para atrapar el archivo cuando lo seleccionas
const manejarArchivo = (event) => {
  archivoImagen.value = event.target.files[0]
}

const guardarObjeto = async () => {
  if (!archivoImagen.value) {
    alert("Por favor, selecciona una foto del objeto que vendes.")
    return
  }

  cargando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Subir la imagen a Supabase Storage
    const fileExt = archivoImagen.value.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('imagenes_hex6')
      .upload(filePath, archivoImagen.value)

    if (uploadError) throw uploadError

    // 2. Obtener el link público
    const { data: urlData } = supabase.storage
      .from('imagenes_hex6')
      .getPublicUrl(filePath)
      
    const imagen_url = urlData.publicUrl

    // 3. Guardar en la base de datos
    const { error: dbError } = await supabase.from('colecciones').insert([{ 
      item_nombre: item_nombre.value, 
      categoria: categoria.value, 
      precio: parseInt(precio.value), 
      imagen_url: imagen_url, // Usamos la URL que generó Supabase
      telefono: telefono.value, 
      user_id: user.id 
    }])

    if (dbError) throw dbError
    
    // 4. Volver al Panel
    router.push('/dashboard')

  } catch (error) {
    alert('Error al publicar: ' + error.message)
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
        <div class="bg-purple-500/20 p-3 rounded-2xl"><ShoppingCart class="w-8 h-8 text-purple-400" /></div>
        <div>
          <h2 class="text-2xl font-black italic text-white uppercase">Vender en Vitrina</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest">Coleccionables</p>
        </div>
      </div>
      <form @submit.prevent="guardarObjeto" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">¿Qué vendes?</label>
          <input v-model="item_nombre" type="text" placeholder="Ej: PlayStation 5, Figura Luffy..." required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Categoría</label>
          <select v-model="categoria" class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
            <option>Figuras</option><option>Consolas</option><option>Retro</option><option>Manga</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Precio</label>
          <input v-model="precio" type="number" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        
        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">Foto del Objeto</label>
          <div class="relative w-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-purple-500 p-6 rounded-2xl text-center cursor-pointer transition-colors">
            <input type="file" accept="image/*" @change="manejarArchivo" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
            <UploadCloud class="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p class="text-sm font-bold text-slate-400">
              {{ archivoImagen ? archivoImagen.name : 'Haz clic para seleccionar tu foto' }}
            </p>
          </div>
        </div>

        <div class="md:col-span-2">
          <label class="block text-xs font-black text-slate-500 uppercase mb-2 ml-1">WhatsApp</label>
          <input v-model="telefono" type="text" required class="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white">
        </div>
        <button type="submit" :disabled="cargando" class="md:col-span-2 w-full bg-purple-600 hover:bg-purple-500 py-5 rounded-2xl font-black uppercase text-white flex justify-center items-center gap-2">
          <Loader2 v-if="cargando" class="w-6 h-6 animate-spin" />
          <span v-else>Publicar en Vitrina</span>
        </button>
      </form>
    </div>
  </div>
</template>
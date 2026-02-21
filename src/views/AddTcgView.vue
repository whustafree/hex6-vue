<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { ImagePlus, Loader2, Save, X } from 'lucide-vue-next'
import { showToast } from '../utils/toast'
import imageCompression from 'browser-image-compression'

const router = useRouter()
const cargando = ref(false)
const formulario = ref({ titulo: '', precio: '', descripcion: '', telefono: '' })
const archivoImagen = ref(null)
const previsualizacion = ref(null)

const seleccionarImagen = async (event) => {
  const archivoOriginal = event.target.files[0]
  if (!archivoOriginal) return

  // 1. LÍMITE DE TAMAÑO INICIAL (5MB máximo)
  if (archivoOriginal.size > 5 * 1024 * 1024) {
    showToast('La imagen es muy pesada. Máximo 5MB.', 'error')
    event.target.value = ''
    return
  }

  try {
    // 2. MAGIA DE COMPRESIÓN (La baja a máximo 500kb y 1080p)
    const opciones = { maxSizeMB: 0.5, maxWidthOrHeight: 1080, useWebWorker: true }
    const archivoComprimido = await imageCompression(archivoOriginal, opciones)
    
    archivoImagen.value = archivoComprimido
    previsualizacion.value = URL.createObjectURL(archivoComprimido)
  } catch (error) {
    showToast('Error al procesar la imagen', 'error')
  }
}

const limpiarImagen = () => { archivoImagen.value = null; previsualizacion.value = null }

const subirCarta = async () => {
  if (!archivoImagen.value) return showToast('Agrega una foto', 'error')
  cargando.value = true

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    const fileExt = archivoImagen.value.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `tcg/${userData.user.id}/${fileName}`

    // Subir a Storage
    const { error: uploadError } = await supabase.storage.from('items').upload(filePath, archivoImagen.value)
    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage.from('items').getPublicUrl(filePath)

    // Insertar en Base de Datos
    const { error: dbError } = await supabase.from('tcg_exchange').insert([{
        user_id: userData.user.id,
        titulo: formulario.value.titulo,
        precio: formulario.value.precio,
        descripcion: formulario.value.descripcion,
        imagen_url: urlData.publicUrl,
        telefono: formulario.value.telefono,
        estado: 'disponible'
      }])
    if (dbError) throw dbError

    showToast('¡Carta subida con éxito!', 'success')
    router.push('/tcg')
  } catch (error) {
    showToast('Error: ' + error.message, 'error')
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
    <div class="bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-xl backdrop-blur-sm">
      <h2 class="text-2xl font-black italic text-sky-400 uppercase tracking-tight mb-6 flex items-center gap-2">Vender Carta TCG</h2>
      
      <form @submit.prevent="subirCarta" class="space-y-6">
        <div class="space-y-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-widest">Foto de la carta (Max 5MB)</label>
          <div v-if="!previsualizacion" class="relative border-2 border-dashed border-slate-600 rounded-2xl p-10 hover:border-sky-500 transition-all bg-slate-900/50 text-center group">
            <input type="file" accept="image/*" @change="seleccionarImagen" required class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <ImagePlus class="w-10 h-10 mx-auto mb-3 text-slate-500 group-hover:text-sky-400 transition-colors" />
            <p class="text-sm font-bold text-slate-300">Toca para subir una foto</p>
            <p class="text-xs text-slate-500 mt-1">Se optimizará automáticamente</p>
          </div>
          <div v-else class="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-slate-700">
            <img :src="previsualizacion" class="w-full h-full object-cover" />
            <button @click.prevent="limpiarImagen" class="absolute top-3 right-3 bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-xl backdrop-blur-sm shadow-lg transition-all"><X class="w-5 h-5" /></button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Nombre y Edición</label><input v-model="formulario.titulo" type="text" required placeholder="Ej: Charizard Base Set" class="w-full bg-slate-900 border border-slate-700 text-white p-3 md:p-4 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-600 text-sm"></div>
          <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Precio (CLP)</label><input v-model="formulario.precio" type="number" required placeholder="Ej: 15000" class="w-full bg-slate-900 border border-slate-700 text-white p-3 md:p-4 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-600 text-sm"></div>
        </div>
        
        <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tu WhatsApp</label><input v-model="formulario.telefono" type="tel" required placeholder="+56 9 1234 5678" class="w-full bg-slate-900 border border-slate-700 text-white p-3 md:p-4 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-600 text-sm"></div>
        <div class="space-y-1"><label class="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Detalles</label><textarea v-model="formulario.descripcion" rows="4" required placeholder="Estado de la carta, entregas, etc." class="w-full bg-slate-900 border border-slate-700 text-white p-3 md:p-4 rounded-xl outline-none focus:border-sky-500 transition-all font-bold placeholder:text-slate-600 resize-none text-sm"></textarea></div>

        <button type="submit" :disabled="cargando" class="w-full bg-sky-600 hover:bg-sky-500 text-white p-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex justify-center items-center gap-2 mt-4 text-sm disabled:opacity-50">
          <Loader2 v-if="cargando" class="w-5 h-5 animate-spin" />
          <span v-else class="flex items-center gap-2"><Save class="w-5 h-5" /> Publicar Carta</span>
        </button>
      </form>
    </div>
  </div>
</template>
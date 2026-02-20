<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useRouter } from 'vue-router'
import { ImagePlus, Loader2, CheckCircle, ArrowLeft, Gem } from 'lucide-vue-next'

const router = useRouter()
const enviando = ref(false)
const fotos = ref([null, null, null])
const vistasPrevias = ref([null, null, null])

const nuevoItem = ref({
  item_nombre: '',
  categoria: 'Figuras',
  precio: 0,
  descripcion: '',
  telefono: ''
})

const handleFileChange = (e, index) => {
  const file = e.target.files[0]
  if (file) {
    fotos.value[index] = file
    vistasPrevias.value[index] = URL.createObjectURL(file)
  }
}

const subirPublicacion = async () => {
  enviando.value = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return alert('Debes iniciar sesión')

    const urls = [null, null, null]

    for (let i = 0; i < fotos.value.length; i++) {
      if (fotos.value[i]) {
        const file = fotos.value[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${session.user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('items')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('items').getPublicUrl(filePath)
        urls[i] = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('colecciones').insert({
      user_id: session.user.id,
      item_nombre: nuevoItem.value.item_nombre,
      categoria: nuevoItem.value.categoria,
      precio: nuevoItem.value.precio,
      descripcion: nuevoItem.value.descripcion,
      telefono: nuevoItem.value.telefono,
      imagen_url: urls[0],
      imagen_url_2: urls[1],
      imagen_url_3: urls[2]
    })

    if (error) throw error
    router.push('/vitrina')
  } catch (error) {
    alert('Error: ' + error.message)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto pb-20 animate-in fade-in duration-500 p-4">
    <button @click="router.back()" class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-bold uppercase text-xs">
      <ArrowLeft class="w-4 h-4" /> Volver
    </button>

    <div class="bg-slate-800 p-6 md:p-8 rounded-3xl border border-slate-700 shadow-2xl">
      <h2 class="text-2xl md:text-3xl font-black italic text-purple-400 flex items-center gap-3 mb-8 uppercase">
        <Gem class="w-8 h-8" /> Nueva Publicación Vitrina
      </h2>

      <form @submit.prevent="subirPublicacion" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="(n, index) in 3" :key="index" class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-500">Foto {{ index + 1 }} {{ index === 0 ? '(Principal)' : '' }}</label>
            <div 
              @click="$refs['fileInput' + index][0].click()"
              class="h-40 bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition-all overflow-hidden bg-cover bg-center"
              :style="{ backgroundImage: `url(${vistasPrevias[index]})` }"
            >
              <div v-if="!vistasPrevias[index]" class="text-center p-4">
                <ImagePlus class="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span class="text-[10px] text-slate-500 font-bold uppercase">Subir</span>
              </div>
              <input :ref="'fileInput' + index" type="file" class="hidden" accept="image/*" @change="(e) => handleFileChange(e, index)">
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-black uppercase text-slate-500">Nombre</label>
            <input v-model="nuevoItem.item_nombre" type="text" required class="input-hex">
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black uppercase text-slate-500">Categoría</label>
            <select v-model="nuevoItem.categoria" class="input-hex">
              <option>Figuras</option>
              <option>Consolas</option>
              <option>Retro</option>
              <option>Manga</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-black uppercase text-slate-500">Precio</label>
            <input v-model="nuevoItem.precio" type="number" required class="input-hex">
          </div>
          <div class="space-y-2">
            <label class="text-xs font-black uppercase text-slate-500">WhatsApp</label>
            <input v-model="nuevoItem.telefono" type="text" required class="input-hex">
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-black uppercase text-slate-500">Descripción</label>
          <textarea v-model="nuevoItem.descripcion" rows="3" class="input-hex"></textarea>
        </div>

        <button :disabled="enviando" type="submit" class="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2">
          <Loader2 v-if="enviando" class="w-5 h-5 animate-spin" />
          <CheckCircle v-else class="w-5 h-5" />
          {{ enviando ? 'Subiendo...' : 'Publicar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.input-hex {
  @apply w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl focus:border-purple-500 outline-none font-bold;
}
</style>
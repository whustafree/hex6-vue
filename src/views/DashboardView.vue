<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { 
  LayoutDashboard, Layers, Gem, Users, Trash2, Edit, Loader2, PlusCircle, X, Save 
} from 'lucide-vue-next'

const cargando = ref(true)
const activeTab = ref('tcg')

const misCartas = ref([])
const misArticulos = ref([])
const misGrupos = ref([])

// Variables para el Modal de Edición
const modalEdicion = ref(false)
const itemEditando = ref(null)
const tipoEditando = ref('')
const guardando = ref(false)

const cargarMisPublicaciones = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const userId = session.user.id

    const { data: tcg } = await supabase.from('tcg_exchange').select('*').eq('user_id', userId).order('id', { ascending: false })
    if (tcg) misCartas.value = tcg

    const { data: vitrina } = await supabase.from('colecciones').select('*').eq('user_id', userId).order('id', { ascending: false })
    if (vitrina) misArticulos.value = vitrina

    const { data: lfg } = await supabase.from('lfg_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (lfg) misGrupos.value = lfg

  } catch (error) { console.error(error) } 
  finally { cargando.value = false }
}

const formatearPrecio = (precio) => new Intl.NumberFormat('es-CL').format(precio)

// NUEVO: Función para destruir la imagen físicamente del Storage
const destruirImagenStorage = async (url) => {
  if (!url) return
  try {
    // La URL pública es larga, necesitamos extraer solo la parte final: "user_id/nombre_archivo.jpg"
    const rutaBase = 'public/items/'
    const index = url.indexOf(rutaBase)
    if (index !== -1) {
      const rutaArchivo = url.substring(index + rutaBase.length)
      await supabase.storage.from('items').remove([rutaArchivo])
    }
  } catch (error) {
    console.error('Error limpiando imagen:', error)
  }
}

// ACTUALIZADO: Ahora recibe el "item" completo para poder leer sus fotos
const eliminarPublicacion = async (tabla, item, tipo) => {
  if (!confirm('⚠️ ¿Estás seguro de eliminar esta publicación? Se borrarán también las fotos del servidor.')) return
  
  try {
    // 1. Borrar de la base de datos (Texto)
    const { error } = await supabase.from(tabla).delete().eq('id', item.id)
    if (error) throw error

    // 2. Borrar las imágenes del Storage para ahorrar espacio (Solo TCG y Vitrina)
    if (tipo !== 'lfg') {
      if (item.imagen_url) await destruirImagenStorage(item.imagen_url)
      if (item.imagen_url_2) await destruirImagenStorage(item.imagen_url_2)
      if (item.imagen_url_3) await destruirImagenStorage(item.imagen_url_3)
    }

    // 3. Quitar de la pantalla
    if (tipo === 'tcg') misCartas.value = misCartas.value.filter(i => i.id !== item.id)
    if (tipo === 'vitrina') misArticulos.value = misArticulos.value.filter(i => i.id !== item.id)
    if (tipo === 'lfg') misGrupos.value = misGrupos.value.filter(i => i.id !== item.id)

  } catch (error) { alert('Error al eliminar: ' + error.message) }
}

const abrirEdicion = (item, tipo) => {
  itemEditando.value = { ...item }
  tipoEditando.value = tipo
  modalEdicion.value = true
}

const cerrarEdicion = () => {
  modalEdicion.value = false
  itemEditando.value = null
  tipoEditando.value = ''
}

const guardarEdicion = async () => {
  guardando.value = true
  try {
    let tabla = ''
    let datosActualizados = {}

    if (tipoEditando.value === 'tcg') {
      tabla = 'tcg_exchange'
      datosActualizados = { titulo: itemEditando.value.titulo, precio: itemEditando.value.precio, descripcion: itemEditando.value.descripcion, telefono: itemEditando.value.telefono }
    } else if (tipoEditando.value === 'vitrina') {
      tabla = 'colecciones'
      datosActualizados = { item_nombre: itemEditando.value.item_nombre, precio: itemEditando.value.precio, descripcion: itemEditando.value.descripcion, telefono: itemEditando.value.telefono }
    } else if (tipoEditando.value === 'lfg') {
      tabla = 'lfg_posts'
      datosActualizados = { titulo: itemEditando.value.titulo, descripcion: itemEditando.value.descripcion, telefono: itemEditando.value.telefono }
    }

    const { error } = await supabase.from(tabla).update(datosActualizados).eq('id', itemEditando.value.id)
    if (error) throw error

    if (tipoEditando.value === 'tcg') {
      const index = misCartas.value.findIndex(i => i.id === itemEditando.value.id)
      misCartas.value[index] = { ...misCartas.value[index], ...datosActualizados }
    } else if (tipoEditando.value === 'vitrina') {
      const index = misArticulos.value.findIndex(i => i.id === itemEditando.value.id)
      misArticulos.value[index] = { ...misArticulos.value[index], ...datosActualizados }
    } else if (tipoEditando.value === 'lfg') {
      const index = misGrupos.value.findIndex(i => i.id === itemEditando.value.id)
      misGrupos.value[index] = { ...misGrupos.value[index], ...datosActualizados }
    }

    cerrarEdicion()
  } catch (error) { alert('Error al guardar: ' + error.message) } 
  finally { guardando.value = false }
}

onMounted(cargarMisPublicaciones)
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500 max-w-5xl mx-auto p-4">
    
    <div class="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30">
          <LayoutDashboard class="w-8 h-8 text-sky-400" />
        </div>
        <div>
          <h2 class="text-3xl font-black italic text-white uppercase">Centro de Mando</h2>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Administra tus publicaciones</p>
        </div>
      </div>
    </div>

    <div v-if="cargando" class="text-center py-20"><Loader2 class="w-12 h-12 animate-spin mx-auto text-sky-500" /></div>

    <div v-else class="space-y-6">
      
      <div class="flex overflow-x-auto gap-2 p-2 bg-slate-800 border border-slate-700 rounded-2xl snap-x">
        <button @click="activeTab = 'tcg'" :class="activeTab === 'tcg' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'" class="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all snap-center whitespace-nowrap"><Layers class="w-4 h-4" /> TCG ({{ misCartas.length }})</button>
        <button @click="activeTab = 'vitrina'" :class="activeTab === 'vitrina' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'" class="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all snap-center whitespace-nowrap"><Gem class="w-4 h-4" /> Vitrina ({{ misArticulos.length }})</button>
        <button @click="activeTab = 'lfg'" :class="activeTab === 'lfg' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'" class="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all snap-center whitespace-nowrap"><Users class="w-4 h-4" /> Grupos ({{ misGrupos.length }})</button>
      </div>

      <div v-show="activeTab === 'tcg'" class="animate-in slide-in-from-left-4 duration-300">
        <div v-if="misCartas.length === 0" class="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
          <Layers class="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p class="text-slate-500 font-bold uppercase tracking-widest">No tienes cartas a la venta</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in misCartas" :key="item.id" class="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between">
            <div class="flex gap-4 items-start">
              <div class="w-20 h-24 bg-slate-900 rounded-xl bg-cover bg-center shrink-0" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
              <div>
                <span class="text-[9px] bg-slate-900 px-2 py-1 rounded text-slate-400 uppercase font-bold">{{ item.juego }}</span>
                <h4 class="font-bold text-white leading-tight mt-2">{{ item.titulo }}</h4>
                <p class="text-sm text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <button @click="abrirEdicion(item, 'tcg')" class="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-sky-500/20"><Edit class="w-4 h-4" /> Editar</button>
              <button @click="eliminarPublicacion('tcg_exchange', item, 'tcg')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-red-500/20"><Trash2 class="w-4 h-4" /> Borrar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'vitrina'" class="animate-in slide-in-from-left-4 duration-300">
        <div v-if="misArticulos.length === 0" class="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
          <Gem class="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p class="text-slate-500 font-bold uppercase tracking-widest">No tienes artículos en vitrina</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in misArticulos" :key="item.id" class="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between">
            <div class="flex gap-4 items-start">
              <div class="w-20 h-20 bg-slate-900 rounded-xl bg-cover bg-center shrink-0" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
              <div>
                <span class="text-[9px] bg-purple-900/30 text-purple-400 px-2 py-1 rounded uppercase font-bold">{{ item.categoria }}</span>
                <h4 class="font-bold text-white leading-tight mt-2">{{ item.item_nombre }}</h4>
                <p class="text-sm text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <button @click="abrirEdicion(item, 'vitrina')" class="bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-purple-500/20"><Edit class="w-4 h-4" /> Editar</button>
              <button @click="eliminarPublicacion('colecciones', item, 'vitrina')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-red-500/20"><Trash2 class="w-4 h-4" /> Borrar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'lfg'" class="animate-in slide-in-from-left-4 duration-300">
        <div v-if="misGrupos.length === 0" class="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700">
          <Users class="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p class="text-slate-500 font-bold uppercase tracking-widest">No has buscado grupo últimamente</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="item in misGrupos" :key="item.id" class="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between">
            <div>
              <span class="text-[9px] bg-green-900/30 text-green-400 px-2 py-1 rounded uppercase font-bold">{{ item.juego }}</span>
              <h3 class="font-bold text-white mt-2 text-lg">{{ item.titulo }}</h3>
              <p class="text-sm text-slate-400 mt-2 line-clamp-2">{{ item.descripcion }}</p>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <button @click="abrirEdicion(item, 'lfg')" class="bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-green-500/20"><Edit class="w-4 h-4" /> Editar</button>
              <button @click="eliminarPublicacion('lfg_posts', item, 'lfg')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-red-500/20"><Trash2 class="w-4 h-4" /> Borrar</button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="modalEdicion && itemEditando" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        <div class="p-6 border-b border-slate-700 flex justify-between items-center">
          <h3 class="text-xl font-black italic text-white uppercase flex items-center gap-2">
            <Edit class="w-5 h-5 text-sky-400" /> Editar Publicación
          </h3>
          <button @click="cerrarEdicion" class="text-slate-400 hover:text-white"><X class="w-6 h-6" /></button>
        </div>
        
        <form @submit.prevent="guardarEdicion" class="p-6 space-y-4">
          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-500">Título / Nombre</label>
            <input v-if="tipoEditando === 'vitrina'" v-model="itemEditando.item_nombre" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 font-bold">
            <input v-else v-model="itemEditando.titulo" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 font-bold">
          </div>
          
          <div class="grid grid-cols-2 gap-4" v-if="tipoEditando !== 'lfg'">
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase text-slate-500">Precio</label>
              <input v-model="itemEditando.precio" type="number" required class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 font-bold">
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black uppercase text-slate-500">WhatsApp</label>
              <input v-model="itemEditando.telefono" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 font-bold">
            </div>
          </div>

          <div class="space-y-2" v-if="tipoEditando === 'lfg'">
            <label class="text-[10px] font-black uppercase text-slate-500">WhatsApp de Contacto</label>
            <input v-model="itemEditando.telefono" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 font-bold">
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black uppercase text-slate-500">Descripción</label>
            <textarea v-model="itemEditando.descripcion" rows="4" required class="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl outline-none focus:border-sky-500 font-bold"></textarea>
          </div>

          <button type="submit" :disabled="guardando" class="w-full mt-4 bg-sky-600 hover:bg-sky-500 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest shadow-lg transition-all">
            <Loader2 v-if="guardando" class="w-5 h-5 animate-spin" />
            <Save v-else class="w-5 h-5" />
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
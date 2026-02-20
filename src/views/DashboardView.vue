<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import { showToast } from '../utils/toast'
import { 
  LayoutDashboard, Layers, Gem, Users, Trash2, Edit, Loader2, X, Save, UserCog, 
  MessageCircle, Send, CornerDownRight, BellRing, Bookmark, CheckSquare
} from 'lucide-vue-next'

const cargando = ref(true)
const activeTab = ref('mensajes') 
const usuarioEmail = ref('')

const misCartas = ref([]); const misArticulos = ref([]); const misGrupos = ref([]); const misMensajes = ref([])
const modalEdicion = ref(false); const itemEditando = ref(null); const tipoEditando = ref(''); const guardando = ref(false)
const respuestasPendientes = ref({}) 

const cargarMisPublicaciones = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const userId = session.user.id
    usuarioEmail.value = session.user.email

    const { data: tcg } = await supabase.from('tcg_exchange').select('*').eq('user_id', userId).order('id', { ascending: false })
    if (tcg) misCartas.value = tcg

    const { data: vitrina } = await supabase.from('colecciones').select('*').eq('user_id', userId).order('id', { ascending: false })
    if (vitrina) misArticulos.value = vitrina

    const { data: lfg } = await supabase.from('lfg_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (lfg) misGrupos.value = lfg

    const { data: msjs } = await supabase.from('preguntas').select('*').eq('vendedor_id', userId).order('created_at', { ascending: false })
    if (msjs && msjs.length > 0) {
      const userIds = [...new Set(msjs.map(p => p.remitente_id))]
      const { data: perfiles } = await supabase.from('perfiles').select('id, username').in('id', userIds)
      const map = {}
      if(perfiles) perfiles.forEach(p => map[p.id] = p.username)
      misMensajes.value = msjs.map(p => ({ ...p, remitente_nombre: map[p.remitente_id] || 'Usuario' }))
    }
  } catch (error) { console.error(error) } finally { cargando.value = false }
}

const preguntasSinResponder = computed(() => misMensajes.value.filter(m => !m.respuesta).length)

const enviarRespuesta = async (preguntaId) => {
  const texto = respuestasPendientes.value[preguntaId]
  if (!texto || !texto.trim()) return
  try {
    const { error } = await supabase.from('preguntas').update({ respuesta: texto }).eq('id', preguntaId)
    if (error) throw error
    const index = misMensajes.value.findIndex(m => m.id === preguntaId)
    if(index !== -1) misMensajes.value[index].respuesta = texto
    respuestasPendientes.value[preguntaId] = ''
    showToast('Respuesta enviada', 'success')
  } catch(e) { showToast(e.message, 'error') }
}

const formatearPrecio = (precio) => new Intl.NumberFormat('es-CL').format(precio)

const destruirImagenStorage = async (url) => {
  if (!url) return
  try {
    const rutaBase = 'public/items/'
    const index = url.indexOf(rutaBase)
    if (index !== -1) {
      const rutaArchivo = url.substring(index + rutaBase.length)
      await supabase.storage.from('items').remove([rutaArchivo])
    }
  } catch (error) { console.error('Error limpiando imagen:', error) }
}

const eliminarPublicacion = async (tabla, item, tipo) => {
  if (!confirm('⚠️ ¿Estás seguro de borrar esto definitivamente? Se borrarán también las fotos.')) return
  try {
    const { error } = await supabase.from(tabla).delete().eq('id', item.id)
    if (error) throw error
    if (tipo !== 'lfg') {
      if (item.imagen_url) await destruirImagenStorage(item.imagen_url)
      if (item.imagen_url_2) await destruirImagenStorage(item.imagen_url_2)
      if (item.imagen_url_3) await destruirImagenStorage(item.imagen_url_3)
    }
    if (tipo === 'tcg') misCartas.value = misCartas.value.filter(i => i.id !== item.id)
    if (tipo === 'vitrina') misArticulos.value = misArticulos.value.filter(i => i.id !== item.id)
    if (tipo === 'lfg') misGrupos.value = misGrupos.value.filter(i => i.id !== item.id)
    showToast('Publicación eliminada correctamente', 'info')
  } catch (error) { showToast('Error al eliminar: ' + error.message, 'error') }
}

// NUEVO: CAMBIAR ESTADO (Vendido / Reservado / Disponible)
const cambiarEstado = async (tabla, item, nuevoEstado) => {
  try {
    const { error } = await supabase.from(tabla).update({ estado: nuevoEstado }).eq('id', item.id)
    if (error) throw error
    item.estado = nuevoEstado
    if (nuevoEstado === 'vendido') showToast('¡Felicidades por tu venta! Marcado como Vendido.', 'success')
    else if (nuevoEstado === 'reservado') showToast('Artículo apartado correctamente.', 'info')
    else showToast('Artículo disponible nuevamente.', 'success')
  } catch (error) { showToast(error.message, 'error') }
}

const abrirEdicion = (item, tipo) => { itemEditando.value = { ...item }; tipoEditando.value = tipo; modalEdicion.value = true }
const cerrarEdicion = () => { modalEdicion.value = false; itemEditando.value = null; tipoEditando.value = '' }

const guardarEdicion = async () => {
  guardando.value = true
  try {
    let tabla = ''; let datosActualizados = {}
    if (tipoEditando.value === 'tcg') { tabla = 'tcg_exchange'; datosActualizados = { titulo: itemEditando.value.titulo, precio: itemEditando.value.precio, descripcion: itemEditando.value.descripcion, telefono: itemEditando.value.telefono } }
    else if (tipoEditando.value === 'vitrina') { tabla = 'colecciones'; datosActualizados = { item_nombre: itemEditando.value.item_nombre, precio: itemEditando.value.precio, descripcion: itemEditando.value.descripcion, telefono: itemEditando.value.telefono } }
    else if (tipoEditando.value === 'lfg') { tabla = 'lfg_posts'; datosActualizados = { titulo: itemEditando.value.titulo, descripcion: itemEditando.value.descripcion, telefono: itemEditando.value.telefono } }
    
    const { error } = await supabase.from(tabla).update(datosActualizados).eq('id', itemEditando.value.id)
    if (error) throw error
    
    if (tipoEditando.value === 'tcg') { const index = misCartas.value.findIndex(i => i.id === itemEditando.value.id); misCartas.value[index] = { ...misCartas.value[index], ...datosActualizados } }
    else if (tipoEditando.value === 'vitrina') { const index = misArticulos.value.findIndex(i => i.id === itemEditando.value.id); misArticulos.value[index] = { ...misArticulos.value[index], ...datosActualizados } }
    else if (tipoEditando.value === 'lfg') { const index = misGrupos.value.findIndex(i => i.id === itemEditando.value.id); misGrupos.value[index] = { ...misGrupos.value[index], ...datosActualizados } }
    
    cerrarEdicion()
    showToast('Cambios guardados con éxito', 'success')
  } catch (error) { showToast('Error al guardar: ' + error.message, 'error') } finally { guardando.value = false }
}

onMounted(cargarMisPublicaciones)
</script>

<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500 max-w-5xl mx-auto p-4">
    <div class="bg-slate-800/40 p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-sky-500/20 rounded-2xl flex items-center justify-center border border-sky-500/30"><LayoutDashboard class="w-8 h-8 text-sky-400" /></div>
        <div><h2 class="text-3xl font-black italic text-white uppercase">Centro de Mando</h2><p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Sesión: {{ usuarioEmail }}</p></div>
      </div>
      <router-link to="/perfil" class="bg-slate-900 p-4 rounded-2xl border border-slate-700 hover:border-sky-500 transition-all flex items-center gap-2 group shadow-lg">
        <UserCog class="w-5 h-5 text-slate-400 group-hover:text-sky-400" /><span class="text-xs font-black uppercase text-slate-300">Configurar Perfil</span>
      </router-link>
    </div>

    <div v-if="cargando" class="text-center py-20"><Loader2 class="w-12 h-12 animate-spin mx-auto text-sky-500" /></div>
    <div v-else class="space-y-6">
      
      <div class="flex overflow-x-auto gap-2 p-2 bg-slate-800 border border-slate-700 rounded-2xl snap-x">
        <button @click="activeTab = 'mensajes'" :class="activeTab === 'mensajes' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'" class="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all snap-center whitespace-nowrap relative"><MessageCircle class="w-4 h-4" /> Mensajes <span v-if="preguntasSinResponder > 0" class="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px] animate-pulse">{{ preguntasSinResponder }}</span></button>
        <button @click="activeTab = 'tcg'" :class="activeTab === 'tcg' ? 'bg-sky-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'" class="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all snap-center whitespace-nowrap"><Layers class="w-4 h-4" /> TCG</button>
        <button @click="activeTab = 'vitrina'" :class="activeTab === 'vitrina' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'" class="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all snap-center whitespace-nowrap"><Gem class="w-4 h-4" /> Vitrina</button>
        <button @click="activeTab = 'lfg'" :class="activeTab === 'lfg' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'" class="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all snap-center whitespace-nowrap"><Users class="w-4 h-4" /> Grupos</button>
      </div>

      <div v-show="activeTab === 'mensajes'" class="animate-in slide-in-from-left-4 duration-300">
        <div v-if="misMensajes.length === 0" class="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700"><BellRing class="w-12 h-12 mx-auto text-slate-600 mb-4" /><p class="text-slate-500 font-bold uppercase tracking-widest">Tu bandeja está vacía</p></div>
        <div v-else class="space-y-4">
          <div v-for="msj in misMensajes" :key="msj.id" class="bg-slate-800 p-5 rounded-2xl border transition-all" :class="msj.respuesta ? 'border-slate-700 opacity-75' : 'border-orange-500 shadow-lg shadow-orange-900/20'">
            <div class="flex justify-between items-start mb-3"><span class="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded" :class="msj.tipo_item === 'tcg' ? 'bg-sky-500/20 text-sky-400' : 'bg-purple-500/20 text-purple-400'">En {{ msj.tipo_item }}</span><span v-if="!msj.respuesta" class="text-[10px] bg-red-500 text-white px-2 py-1 rounded font-bold uppercase">Sin Responder</span><span v-else class="text-[10px] bg-green-500 text-white px-2 py-1 rounded font-bold uppercase">Respondido</span></div>
            <div class="flex items-center gap-2 mb-2"><User class="w-4 h-4 text-orange-400" /><span class="text-xs font-black uppercase text-orange-400">{{ msj.remitente_nombre }} pregunta:</span></div>
            <p class="text-white text-sm mb-4 bg-slate-900 p-3 rounded-xl border border-slate-700">"{{ msj.pregunta }}"</p>
            <div v-if="msj.respuesta" class="ml-4 pl-4 border-l-2 border-slate-700"><div class="flex items-center gap-2 mb-1"><CornerDownRight class="w-3 h-3 text-slate-500" /><span class="text-[10px] font-black uppercase text-slate-500">Tu respuesta</span></div><p class="text-sm text-slate-400 font-medium italic">{{ msj.respuesta }}</p></div>
            <div v-else class="ml-4 flex gap-2">
              <input v-model="respuestasPendientes[msj.id]" type="text" placeholder="Escribe tu respuesta pública aquí..." class="w-full bg-slate-900 border border-orange-500/50 text-white px-4 py-3 rounded-xl focus:border-orange-500 outline-none text-xs font-bold">
              <button @click="enviarRespuesta(msj.id)" class="bg-orange-600 hover:bg-orange-500 text-white px-4 rounded-xl flex items-center gap-2 text-xs font-black uppercase"><Send class="w-4 h-4"/> Responder</button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'tcg'" class="animate-in slide-in-from-left-4 duration-300">
        <div v-if="misCartas.length === 0" class="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700"><p class="text-slate-500 font-bold uppercase tracking-widest">No tienes cartas a la venta</p></div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in misCartas" :key="item.id" class="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between" :class="{'opacity-50 grayscale': item.estado === 'vendido'}">
            
            <div class="flex gap-4 items-start">
              <div class="w-20 h-24 bg-slate-900 rounded-xl bg-cover bg-center shrink-0 relative" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
              <div class="w-full">
                <div class="mb-2">
                  <span v-if="item.estado === 'reservado'" class="bg-yellow-500 text-slate-900 text-[9px] font-black px-2 py-1 rounded uppercase">Reservado</span>
                  <span v-else-if="item.estado === 'vendido'" class="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded uppercase">Vendido</span>
                  <span v-else class="bg-green-500/20 text-green-400 border border-green-500/20 text-[9px] font-black px-2 py-1 rounded uppercase">Activo</span>
                </div>
                <h4 class="font-bold text-white leading-tight">{{ item.titulo }}</h4>
                <p class="text-sm text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <button v-if="item.estado === 'disponible'" @click="cambiarEstado('tcg_exchange', item, 'reservado')" class="bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-slate-900 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 border border-yellow-500/20"><Bookmark class="w-3 h-3" /> Apartar</button>
              <button v-if="item.estado === 'reservado'" @click="cambiarEstado('tcg_exchange', item, 'disponible')" class="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1">Quitar Reserva</button>
              
              <button v-if="item.estado !== 'vendido'" @click="cambiarEstado('tcg_exchange', item, 'vendido')" class="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 border border-green-500/20"><CheckSquare class="w-3 h-3" /> Marcar Vendido</button>
              <button v-if="item.estado === 'vendido'" @click="cambiarEstado('tcg_exchange', item, 'disponible')" class="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1">Deshacer Venta</button>

              <button v-if="item.estado !== 'vendido'" @click="abrirEdicion(item, 'tcg')" class="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-sky-500/20">Editar</button>
              <button @click="eliminarPublicacion('tcg_exchange', item, 'tcg')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-red-500/20">Borrar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'vitrina'" class="animate-in slide-in-from-left-4 duration-300">
        <div v-if="misArticulos.length === 0" class="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700"><p class="text-slate-500 font-bold uppercase tracking-widest">No tienes artículos</p></div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="item in misArticulos" :key="item.id" class="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex flex-col justify-between" :class="{'opacity-50 grayscale': item.estado === 'vendido'}">
            
            <div class="flex gap-4 items-start">
              <div class="w-20 h-20 bg-slate-900 rounded-xl bg-cover bg-center shrink-0" :style="{ backgroundImage: `url(${item.imagen_url})` }"></div>
              <div class="w-full">
                <div class="mb-2">
                  <span v-if="item.estado === 'reservado'" class="bg-yellow-500 text-slate-900 text-[9px] font-black px-2 py-1 rounded uppercase">Reservado</span>
                  <span v-else-if="item.estado === 'vendido'" class="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded uppercase">Vendido</span>
                  <span v-else class="bg-green-500/20 text-green-400 border border-green-500/20 text-[9px] font-black px-2 py-1 rounded uppercase">Activo</span>
                </div>
                <h4 class="font-bold text-white leading-tight">{{ item.item_nombre }}</h4>
                <p class="text-sm text-green-400 font-black mt-1">${{ formatearPrecio(item.precio) }}</p>
              </div>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2">
              <button v-if="item.estado === 'disponible'" @click="cambiarEstado('colecciones', item, 'reservado')" class="bg-yellow-500/10 hover:bg-yellow-500 text-yellow-500 hover:text-slate-900 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 border border-yellow-500/20"><Bookmark class="w-3 h-3" /> Apartar</button>
              <button v-if="item.estado === 'reservado'" @click="cambiarEstado('colecciones', item, 'disponible')" class="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1">Quitar Reserva</button>
              
              <button v-if="item.estado !== 'vendido'" @click="cambiarEstado('colecciones', item, 'vendido')" class="bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 border border-green-500/20"><CheckSquare class="w-3 h-3" /> Marcar Vendido</button>
              <button v-if="item.estado === 'vendido'" @click="cambiarEstado('colecciones', item, 'disponible')" class="bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1">Deshacer Venta</button>

              <button v-if="item.estado !== 'vendido'" @click="abrirEdicion(item, 'vitrina')" class="bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-purple-500/20">Editar</button>
              <button @click="eliminarPublicacion('colecciones', item, 'vitrina')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all border border-red-500/20">Borrar</button>
            </div>
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'lfg'" class="animate-in slide-in-from-left-4 duration-300">
        <div v-if="misGrupos.length === 0" class="text-center py-20 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700"><p class="text-slate-500 font-bold uppercase tracking-widest">No hay búsquedas</p></div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="item in misGrupos" :key="item.id" class="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between">
            <div><span class="text-[9px] bg-green-900/30 text-green-400 px-2 py-1 rounded uppercase font-bold">{{ item.juego }}</span><h3 class="font-bold text-white mt-2 text-lg">{{ item.titulo }}</h3></div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <button @click="abrirEdicion(item, 'lfg')" class="bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-green-500/20">Editar</button>
              <button @click="eliminarPublicacion('lfg_posts', item, 'lfg')" class="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase transition-all border border-red-500/20">Borrar</button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <div v-if="modalEdicion && itemEditando" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <div class="bg-slate-800 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl">
        <button @click="cerrarEdicion" class="absolute top-6 right-6 text-slate-400 hover:text-white"><X class="w-6 h-6" /></button>
        <h3 class="text-xl font-black text-white uppercase mb-4 flex items-center gap-2"><Edit class="w-5 h-5 text-sky-400" /> Editar Publicación</h3>
        <form @submit.prevent="guardarEdicion" class="space-y-4">
          <input v-if="tipoEditando === 'vitrina'" v-model="itemEditando.item_nombre" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:border-sky-500 outline-none font-bold">
          <input v-else v-model="itemEditando.titulo" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:border-sky-500 outline-none font-bold">
          <div class="grid grid-cols-2 gap-4" v-if="tipoEditando !== 'lfg'">
            <input v-model="itemEditando.precio" type="number" required class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:border-sky-500 outline-none font-bold">
            <input v-model="itemEditando.telefono" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:border-sky-500 outline-none font-bold">
          </div>
          <input v-if="tipoEditando === 'lfg'" v-model="itemEditando.telefono" type="text" required class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:border-sky-500 outline-none font-bold">
          <textarea v-model="itemEditando.descripcion" rows="4" required class="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl focus:border-sky-500 outline-none font-bold"></textarea>
          <button type="submit" class="w-full bg-sky-600 hover:bg-sky-500 text-white p-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg">{{ guardando ? 'Guardando...' : 'Guardar Cambios' }}</button>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { 
  User, MapPin, Phone, MessageSquare, Instagram, Link as LinkIcon, 
  Loader2, ShieldCheck, Ghost, ArrowLeft 
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const perfil = ref(null)
const cargando = ref(true)
const errorMsj = ref(null)

onMounted(async () => {
  // Obtenemos el nombre de usuario desde la URL (ej: /u/Gustavo)
  const usernameParam = route.params.username
  
  try {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('username', usernameParam)
      .single()
    
    if (error) throw error
    perfil.value = data
  } catch (error) {
    errorMsj.value = 'No pudimos encontrar a este jugador en la comunidad.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto pb-20 p-4 animate-in fade-in duration-500">
    <button @click="router.back()" class="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors font-bold uppercase text-xs">
      <ArrowLeft class="w-4 h-4" /> Volver
    </button>

    <div v-if="cargando" class="text-center py-20">
      <Loader2 class="w-12 h-12 animate-spin mx-auto text-sky-500" />
      <p class="text-slate-500 mt-4 font-bold uppercase tracking-widest text-xs">Buscando en la red...</p>
    </div>

    <div v-else-if="errorMsj" class="bg-slate-800 p-10 rounded-3xl border border-slate-700 text-center">
      <Ghost class="w-16 h-16 text-slate-600 mx-auto mb-4" />
      <h2 class="text-2xl font-black text-white uppercase mb-2">Perfil No Encontrado</h2>
      <p class="text-slate-400">{{ errorMsj }}</p>
    </div>

    <div v-else-if="perfil" class="space-y-6">
      <div class="bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl relative">
        <div class="h-32 bg-gradient-to-r from-sky-900 to-purple-900 relative">
          <div class="absolute inset-0 bg-slate-950/20"></div>
        </div>
        
        <div class="px-8 pb-8 relative">
          <div class="w-24 h-24 bg-slate-900 rounded-2xl border-4 border-slate-800 flex items-center justify-center -mt-12 mb-4 shadow-xl">
            <User class="w-12 h-12 text-sky-400" />
          </div>

          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <h1 class="text-3xl font-black italic text-white uppercase flex items-center gap-3">
                {{ perfil.username || 'Usuario Anónimo' }}
                <ShieldCheck class="w-6 h-6 text-green-400" title="Cuenta Verificada" />
              </h1>
              <p class="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-1 mt-1">
                <MapPin class="w-3 h-3" /> {{ perfil.ciudad || 'Rancagua' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-slate-800 p-6 rounded-3xl border border-slate-700 space-y-4 shadow-lg">
        <h3 class="text-white font-black uppercase text-sm border-b border-slate-700 pb-3">Canales de Contacto</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-900 p-4 rounded-2xl border border-slate-700">
            <p class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 mb-2">
              <Phone class="w-3 h-3 text-green-400" /> WhatsApp
            </p>
            <div v-if="perfil.mostrar_whatsapp && perfil.whatsapp">
              <a :href="'https://wa.me/' + perfil.whatsapp" target="_blank" class="text-green-400 font-bold hover:underline break-all">
                +{{ perfil.whatsapp }}
              </a>
            </div>
            <p v-else class="text-slate-500 font-bold text-xs italic">Oculto por privacidad</p>
          </div>

          <div class="bg-slate-900 p-4 rounded-2xl border border-slate-700">
            <p class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 mb-2">
              <MessageSquare class="w-3 h-3 text-indigo-400" /> Discord
            </p>
            <p v-if="perfil.mostrar_redes && perfil.discord" class="text-white font-bold">{{ perfil.discord }}</p>
            <p v-else class="text-slate-500 font-bold text-xs italic">Oculto por privacidad</p>
          </div>

          <div class="bg-slate-900 p-4 rounded-2xl border border-slate-700">
            <p class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 mb-2">
              <Instagram class="w-3 h-3 text-pink-500" /> Instagram
            </p>
            <div v-if="perfil.mostrar_redes && perfil.instagram">
               <a :href="'https://instagram.com/' + perfil.instagram.replace('@', '')" target="_blank" class="text-pink-400 font-bold hover:underline">
                {{ perfil.instagram }}
              </a>
            </div>
            <p v-else class="text-slate-500 font-bold text-xs italic">Oculto por privacidad</p>
          </div>

          <div class="bg-slate-900 p-4 rounded-2xl border border-slate-700">
            <p class="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1 mb-2">
              <LinkIcon class="w-3 h-3 text-sky-400" /> Comunidad / Grupo
            </p>
            <div v-if="perfil.mostrar_redes && perfil.link_grupo">
               <a :href="perfil.link_grupo" target="_blank" class="text-sky-400 font-bold hover:underline text-xs break-all">
                Unirse al Grupo
              </a>
            </div>
            <p v-else class="text-slate-500 font-bold text-xs italic">No especificado</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
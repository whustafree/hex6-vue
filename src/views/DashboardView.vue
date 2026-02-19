<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { PlusCircle, ShoppingCart, UserPlus, UserCog, LayoutDashboard } from 'lucide-vue-next'

const usuario = ref(null)

onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  usuario.value = data.session?.user
})
</script>

<template>
  <div v-if="usuario" class="space-y-8 animate-in fade-in zoom-in duration-500">
    
    <div class="text-center md:text-left border-b border-slate-800 pb-8">
      <h2 class="text-3xl font-black italic text-sky-400 flex items-center justify-center md:justify-start gap-3 uppercase">
        <LayoutDashboard class="w-8 h-8" /> Panel de Control
      </h2>
      <p class="text-slate-500 text-sm mt-2 font-bold uppercase tracking-widest">
        Bienvenido, {{ usuario.email.split('@')[0] }}
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <button class="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-sky-500 transition-all group text-center">
        <PlusCircle class="w-10 h-10 text-sky-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 class="font-bold text-white">Publicar Carta</h3>
        <p class="text-[10px] text-slate-500 mt-1 uppercase">Mercado TCG</p>
      </button>

      <button class="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-purple-500 transition-all group text-center">
        <ShoppingCart class="w-10 h-10 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 class="font-bold text-white">Vender Objeto</h3>
        <p class="text-[10px] text-slate-500 mt-1 uppercase">Vitrina Geek</p>
      </button>

      <button class="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-green-500 transition-all group text-center">
        <UserPlus class="w-10 h-10 text-green-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 class="font-bold text-white">Crear Grupo</h3>
        <p class="text-[10px] text-slate-500 mt-1 uppercase">Squad LFG</p>
      </button>

      <button class="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-slate-400 transition-all group text-center">
        <UserCog class="w-10 h-10 text-slate-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <h3 class="font-bold text-white">Mi Perfil</h3>
        <p class="text-[10px] text-slate-500 mt-1 uppercase">Ajustes Cuenta</p>
      </button>

    </div>

    <div class="bg-slate-800/50 border border-slate-800 rounded-3xl p-12 text-center">
       <p class="text-slate-600 font-bold italic">Aquí aparecerán tus publicaciones activas muy pronto...</p>
    </div>

  </div>
</template>
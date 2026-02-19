<script setup>
import { Hexagon } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
    
    <nav class="sticky top-0 z-50 p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div class="max-w-6xl mx-auto flex justify-between items-center">
        <router-link to="/" class="flex items-center gap-2 text-2xl font-black italic text-sky-400 hover:text-sky-300 transition-colors">
          <Hexagon class="w-8 h-8 text-sky-500" />
          HEX6
        </router-link>

        <div class="flex gap-6">
          <router-link to="/" class="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors" active-class="text-sky-400">Inicio</router-link>
          <router-link to="/tcg" class="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors" active-class="text-sky-400">Mercado TCG</router-link>
          <router-link to="/vitrina" class="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors" active-class="text-purple-400">Vitrina</router-link>
        <router-link to="/grupos" class="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors" active-class="text-green-400">Grupos</router-link>  
        </div>
      </div>
    </nav>

    <main class="max-w-6xl mx-auto p-4 mt-6">
      <router-view />
    </main>

  </div>
</template>
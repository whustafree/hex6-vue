<script setup>
import { ShieldCheck, Info, MapPin, AlertTriangle } from 'lucide-vue-next'
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    <section class="text-center py-8">
      <h2 class="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 uppercase mb-4">
        Reglas y Seguridad
      </h2>
      <p class="text-slate-400 font-bold uppercase tracking-widest text-sm">
        Manteniendo a la comunidad de la Sexta Región segura
      </p>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
        <div class="bg-sky-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
          <ShieldCheck class="text-sky-400 w-6 h-6" />
        </div>
        <h3 class="text-white font-black uppercase mb-2">Respeto Mutuo</h3>
        <p class="text-slate-400 text-sm leading-relaxed">
          HEX6 es un espacio para geeks, coleccionistas y jugadores. Tratémonos con respeto en los mensajes y transacciones. No se permite el acoso ni el spam.
        </p>
      </div>

      <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700">
        <div class="bg-purple-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
          <Info class="text-purple-400 w-6 h-6" />
        </div>
        <h3 class="text-white font-black uppercase mb-2">Publicaciones Reales</h3>
        <p class="text-slate-400 text-sm leading-relaxed">
          Solo sube fotos reales de tus artículos. No uses imágenes de internet para vender. La honestidad es la base de nuestra comunidad.
        </p>
      </div>
    </div>

    <section class="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-xl">
      <h3 class="text-xl font-black italic text-white flex items-center gap-3 mb-6 uppercase">
        <MapPin class="text-green-400" /> Tips para Intercambios en Rancagua
      </h3>
      
      <ul class="space-y-4 text-slate-300">
        <li class="flex gap-4">
          <span class="bg-slate-900 text-sky-400 font-black w-6 h-6 rounded flex items-center justify-center shrink-0">1</span>
          <p>Prioriza juntarte en <strong>lugares públicos</strong>: Mall Plaza América, Portal Rancagua o el centro (Plaza de los Héroes).</p>
        </li>
        <li class="flex gap-4">
          <span class="bg-slate-900 text-sky-400 font-black w-6 h-6 rounded flex items-center justify-center shrink-0">2</span>
          <p>Revisa el artículo detalladamente antes de pagar. En el caso de TCG, verifica el estado de las esquinas y posibles falsificaciones.</p>
        </li>
        <li class="flex gap-4">
          <span class="bg-slate-900 text-sky-400 font-black w-6 h-6 rounded flex items-center justify-center shrink-0">3</span>
          <p>Si el trato parece "demasiado bueno para ser verdad", actúa con precaución.</p>
        </li>
      </ul>
    </section>

    <div class="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-start gap-4">
      <AlertTriangle class="text-red-500 shrink-0" />
      <div>
        <h4 class="text-red-500 font-black uppercase text-xs mb-1">Aviso Importante</h4>
        <p class="text-slate-400 text-xs italic">
          HEX6 es una vitrina de contacto. No procesamos pagos ni envíos. Toda transacción es responsabilidad de los usuarios.
        </p>
      </div>
    </div>

  </div>
</template>
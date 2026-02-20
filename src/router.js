// ... otras importaciones
import RulesView from './views/RulesView.vue'
import FavoritosView from './views/FavoritosView.vue' // <--- Asegúrate que el archivo se llame FavoritosView.vue (con V mayúscula)

const routes = [
  // ... otras rutas
  { path: '/reglas', component: RulesView },
  { path: '/favoritos', component: FavoritosView }
]
// ... resto del archivo
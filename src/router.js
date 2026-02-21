import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './supabase' // <-- IMPORTAMOS SUPABASE PARA REVISAR LA SESIÓN

import HomeView from './views/HomeView.vue'
import TcgView from './views/TcgView.vue'
import ColView from './views/ColView.vue'
import LfgView from './views/LfgView.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import ProfileView from './views/ProfileView.vue'
import AddTcgView from './views/AddTcgView.vue'
import AddVitrinaView from './views/AddVitrinaView.vue'
import AddLfgView from './views/AddLfgView.vue'
import RulesView from './views/RulesView.vue'
import FavoritosView from './views/FavoritosView.vue'
import PublicProfileView from './views/PublicProfileView.vue'
import UpdatePasswordView from './views/UpdatePasswordView.vue'

const routes = [
  // RUTAS PÚBLICAS (Cualquiera puede entrar)
  { path: '/', component: HomeView },
  { path: '/tcg', component: TcgView },
  { path: '/vitrina', component: ColView },
  { path: '/grupos', component: LfgView },
  { path: '/login', component: LoginView },
  { path: '/reglas', component: RulesView },
  { path: '/u/:username', component: PublicProfileView },
  { path: '/update-password', component: UpdatePasswordView },
  
  // RUTAS PRIVADAS (Necesitan sesión iniciada)
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/perfil', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/add-tcg', component: AddTcgView, meta: { requiresAuth: true } },
  { path: '/add-vitrina', component: AddVitrinaView, meta: { requiresAuth: true } },
  { path: '/add-lfg', component: AddLfgView, meta: { requiresAuth: true } },
  { path: '/favoritos', component: FavoritosView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// EL GUARDIA DE SEGURIDAD
router.beforeEach(async (to, from, next) => {
  // Si la ruta a la que quiere ir requiere autenticación...
  if (to.meta.requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    // Si no hay sesión, lo pateamos al login
    if (!session) {
      next('/login')
    } else {
      next() // Si hay sesión, lo dejamos pasar
    }
  } else {
    next() // Si es ruta pública, lo dejamos pasar
  }
})

export default router
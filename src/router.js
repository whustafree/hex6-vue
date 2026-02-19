import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './supabase' // <--- IMPORTANTE: Importamos supabase aquí

// Vistas Públicas
import HomeView from './views/HomeView.vue'
import TcgView from './views/TcgView.vue'
import ColView from './views/ColView.vue'
import LfgView from './views/LfgView.vue'
import LoginView from './views/LoginView.vue'

// Vistas Privadas
import DashboardView from './views/DashboardView.vue'
import ProfileView from './views/ProfileView.vue'
import AddTcgView from './views/AddTcgView.vue'
import AddVitrinaView from './views/AddVitrinaView.vue'
import AddLfgView from './views/AddLfgView.vue'

const routes = [
  // --- RUTAS PÚBLICAS ---
  { path: '/', component: HomeView },
  { path: '/tcg', component: TcgView },
  { path: '/vitrina', component: ColView },
  { path: '/grupos', component: LfgView },
  { path: '/login', component: LoginView },
  
  // --- RUTAS PRIVADAS (Requieren Sesión) ---
  { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/perfil', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/add-tcg', component: AddTcgView, meta: { requiresAuth: true } },
  { path: '/add-vitrina', component: AddVitrinaView, meta: { requiresAuth: true } },
  { path: '/add-lfg', component: AddLfgView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// GUARDIA DE SEGURIDAD (Middleware)
router.beforeEach(async (to, from, next) => {
  // 1. Consultamos a Supabase si hay alguien logueado en este momento
  const { data: { session } } = await supabase.auth.getSession()
  
  // 2. Si la ruta dice "requiresAuth" pero NO hay sesión...
  if (to.meta.requiresAuth && !session) {
    next('/login') // ...lo pateamos al login
  } 
  // 3. Si intenta ir a la página de login pero YA está logueado...
  else if (to.path === '/login' && session) {
    next('/dashboard') // ...lo mandamos a su panel
  } 
  // 4. Si todo está en orden...
  else {
    next() // ...lo dejamos pasar
  }
})

export default router
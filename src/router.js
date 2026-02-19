import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import TcgView from './views/TcgView.vue'
import ColView from './views/ColView.vue' // <--- Importamos la vitrina
import LfgView from './views/LfgView.vue'
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import AddTcgView from './views/AddTcgView.vue' // Importar arriba

const routes = [
  { path: '/', component: HomeView },
  { path: '/tcg', component: TcgView },
  { path: '/vitrina', component: ColView },
  { path: '/grupos', component: LfgView }, // <--- Registramos la ruta
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView },
  { path: '/add-tcg', component: AddTcgView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
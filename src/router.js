import { createRouter, createWebHistory } from 'vue-router'
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

const routes = [
  { path: '/', component: HomeView },
  { path: '/tcg', component: TcgView },
  { path: '/vitrina', component: ColView },
  { path: '/grupos', component: LfgView },
  { path: '/login', component: LoginView },
  { path: '/dashboard', component: DashboardView },
  { path: '/perfil', component: ProfileView },
  { path: '/add-tcg', component: AddTcgView },
  { path: '/add-vitrina', component: AddVitrinaView },
  { path: '/add-lfg', component: AddLfgView },
  { path: '/reglas', component: RulesView },
  { path: '/favoritos', component: FavoritosView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
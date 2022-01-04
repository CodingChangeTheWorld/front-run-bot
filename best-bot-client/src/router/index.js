import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../components/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path:'/:any(.*)',
    redirect:'/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

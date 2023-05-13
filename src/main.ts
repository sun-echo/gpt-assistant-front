import { createApp } from 'vue'
import * as VueRouter from 'vue-router';
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import './style.css'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import MainPage from './components/pages/MainPage.vue'
import EditorPage from './components/pages/EditorPage.vue'


// TODO: 
// Imputs удаление и перенос с main
// Google Auth
// Добавтить недостающее добавляет инпут и там ответ
// Fix disabled buttons onClock handling
const routes = [
  {
    path: '/',
    name: 'MainPage',
    component: MainPage
  },
  {
    path: '/editor',
    name: 'EditorPage',
    component: EditorPage
  },
]

const router = VueRouter.createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: VueRouter.createWebHistory(),
  routes, // short for `routes: routes`
})


const pinia = createPinia()
const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router)
app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

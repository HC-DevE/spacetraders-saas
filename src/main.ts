import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { createQueryClient } from './app/providers/query-client'
import { createAppRouter } from './app/router/index.ts'
import { useAuthStore } from './modules/auth/auth.store'

import './shared/styles/main.css'

const app = createApp(App)

const pinia = createPinia()
const auth = useAuthStore(pinia)

const queryClient = createQueryClient(auth)
const router = createAppRouter(auth)

app.use(pinia)

app.use(VueQueryPlugin, {
  queryClient,
})

app.use(router)

app.mount('#app')

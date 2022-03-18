import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import routes from 'virtual:generated-pages'
import App from './App.vue'
import bootstrap from './bootstrap'
import demandUse from './demandUse'

// import initDebugEgg from '~/plugins/debug'

import '@unocss/reset/tailwind.css'
import './styles/main.css'
import 'uno.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})
app.use(router)

demandUse(app)

// 通过4指长按5s触发彩蛋控制台
// initDebugEgg({
//   points: 4,
//   timeout: 5000,
// })

// 如果有需要，先执行一些获取数据、配置等的操作再挂载应用
;(async() => await bootstrap())()

app.mount('#app')

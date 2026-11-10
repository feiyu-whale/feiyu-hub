/**
 * simple.ts —— 普通版入口
 * 干什么：挂载 SimpleApp（单轨、三步式剪辑）。
 * 依赖：vue、pinia、SimpleApp.vue
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SimpleApp from './SimpleApp.vue'
import './style.css'

createApp(SimpleApp).use(createPinia()).mount('#app')

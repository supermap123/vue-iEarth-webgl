import { createApp, useCssModule } from 'vue'
import App from './App.vue'

import naive from 'naive-ui'

// 引入webgl组件库
import webgl from "vue-webgl"

// 引入iEarth组件（外层包装webgl组件库的组件）
import "@/styles/index.scss"
import comps from "@/components/index.js"


createApp(App).use(naive).use(webgl).use(comps).mount('#app')



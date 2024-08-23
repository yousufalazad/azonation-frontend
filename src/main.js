// import './assets/main.css'
import './assets/styles.css'
import './assets/css/styles.css'



import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'

const app = createApp(App)

app.use(router)

app.mount('#app')

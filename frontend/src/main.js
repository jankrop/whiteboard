import './assets/output.css'

import { createApp } from 'vue'

import App from './App.vue'
import Icon from "@/components/Icon.vue";
import Popup from "@/components/Popup.vue";
import MathjaxInput from "@/components/MathjaxInput.vue";

createApp(App)
    .component('Icon', Icon)
    .component('Popup', Popup)
    .component('MathjaxInput', MathjaxInput)
    .mount('#app')

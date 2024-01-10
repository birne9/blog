import { createApp} from 'vue';
import App from './App.vue';
import pinia from './store';
import router from './router';

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
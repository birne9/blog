import { createApp} from 'vue';
import App from './App.vue';
import pinia from './store';
import router from './router';
import './styles/reset.css'
import 'amfe-flexible'
const app = createApp(App);
// 事件总线 -start
import $Bus from '@/utils/eventBus'
app.config.globalProperties.$Bus = $Bus
//事件总线 -end


app.use(router);
app.use(pinia);
app.mount('#app');
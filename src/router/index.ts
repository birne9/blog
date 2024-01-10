import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';

// 配置路由
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: () => import('../views//home/index.vue'),
        meta: {},
        children: [],
    },
];
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});
router.beforeEach(async (_to, _from, next) => {

    next();
});
router.afterEach((_to) => {
 
});
export default router;

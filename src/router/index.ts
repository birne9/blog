import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';

const LayOut=() => import('../views/layout/index.vue');
// 配置路由
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'home',
        component: LayOut,
        meta: {},
        children: [
            {
                path: '/',
                name: 'index',
                component: () => import('../views/home/index.vue'),
                meta: {
                    title: 'index',
                },
            },
            {
                path: '/about',
                name: 'about',
                component: () => import('../views/about/index.vue'),
                meta: {
                    title: 'about',
                },
            },
            {
                path: '/author',
                name: 'author',
                component: () => import('../views/author/index.vue'),
                meta: {
                    title: 'author',
                },
            },
        ],
    },
    // 文章模块
    {
        path: '/article',
        name: 'article',
        meta: {},
        children: [
            {
                path: '/article/1.html',
                name: 'index1',
                component: () => import('../views/article/index1/index.vue'),
                meta: {
                    title: 'index1',
                },
            },
           
        ],
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

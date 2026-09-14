import { defineStore } from 'pinia'
import pinia from '../index';


// Store 是用 defineStore() 定义的，它的第一个参数要求是一个独一无二的名字
//这个名字 ，也被用作 id ，是必须传入的， Pinia 将用它来连接 store 和 devtools。
//为了养成习惯性的用法，将返回的函数命名为 use... 是一个符合组合式函数风格的约定。
//defineStore() 的第二个参数可接受两类值：Setup 函数或 Option 对象。
export const useAticleStoreHook = defineStore('article', {
    // other options...
    state: () => ({
        directory: [
            {
                title: 'Java 基础(一):基础语法',
                path: '/article/java-basics.html',
                desc: '变量、数据类型、运算符、流程控制、方法与数组',
                type: 'Java 基础',
                date: 'Sep 13,2026',
                coverImg: "",
                id: 2,
            },
            {
                title: 'Java 基础(二):面向对象',
                path: '/article/java-oop.html',
                desc: '类与对象、封装、继承、多态、抽象类与接口',
                type: 'Java 基础',
                date: 'Sep 13,2026',
                coverImg: "",
                id: 3,
            },
            {
                title: 'Java 基础(三):常用API与进阶',
                path: '/article/java-api.html',
                desc: 'String、集合框架、异常、文件IO、多线程入门',
                type: 'Java 基础',
                date: 'Sep 13,2026',
                coverImg: "",
                id: 4,
            },
            {
                title: 'Java 基础(四):泛型、Stream与反射',
                path: '/article/java-advanced.html',
                desc: '泛型、Lambda与Stream、注解、反射',
                type: 'Java 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 5,
            },
            {
                title: 'SQL 基础(一):关系模型与MySQL',
                path: '/article/sql-relational.html',
                desc: '表、主键、外键与索引, 关系数据库核心概念',
                type: 'SQL 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 6,
            },
            {
                title: 'SQL 基础(二):查询数据',
                path: '/article/sql-query.html',
                desc: 'SELECT、条件、投影、排序、分页与聚合',
                type: 'SQL 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 7,
            },
            {
                title: 'SQL 基础(三):多表连接与增删改',
                path: '/article/sql-join.html',
                desc: 'INNER/LEFT JOIN、INSERT、UPDATE、DELETE',
                type: 'SQL 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 8,
            },
            {
                title: 'SQL 基础(四):事务与隔离级别',
                path: '/article/sql-transaction.html',
                desc: 'ACID、脏读/不可重复读/幻读、四种隔离级别',
                type: 'SQL 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 9,
            },
            {
                title: 'SQL 基础(五):索引优化',
                path: '/article/sql-index-opt.html',
                desc: '最左前缀、覆盖索引与回表、EXPLAIN、索引失效场景',
                type: 'SQL 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 10,
            },
            {
                title: 'Vue 基础(一):模板语法与响应式',
                path: '/article/vue-template.html',
                desc: 'ref与reactive、常用指令、事件与v-model',
                type: 'Vue 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 11,
            },
            {
                title: 'Vue 基础(二):组件与通信',
                path: '/article/vue-component.html',
                desc: 'props、emit、插槽与组件拆分',
                type: 'Vue 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 12,
            },
            {
                title: 'Vue 基础(三):计算属性侦听器生命周期',
                path: '/article/vue-computed.html',
                desc: 'computed、watch/watchEffect、生命周期钩子',
                type: 'Vue 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 13,
            },
            {
                title: 'Vue 基础(四):组合式API与工程化',
                path: '/article/vue-composition.html',
                desc: '组合式函数、script setup、路由与Pinia入门',
                type: 'Vue 基础',
                date: 'Sep 14,2026',
                coverImg: "",
                id: 14,
            },
        ],
    }),
    getters: {},
    actions: {},
    persist: {
        key: 'article',
        storage: sessionStorage,
        paths: ['article']
    }
})
export function useArticleStore() {
    return useAticleStoreHook(pinia)
}
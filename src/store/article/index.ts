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
                title: '移动端如何进行适配',
                path: '/article/1.html',
                desc: '移动端适配',
                type: 'CSS',
                date: 'Jan 18,2024',
                coverImg: "",
                id: 1,
            },
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
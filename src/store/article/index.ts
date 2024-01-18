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
                router: '/article/1.html',
                desc: '移动端适配',
                type: 'CSS',
                date: 'Jan 18,2024',
                coverImg: "",
                id: 1,
            }
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
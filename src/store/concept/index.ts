import { defineStore } from 'pinia'
import pinia from '../index';
import { Concept } from '@/views/concept/type';
import { getBookIndex } from '@/views/concept/data';

// Store 是用 defineStore() 定义的，它的第一个参数要求是一个独一无二的名字
//这个名字 ，也被用作 id ，是必须传入的， Pinia 将用它来连接 store 和 devtools。
//为了养成习惯性的用法，将返回的函数命名为 use... 是一个符合组合式函数风格的约定。
//defineStore() 的第二个参数可接受两类值：Setup 函数或 Option 对象。
export const useConceptStoreHook = defineStore('concept', {
    state: () => ({
        // 当前选中的册(1-4), 列表页顶部页签切换
        activeBook: 1,
    }),
    getters: {
        // 目录随 activeBook 变化, 由 getter 派生(轻量索引, 不含课文全文)
        directory(state): Concept[] {
            return getBookIndex(state.activeBook).map((l) => ({
                title: l.title,
                desc: l.titleCn,
                type: `Lesson ${l.lesson}`,
                date: '',
                coverImg: '',
                id: l.lesson,
            }))
        },
    },
    actions: {
        setBook(book: number) {
            if (book >= 1 && book <= 4) {
                this.activeBook = book
            }
        },
    },
})
export function useConceptStore() {
    return useConceptStoreHook(pinia)
}

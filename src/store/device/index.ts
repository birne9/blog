import {defineStore} from 'pinia'



// Store 是用 defineStore() 定义的，它的第一个参数要求是一个独一无二的名字
//这个名字 ，也被用作 id ，是必须传入的， Pinia 将用它来连接 store 和 devtools。
//为了养成习惯性的用法，将返回的函数命名为 use... 是一个符合组合式函数风格的约定。
//defineStore() 的第二个参数可接受两类值：Setup 函数或 Option 对象。
export const useDeviceStoreHook = defineStore('device', {
    // other options...
    state:()=>({
        isMobile:false,
    }),
    getters:{
      isMobileGetter:(state)=> state.isMobile,

    },
    actions:{
      setIsMobile(isMobile:boolean){
          this.isMobile = isMobile
      },
    }
})
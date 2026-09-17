<template>
    <header class="bg-background border-b border-border-soft">
        <div class="flex items-center justify-between h-[90px] px-5 box-border md:h-[144px] md:max-w-[1140px] md:mx-auto">
            <div class="flex items-center">
                <div class="cursor-pointer" @click="skipPage('/')" title="Home">
                    <img class="block h-11 w-11" src="../../../../static/images/wx_avatar.jpg" alt="birne9" />
                </div>
                <nav class="hidden md:flex md:items-center" aria-label="主导航">
                    <div class="md:font-medium md:text-lg md:text-foreground md:ml-[30px] md:cursor-pointer md:transition-colors md:hover:text-primary" @click="skipPage('/')">Home</div>
                    <div class="md:font-medium md:text-lg md:text-foreground md:ml-[30px] md:cursor-pointer md:transition-colors md:hover:text-primary" @click="skipPage('/article')">Article</div>
                    <div class="md:font-medium md:text-lg md:text-foreground md:ml-[30px] md:cursor-pointer md:transition-colors md:hover:text-primary" @click="skipPage('/concept')">Concept</div>
                    <div class="md:font-medium md:text-lg md:text-foreground md:ml-[30px] md:cursor-pointer md:transition-colors md:hover:text-primary" @click="skipPage('/author')">Author</div>
                </nav>
            </div>
            <div class="flex items-center md:hidden">
                <button class="group flex flex-col items-center justify-center gap-[5px] h-11 w-11 p-0 border-0 bg-transparent cursor-pointer [-webkit-tap-highlight-color:transparent]"
                    :class="{ open: menuOpen }" type="button"
                    aria-label="打开菜单" :aria-expanded="menuOpen" @click="toggleMenu">
                    <span class="block h-[2px] w-[22px] bg-foreground transition-transform duration-300 group-[.open]:translate-y-[3.5px] group-[.open]:-rotate-45"></span>
                    <span class="block h-[2px] w-[22px] bg-foreground transition-transform duration-300 group-[.open]:-translate-y-[3.5px] group-[.open]:rotate-45"></span>
                </button>
            </div>
        </div>
        <transition name="menu">
            <div v-if="menuOpen" class="fixed top-[91px] inset-x-0 bottom-0 z-[100] bg-background border-t border-border-soft flex flex-col overflow-y-auto md:hidden">
                <nav class="flex flex-col items-center mt-16" aria-label="移动端导航">
                    <div class="w-full text-center py-[18px] text-2xl font-semibold text-foreground cursor-pointer" @click="skipPage('/')">Home</div>
                    <div class="w-full text-center py-[18px] text-2xl font-semibold text-foreground cursor-pointer" @click="skipPage('/article')">Article</div>
                    <div class="w-full text-center py-[18px] text-2xl font-semibold text-foreground cursor-pointer" @click="skipPage('/concept')">Concept</div>
                    <div class="w-full text-center py-[18px] text-2xl font-semibold text-foreground cursor-pointer" @click="skipPage('/author')">Author</div>
                </nav>
                <div class="mt-auto mb-12 mx-auto w-[calc(100%-40px)] max-w-[400px] bg-primary text-white text-base rounded-full text-center px-5 py-3 box-border">🌈 We are who we choose to be.</div>
            </div>
        </transition>
    </header>
</template>
<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// 移动端菜单开关(≥768px 时菜单由 CSS 隐藏, 内联导航出现)
const menuOpen = ref(false)
const toggleMenu = () => {
    menuOpen.value = !menuOpen.value
}
const skipPage = (path: string) => {
    menuOpen.value = false
    router.push(path)
}
// 菜单打开时锁定页面滚动, 关闭或组件卸载时恢复
watch(menuOpen, (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
})
onBeforeUnmount(() => {
    document.body.style.overflow = ''
})
</script>
<style lang="less" scoped>
/* 菜单出现动画(左上角缩放): 布局已 Tailwind 化, 仅保留 Vue transition 动画钩子 */
.menu-enter-active {
    animation: menu-scale-in 0.3s ease both;
}
.menu-leave-active {
    animation: menu-scale-in 0.2s ease reverse both;
}
@keyframes menu-scale-in {
    0% {
        transform: scale(0.7);
        transform-origin: top right;
        opacity: 0;
    }
    100% {
        transform: scale(1);
        transform-origin: top right;
        opacity: 1;
    }
}
</style>

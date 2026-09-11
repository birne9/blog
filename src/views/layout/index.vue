<template>
    <div>
        <NavBar></NavBar>
        <AppMain></AppMain>
    </div>
</template>
<script setup lang="ts">
import NavBar from './components/NavBar/index.vue';
import AppMain from './components/AppMain/index.vue';
import { isMobileScreen, MOBILE_BREAKPOINT } from '@/utils/index'
import { onMounted, onUnmounted } from 'vue';
import { useDeviceStoreHook } from "@/store/device/index"


//设备store
const deviceStore = useDeviceStoreHook()

// 响应式监听：视口宽度跨越断点时自动切换 PC / 移动端布局
const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
const onMediaChange = (e: MediaQueryListEvent) => {
    deviceStore.setIsMobile(e.matches)
}

onMounted(() => {
    // 初次进入按当前视口宽度判断
    deviceStore.setIsMobile(isMobileScreen())
    mql.addEventListener('change', onMediaChange)
})

onUnmounted(() => {
    mql.removeEventListener('change', onMediaChange)
})

</script>
<style lang="less" scoped></style>
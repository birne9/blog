<template>
    <div>
        <NavBar></NavBar>
        <AppMain></AppMain>
    </div>
</template>
<script setup lang="ts">
import NavBar from './components/NavBar/index.vue';
import AppMain from './components/AppMain/index.vue';
import { isMobileDevice } from '@/utils/index'
import { onMounted } from 'vue';
import { useDeviceStoreHook } from "@/store/device/index"


//设备store
const deviceStore = useDeviceStoreHook()

onMounted(() => {
    if (isMobileDevice()) {
        deviceStore.setIsMobile(true)
    } else {
        deviceStore.setIsMobile(false)
    }
})

</script>
<style lang="less" scoped></style>
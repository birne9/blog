<template>
    <div>
        <navbar-h5 v-if="isMobile"></navbar-h5>
        <navbar-pc v-else></navbar-pc>
    </div>
</template>
<script setup lang="ts">
import NavbarH5 from './navbar-h5.vue';
import NavbarPc from './navbar-pc.vue';
import {  computed } from 'vue';
import { useDeviceStoreHook}  from  "@/store/device/index"

// 获取设备store
const deviceStore=useDeviceStoreHook() 
// 监听设备变化
const isMobile=computed(()=>{
    return deviceStore.isMobile
})

</script>
<style lang="less" scoped>

</style>
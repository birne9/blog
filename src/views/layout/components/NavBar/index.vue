<template>
    <div>
        <navbar-h5 v-if="isMobile"></navbar-h5>
        <navbar-pc v-else></navbar-pc>
    </div>
</template>
<script setup lang="ts">
import navbarH5 from './navbar-h5.vue';
import navbarPc from './navbar-pc.vue';

import { useDeviceStoreHook}  from  "@/store/device/index"

// 获取设备store
const deviceStore=useDeviceStoreHook() 
const isMobile:Boolean=deviceStore.isMobile
</script>
<style lang="less" scoped>

</style>
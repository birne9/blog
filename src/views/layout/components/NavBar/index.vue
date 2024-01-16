<template>
    <div>
        <navbar_h5 v-if="isMobile"></navbar_h5>
        <navbar_pc v-else></navbar_pc>
    </div>
</template>
<script setup lang="ts">
import navbar_h5 from './navbar_h5.vue';
import navbar_pc from './navbar_pc.vue';
import { useDeviceStoreHook}  from  "@/store/device/index"
// 获取设备store
const deviceStore=useDeviceStoreHook() 
const isMobile:Boolean=deviceStore.isMobile
</script>
<style lang="less" scoped>

</style>
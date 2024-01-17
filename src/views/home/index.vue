<template>
  <div>
    <home_h5 v-if='isMobile'></home_h5>
    <home_pc v-else></home_pc>
  </div>
</template>
<script setup lang="ts">
import home_h5 from './home_h5.vue';
import home_pc from './home_pc.vue';
import { useDeviceStoreHook}  from  "@/store/device/index"
// 获取设备store
const deviceStore=useDeviceStoreHook() 
const isMobile:Boolean=deviceStore.isMobile


</script>
<style lang="less" scoped>

</style>
<template>
  <div>
    <home-h5 v-if='isMobile'></home-h5>
    <home-pc v-else></home-pc>
  </div>
</template>
<script setup lang="ts">
import homeH5 from './home-h5.vue';
import homePc from './home-pc.vue';
import { useDeviceStoreHook}  from  "@/store/device/index"
// 获取设备store
const deviceStore=useDeviceStoreHook() 
const isMobile:Boolean=deviceStore.isMobile


</script>
<style lang="less" scoped>

</style>
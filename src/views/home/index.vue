<template>
  <div>
    <home-h5 v-if='isMobile'></home-h5>
    <home-pc v-else></home-pc>
  </div>
</template>
<script setup lang="ts">
import {computed} from 'vue'
import HomeH5 from './home-h5.vue';
import HomePc from './home-pc.vue';
import { useDeviceStoreHook}  from  "@/store/device/index"
// 获取设备store
const deviceStore=useDeviceStoreHook() 
const isMobile =computed(()=>{
    return deviceStore.isMobile
}) 


</script>
<style lang="less" scoped>

</style>
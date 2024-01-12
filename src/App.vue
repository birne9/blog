<template>
    <router-view></router-view>
</template>
<script setup lang="ts">
import { onMounted  } from 'vue'
import { isMobileDevice } from '@/utils/index';
import { useDeviceStoreHook } from '@/store/device';
// 获取设备store
const deviceStore=useDeviceStoreHook()

onMounted(()=>{
  // 设置pc和移动端切换
  deviceStore.setIsMobile(isMobileDevice())
  console.log('app_isMobile',isMobileDevice())

})
</script>
<style lang="less" scoped>

</style>
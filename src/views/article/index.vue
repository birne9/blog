<template >
    <div>
        <index-h5 v-if="isMobile"></index-h5>
        <index-pc v-else></index-pc>
    </div>
</template>
<script setup lang="ts">
import {computed} from 'vue'
import IndexH5 from './index-h5.vue';
import IndexPc from './index-pc.vue';
import { useDeviceStoreHook}  from  "@/store/device/index"
// 获取设备store
const deviceStore=useDeviceStoreHook() 
const isMobile =computed(()=>{
    return deviceStore.isMobile
}) 
</script>
<style lang="less" scoped>
    
</style>
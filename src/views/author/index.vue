<template>
    <div class="author">
        <author-h5 v-if='isMobile'></author-h5>
        <author-pc v-else></author-pc>
    </div>
</template>
<script setup lang="ts">
import {computed} from 'vue'
import authorH5 from './author-h5.vue';
import authorPc from './author-pc.vue';
import { useDeviceStoreHook } from "@/store/device/index"
// 获取设备store
const deviceStore = useDeviceStoreHook()
const isMobile =computed(()=>{
    return deviceStore.isMobile
}) 
</script>
<style lang="less" scoped>
</style>
  
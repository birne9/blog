<template>
    <div>
        <indexH5 v-if="isMobile"></indexH5>
        <indexPC v-else></indexPC>
    </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import indexH5 from './index-h5.vue';
import indexPC from './index-pc.vue';
import { useDeviceStoreHook } from "@/store/device/index"
// 获取设备store
const deviceStore = useDeviceStoreHook()
const isMobile = computed(() => {
    return deviceStore.isMobile
}) 
</script>
<style lang="less" scoped></style>
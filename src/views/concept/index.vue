<template>
    <div class="concept">
        <concept-h5 v-if='isMobile'></concept-h5>
        <concept-pc v-else></concept-pc>
    </div>
</template>
<script setup lang="ts">
import {computed} from 'vue'
import ConceptH5 from './concept-h5.vue';
import ConceptPc from './concept-pc.vue';
import { useDeviceStoreHook } from "@/store/device/index"
// 获取设备store
const deviceStore = useDeviceStoreHook()
const isMobile =computed(()=>{
    return deviceStore.isMobile
}) 
</script>
<style lang="less" scoped>
.concept{
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
  
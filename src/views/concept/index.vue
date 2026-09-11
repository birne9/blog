<template>
    <div class="concept">
        <concept-h5 v-if='isMobile'></concept-h5>
        <concept-pc v-else></concept-pc>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ConceptH5 from './concept-h5.vue';
import ConceptPc from './concept-pc.vue';
import { useDeviceStoreHook } from "@/store/device/index"
import { useConceptStoreHook } from "@/store/concept/index"
// 获取设备store
const deviceStore = useDeviceStoreHook()
const isMobile =computed(()=>{
    return deviceStore.isMobile
}) 
// 深链 ?book=N 恢复页签选中(如详情页返回目录)
const route = useRoute()
const conceptStore = useConceptStoreHook()
onMounted(() => {
    const book = Number(route.query.book)
    if (book >= 1 && book <= 4) {
        conceptStore.setBook(book)
    }
})
</script>
<style lang="less" scoped>
.concept{
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
  
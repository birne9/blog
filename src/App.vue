<template>
    <router-view></router-view>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { isMobileDevice } from './utils/index'
onMounted(()=>{
    console.log(isMobileDevice())
})

</script>
<style lang="less" scoped>

</style>
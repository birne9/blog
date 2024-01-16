<template>
    <router-view></router-view>
</template>
<script setup lang="ts">
import {isMobileDevice} from './utils/index'
import {onMounted } from 'vue'

onMounted(()=>{
    console.log(isMobileDevice())
})
</script>
<style lang="less" scoped>

</style>
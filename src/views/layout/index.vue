<template>
    <div>
        <NavBar></NavBar>
        <AppMain></AppMain>
    </div>
</template>
<script setup lang="ts">
import NavBar from './components/NavBar/index.vue';
import AppMain from './components/AppMain/index.vue';
import {isMobileDevice } from '@/utils/index'
import { onMounted } from 'vue';
onMounted(()=>{
    console.log(isMobileDevice(),'isMobileDevice')
})
</script>
<style lang="less" scoped>
    
</style>
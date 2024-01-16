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
import { onMounted ,onUnmounted } from 'vue';
import { useDeviceStoreHook}  from  "@/store/device/index"


//设备store
const deviceStore = useDeviceStoreHook()

onMounted(()=>{
    window.onresize = ()=>{
        if(isMobileDevice()){
            deviceStore.setIsMobile(true) 
        }else{
            deviceStore.setIsMobile(false) 
        }
    }
   
})
onUnmounted(()=>{
    window.removeEventListener('resize',()=>{
        console.log('移除')
    });
})
</script>
<style lang="less" scoped>
    
</style>
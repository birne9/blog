<template>
    <router-view></router-view>
</template>
<script setup lang="ts">
import { ref, onMounted} from 'vue';
import {isMobileDevice} from './utils/index'
const isMounted:Boolean = ref(false);
onMounted(()=>{
    console.log(isMobileDevice() ? '手机端' : '电脑端')
})
</script>
<style lang="less" scoped>

</style>
<template>
    <div>
        <navbar_h5 v-if="isMobile"></navbar_h5>
        <navbar_pc v-else></navbar_pc>
    </div>
</template>
<script setup lang="ts">
import navbar_h5 from './navbar_h5.vue';
import navbar_pc from './navbar_pc.vue';
import {  ref } from 'vue'

// 获取设备store

const isMobile:Boolean=ref(true)
</script>
<style lang="less" scoped>

</style>
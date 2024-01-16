<template>
  <div>
    <home_h5 v-if='isMobile'></home_h5>
    <home_pc v-else></home_pc>
  </div>
</template>
<script setup lang="ts">
import home_h5 from './home_h5.vue';
import home_pc from './home_pc.vue';
import { ref } from 'vue';


const isMobile:Boolean=ref(true)


</script>
<style lang="less" scoped>

</style>
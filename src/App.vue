<template>
    <router-view></router-view>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
const isMobileDevice=()=>{ 
  const userAgentInfo = navigator.userAgent;
  const mobileAgents = [
    'Android',
    'iPhone',
    'SymbianOS',
    'Windows Phone',
    'iPad',
    'iPod',
  ];
  let flag = false;
  for (let v = 0; v < mobileAgents.length; v++) {
    if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
      flag = true;
      break;
    }
  }
  return flag;
}
onMounted(()=>{
    console.log(isMobileDevice())
})

</script>
<style lang="less" scoped>

</style>
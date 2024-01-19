<template>
  <div>
    <div class="navbar_h5">
      <div class="navbar_h5_left">
        <div class="navbar_h5_left_img" @click="router.push('/')">
          <img src="../../../../static/images/wx_avatar.jpg" alt="" />
        </div>
      </div>
  
      <div class="navbar_h5_right" >
        <div class="navbar_h5_right_search" v-if="false">
          <img src="../../../../static/images/search.png" alt="">
        </div>
        <div :class="['toggle-button', { 'toggle-x': toggleBtn }]" @click="toggleBtn = !toggleBtn">
          <span class="bar"></span>
          <span class="bar"></span>
        </div>
      </div>
    </div>
    <nav-head-h5 v-if="toggleBtn" :toggleBtn="toggleBtn" @changToggle="changToggle"></nav-head-h5>

  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import NavHeadH5 from './nav-head-h5.vue';
const router = useRouter();
import { ref } from "vue";
const toggleBtn = ref(false);
const changToggle=(e:any)=>{
  toggleBtn.value = e;
}
</script>
<style lang="less" scoped>
.navbar_h5 {
  width: 100vw;
  height: 90px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  .navbar_h5_left {
    margin-left: 20px;

    .navbar_h5_left_img {
      img {
        width: 44px;
        height: 44px;
        display: block;
      }
    }

    .navbar_h5_left_one {
      font-weight: 500;
      font-size: 18px;
      color: #000;
      margin-left: 30px;
      cursor: pointer;
    }
  }

  .navbar_h5_right {
    margin-right: 20px;
    display: flex;
    align-items: center;
    .navbar_h5_right_search{
      display: flex;
      align-items: center;
      margin-right: 10px;
      img{
        width: 18px;
        height: 18px;

      }
    }
    .toggle-button {
      width: 25px;
      height: 20px;
    }
    .bar {
      display: block;
      width: 100%;
      height: 2px;
      background-color: #333;
      margin: 6px 0;
      transition: 0.4s;
    }
    .toggle-x .bar:nth-child(1) {
      transform: rotate(-45deg) translate(0px, 6px);
    }
    .toggle-x .bar:nth-child(2) {
      transform: rotate(45deg) translate(0px, -6px);
    }
  }
}
</style>

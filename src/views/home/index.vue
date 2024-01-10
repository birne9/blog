<template>
  <div class="home">
    <div class="home_one">
      <div class="home_avatar">
        <img
          src="../../static/images/avatar.jpeg"
          alt="birne9"
          title="birne9"
        />
      </div>
      <div class="home_desc">🌈 We are who we choose to be.</div>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped>
.home {
  background-image: url("../../static/images/bigsea.jpeg");
  width: 100vw;
  height: 666px;
  background-position: center center;
  object-fit: cover;
  // background-repeat: no-repeat;
  background-size: 100% 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .home_avatar {
    cursor: pointer;
    display: flex;
    justify-content: center;
    img {
      width: 100px;
      height: 100px;
    }
  }
  .home_desc {
    text-align: center;
    color: #fff;
    font-size: 32px;
    font-weight: 600;
    margin-top: 10px;
  }
}
</style>

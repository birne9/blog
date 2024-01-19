<template>
    <div class="home_h5">
      <div class="home_h5_one">
        <div class="home_h5_avatar">
          <img
            src="../../static/images/wx_avatar.jpg"
            alt="birne9"
            title="birne9"
          />
        </div>
        <div class="home_h5_desc">🌈 We are who we choose to be.</div>
      </div>
    </div>
  </template>
  <script setup lang="ts"></script>
  <style lang="less" scoped>
  .home_h5 {
    background-image: url("../../static/images/bigsea.jpeg");
    width: 100vw;
    height: calc(100vh - 90px);
    background-position: center center;
    object-fit: cover;
    // background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    .home_h5_avatar {
      cursor: pointer;
      display: flex;
      justify-content: center;
      img {
        width: 100px;
        height: 100px;
      }
    }
    .home_h5_desc {
      text-align: center;
      color: #fff;
      font-size: 32px;
      font-weight: 600;
      margin-top: 10px;
    }
  }
  </style>
  
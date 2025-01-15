<template>
  <div class="content">
    <div v-for="(item, index) in list" :key="index" class="box" @click="goDetail(item)">
      <div class="box_left">
        <img src="../../static/images/coverImg.jpeg" alt="" />
      </div>
      <div class="box_right">
        <div class="box_right_title">
          <span>{{ item.date }}</span> <span>{{ item.type }}</span>
        </div>
        <div class="box_right_content">{{ item.id }}：{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useConceptStoreHook } from "@/store/concept/index";
import { Concept } from "./type";
// 获取文章仓库数据
const conceptStore = useConceptStoreHook();
// 获取文章列表
const list = computed<Concept[]>(() => {
  return conceptStore.directory;
});

const goDetail = (item: Concept) => {
  router.push({
    path:'/concept/content',
    query:{
      id:item.id
    }
  })
}
</script>
<style lang="less" scoped>
.content {
  width: 1000px;
  margin: 0 auto;

  .box {
    background-color: #f5f5f5;
    box-sizing: border-box;
    padding: 10px 20px;
    display: flex;
    cursor: pointer;
    .box_left {
      display: flex;
      align-items: center;
      img {
        width: 100px;
        height: 100px;
        border-radius: 10px;
      }
      margin-right: 40px;
    }
    .box_right {
      .box_right_title {
        font-size: 18px;
        span:nth-child(1) {
          color: #aaa;
          font-weight: 600;
          margin-right: 10px;
        }
        span:nth-child(2) {
          font-weight: 600;
          color: #fc7e0f;
        }
      }
      .box_right_content {
        font-weight: bold;
        font-size: 18px;
        color: #000;
        margin-top: 10px;
      }
    }
  }
}
</style>

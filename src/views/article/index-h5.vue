<template>
  <div class="article">
    <div v-for="(item, index) in list" :key="index" class="article_box">
      <div class="article_box_left">
        <img src="../../static/images/coverImg.jpeg" alt="" />
      </div>
      <div class="article_box_right">
        <div class="article_box_right_title">
          <span>{{ item.date }}</span> <span>{{ item.type }}</span>
        </div>
        <div class="article_box_right_content">
          {{ item.id }}：{{ item.title }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useAticleStoreHook } from "@/store/article/index";
import { Article } from "./type";
// 获取文章仓库数据
const articleStore = useAticleStoreHook();
// 获取文章列表
const list = computed<Article[]>(() => {
  return articleStore.directory;
});
</script>
<style lang="less" scoped>
.article {
  box-sizing: border-box;
  overflow: hidden;
  padding: 10px;
}
.article_box {
  background-color: #f5f5f5;
  box-sizing: border-box;
  padding: 5px 10px;
  display: flex;
  .article_box_left {
    display: flex;
    align-items: center;
    img {
      width: 80px;
      height: 80px;
      border-radius: 5px;
    }
    margin-right: 20px;
  }
  .article_box_right {
    .article_box_right_title {
      span:nth-child(1) {
        font-size: 12px;
        color: #aaa;
        font-weight: 600;
      }
      span:nth-child(2) {
        font-size: 12px;
        font-weight: 600;
        color: #fc7e0f;
      }
    }
    .article_box_right_content {
      font-weight: bold;
      font-size: 14px;
      color: #000;
    }
  }
}
</style>

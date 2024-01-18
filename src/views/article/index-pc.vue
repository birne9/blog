<template>
  <div class="article_pc">
    <div v-for="(item, index) in list" :key="index" class="article_pc_box">
      <div class="article_pc_box_left">
        <img src="../../static/images/coverImg.jpeg" alt="" />
      </div>
      <div class="article_pc_box_right">
        <div class="article_pc_box_right_title">
          <span>{{ item.date }}</span> <span>{{ item.type }}</span>
        </div>
        <div class="article_pc_box_right_content">
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
.article_pc {
  width: 1000px;
  margin: 0 auto;

  .article_pc_box {
    background-color: #f5f5f5;
    box-sizing: border-box;
    padding: 10px 20px;
    display: flex;
    .article_pc_box_left {
      display: flex;
      align-items: center;
      img {
        width: 100px;
        height: 100px;
        border-radius: 10px;
      }
      margin-right: 40px;
    }
    .article_pc_box_right {
      .article_pc_box_right_title {
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
      .article_pc_box_right_content {
        font-weight: bold;
        font-size: 18px;
        color: #000;
        margin-top: 10px;
      }
    }
  }
}
</style>

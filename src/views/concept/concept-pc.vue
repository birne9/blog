<template>
  <div class="content">
    <div class="tabs">
      <div v-for="b in BOOKS" :key="b.id" class="tab"
        :class="{ active: b.id === conceptStore.activeBook }" @click="switchBook(b.id)">
        {{ b.name }}
      </div>
    </div>
    <div class="head">
      <div class="head_title">{{ currentBook.title }}</div>
      <div class="head_desc">{{ currentBook.desc }}</div>
    </div>
    <div v-for="item in list" :key="item.id" class="box" @click="goDetail(item)">
      <div class="box_left">
        <div class="cover_wrap">
          <LessonCover :lesson="item.id" />
        </div>
      </div>
      <div class="box_right">
        <div class="box_right_title">
          <span>{{ item.type }}</span>
        </div>
        <div class="box_right_content">{{ item.title }}</div>
        <div class="box_right_desc">{{ item.desc }}</div>
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
import { BOOKS } from "./data";
import LessonCover from "./components/LessonCover.vue";
// 获取文章仓库数据
const conceptStore = useConceptStoreHook();
// 当前册元信息
const currentBook = computed(() => {
  return BOOKS.find((b) => b.id === conceptStore.activeBook) || BOOKS[0];
});
// 获取文章列表
const list = computed<Concept[]>(() => {
  return conceptStore.directory;
});

const switchBook = (book: number) => {
  conceptStore.setBook(book);
}

const goDetail = (item: Concept) => {
  router.push({
    path: '/concept/content',
    query: {
      book: conceptStore.activeBook,
      id: item.id
    }
  })
}
</script>
<style lang="less" scoped>
.content {
  width: 1000px;
  margin: 0 auto;
  padding-bottom: 60px;

  .tabs {
    display: flex;
    gap: 12px;
    margin-top: 32px;
    .tab {
      padding: 8px 28px;
      border-radius: 20px;
      background-color: #f5f5f5;
      color: #000;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover {
        background-color: #ececec;
      }
      &.active {
        background-color: #fc7e0f;
        color: #fff;
      }
    }
  }

  .head {
    margin: 28px 0 30px;
    .head_title {
      font-size: 32px;
      font-weight: bold;
      color: #000;
    }
    .head_desc {
      margin-top: 10px;
      font-size: 15px;
      color: #666;
    }
  }

  .box {
    background-color: #f5f5f5;
    box-sizing: border-box;
    padding: 10px 20px;
    display: flex;
    cursor: pointer;
    margin-bottom: 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    &:hover {
      background-color: #ececec;
      transform: translateX(4px);
    }
    .box_left {
      display: flex;
      align-items: center;
      .cover_wrap {
        width: 80px;
        height: 80px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
      }
      margin-right: 30px;
    }
    .box_right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      .box_right_title {
        font-size: 14px;
        span {
          font-weight: 600;
          color: #fc7e0f;
        }
      }
      .box_right_content {
        font-weight: bold;
        font-size: 20px;
        color: #000;
        margin-top: 6px;
      }
      .box_right_desc {
        font-size: 15px;
        color: #666;
        margin-top: 6px;
      }
    }
  }
}
</style>

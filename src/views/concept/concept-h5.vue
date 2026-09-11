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
  width: 100%;
  box-sizing: border-box;
  padding: 0 16px 40px;

  .tabs {
    display: flex;
    gap: 10px;
    margin-top: 20px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    &::-webkit-scrollbar {
      display: none;
    }
    .tab {
      flex-shrink: 0;
      padding: 7px 16px;
      border-radius: 18px;
      background-color: #f5f5f5;
      color: #000;
      font-size: 14px;
      font-weight: 600;
      &:active {
        background-color: #ececec;
      }
      &.active {
        background-color: #fc7e0f;
        color: #fff;
      }
    }
  }

  .head {
    margin: 20px 0 16px;
    .head_title {
      font-size: 24px;
      font-weight: bold;
      color: #000;
    }
    .head_desc {
      margin-top: 8px;
      font-size: 13px;
      color: #666;
    }
  }

  .box {
    background-color: #f5f5f5;
    box-sizing: border-box;
    padding: 10px 14px;
    display: flex;
    cursor: pointer;
    margin-bottom: 10px;
    border-radius: 8px;
    &:active {
      background-color: #ececec;
    }
    .box_left {
      display: flex;
      align-items: center;
      .cover_wrap {
        width: 56px;
        height: 56px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
      }
      margin-right: 14px;
    }
    .box_right {
      display: flex;
      flex-direction: column;
      justify-content: center;
      .box_right_title {
        font-size: 12px;
        span {
          font-weight: 600;
          color: #fc7e0f;
        }
      }
      .box_right_content {
        font-weight: bold;
        font-size: 16px;
        color: #000;
        margin-top: 4px;
      }
      .box_right_desc {
        font-size: 13px;
        color: #666;
        margin-top: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>

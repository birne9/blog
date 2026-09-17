<template>
    <!-- 移动优先: 册页签 + 课程说明 + 课程卡片列表 -->
    <div class="container-page pb-10 md:pb-[60px]">
        <div class="flex gap-[10px] md:gap-3 mt-5 md:mt-8 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="选择册">
            <div v-for="b in BOOKS" :key="b.id" role="tab"
                :aria-selected="b.id === conceptStore.activeBook"
                class="shrink-0 px-4 py-[7px] md:px-7 md:py-2 rounded-full bg-card text-foreground text-sm md:text-[15px] font-semibold cursor-pointer transition-colors active:bg-card-pressed md:hover:bg-card-pressed [&.active]:bg-primary [&.active]:text-white [&.active]:hover:bg-primary [&.active]:active:bg-primary"
                :class="{ active: b.id === conceptStore.activeBook }" @click="switchBook(b.id)">
                {{ b.name }}
            </div>
        </div>
        <div class="mt-5 mb-4 md:mt-7 md:mb-[30px]">
            <div class="text-2xl md:text-[32px] font-bold text-foreground">{{ currentBook.title }}</div>
            <div class="mt-2 md:mt-[10px] text-[13px] md:text-[15px] text-muted">{{ currentBook.desc }}</div>
        </div>
        <div v-for="item in list" :key="item.id" class="flex cursor-pointer mb-[10px] md:mb-3 rounded-card bg-card px-[14px] py-[10px] md:px-5 box-border transition-colors duration-200 active:bg-card-pressed md:transition-[background-color,transform] md:hover:bg-card-pressed md:hover:translate-x-1" @click="goDetail(item)">
            <div class="flex items-center mr-[14px] md:mr-[30px]">
                <div class="h-14 w-14 md:h-20 md:w-20 rounded-card overflow-hidden shrink-0">
                    <LessonCover :lesson="item.id" />
                </div>
            </div>
            <div class="flex flex-col justify-center min-w-0">
                <div class="flex items-center gap-2 text-xs md:text-sm">
                    <span class="font-semibold text-primary">{{ item.type }}</span>
                    <span v-if="item.kind === 'practice'" class="text-xs font-semibold text-accent-muted bg-accent-soft rounded-sm px-[6px] py-[1px]">练习课</span>
                </div>
                <div class="font-bold text-base md:text-xl text-foreground mt-1 md:mt-[6px]">{{ item.title }}</div>
                <div class="text-[13px] md:text-[15px] text-muted mt-1 md:mt-[6px] truncate md:overflow-visible md:text-clip md:whitespace-normal">{{ item.desc }}</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

import { useConceptStoreHook } from "@/store/concept/index";
import { Concept } from "./type";
import { BOOKS } from "./data";
import LessonCover from "./components/LessonCover.vue";
// 获取课程仓库数据
const conceptStore = useConceptStoreHook();
// 当前册元信息
const currentBook = computed(() => {
    return BOOKS.find((b) => b.id === conceptStore.activeBook) || BOOKS[0];
});
// 获取课程列表
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

// 深链 ?book=N 恢复页签选中(如详情页返回目录)
onMounted(() => {
    const book = Number(route.query.book)
    if (book >= 1 && book <= 4) {
        conceptStore.setBook(book)
    }
})
</script>

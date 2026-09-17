<template>
    <!-- 移动优先: 页签 + 文章卡片列表 -->
    <div class="container-page pt-[10px] pb-10 md:pt-5 md:pb-[60px]">
        <div class="flex gap-[10px] md:gap-3 mt-5 md:mt-8 mb-[14px] md:mb-[18px] overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="文章分类">
            <div v-for="t in TABS" :key="t.id" role="tab"
                :aria-selected="t.id === activeCat"
                class="shrink-0 px-4 py-[7px] md:px-7 md:py-2 rounded-full bg-card text-foreground text-sm md:text-[15px] font-semibold cursor-pointer transition-colors active:bg-card-pressed md:hover:bg-card-pressed [&.active]:bg-primary [&.active]:text-white [&.active]:hover:bg-primary [&.active]:active:bg-primary"
                :class="{ active: t.id === activeCat }" @click="activeCat = t.id">
                {{ t.name }}
            </div>
        </div>
        <div v-for="(item, index) in list" :key="index" class="flex items-center cursor-pointer mb-[10px] md:mb-3 rounded-card bg-card px-3 py-[10px] md:px-5 box-border transition-colors active:bg-card-pressed md:hover:bg-card-pressed" @click="goArticleDetail(item.path)">
            <div class="flex items-center shrink-0 mr-[14px] md:mr-10">
                <div class="h-20 w-20 md:h-[100px] md:w-[100px] rounded-card overflow-hidden">
                    <img v-if="item.coverImg" class="block h-full w-full object-cover" :src="item.coverImg" alt="" />
                    <ArticleCover v-else :id="item.id" :type="item.type" />
                </div>
            </div>
            <div class="min-w-0">
                <div class="text-xs md:text-lg">
                    <span class="text-subtle font-semibold mr-[10px]">{{ item.date }}</span> <span class="font-semibold text-primary">{{ item.type }}</span>
                </div>
                <div class="font-bold text-sm md:text-lg text-foreground mt-[6px] md:mt-[10px]">
                    {{ item.id }}：{{ item.title }}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useAticleStoreHook } from "@/store/article/index";
import { Article } from "./type";
import ArticleCover from "./components/ArticleCover.vue";
// 获取文章仓库数据
const articleStore = useAticleStoreHook();

// 前后端分类页签, 前端在前, 全栈收尾
const TABS = [
    { id: 'frontend', name: '前端' },
    { id: 'backend', name: '后端' },
    { id: 'fullstack', name: '全栈' },
] as const
const activeCat = ref<'frontend' | 'backend' | 'fullstack'>('frontend')

// 获取文章列表(按当前页签过滤)
const list = computed<Article[]>(() => {
    return articleStore.directory.filter((item) => item.cat === activeCat.value);
});

// 跳转文章详情页
const goArticleDetail = (path: string) => {
    router.push({
        path
    })
}
</script>

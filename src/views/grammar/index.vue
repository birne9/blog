<template>
    <!-- 移动优先: 标题区 + 章节卡片列表, 沿用 Concept 列表的行卡片模式 -->
    <div class="container-page pb-10 md:pb-[60px]">
        <div class="mt-5 mb-4 md:mt-8 md:mb-[30px]">
            <div class="text-2xl md:text-[32px] font-bold text-foreground">英语语法</div>
            <div class="mt-2 md:mt-[10px] text-[13px] md:text-[15px] text-muted">系统语法体系：词法 → 动词 → 句法，共 {{ chapters.length }} 章</div>
        </div>
        <div v-for="c in chapters" :key="c.chapter" class="flex cursor-pointer mb-[10px] md:mb-3 rounded-card bg-card px-[14px] py-[10px] md:px-5 box-border transition-colors duration-200 active:bg-card-pressed md:transition-[background-color,transform] md:hover:bg-card-pressed md:hover:translate-x-1" @click="goDetail(c)">
            <div class="flex items-center mr-[14px] md:mr-[30px]">
                <div class="h-14 w-14 md:h-20 md:w-20 rounded-card overflow-hidden shrink-0 bg-primary flex items-center justify-center">
                    <span class="text-white font-bold text-xl md:text-[28px]">{{ c.chapter }}</span>
                </div>
            </div>
            <div class="flex flex-col justify-center min-w-0">
                <div class="flex items-center gap-2 text-xs md:text-sm">
                    <span class="font-semibold text-primary">{{ c.group }}</span>
                    <span class="text-xs text-subtle">Chapter {{ c.chapter }}</span>
                </div>
                <div class="font-bold text-base md:text-xl text-foreground mt-1 md:mt-[6px]">{{ c.title }}<span class="ml-2 text-[13px] md:text-sm font-medium text-subtle">{{ c.titleEn }}</span></div>
                <div class="text-[13px] md:text-[15px] text-muted mt-1 md:mt-[6px] truncate md:overflow-visible md:text-clip md:whitespace-normal">{{ c.desc }}</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { loadChapters, GrammarChapter } from "./data";

const router = useRouter();
const chapters = ref<GrammarChapter[]>([]);
loadChapters().then((data) => {
    chapters.value = data;
});

const goDetail = (c: GrammarChapter) => {
    router.push({
        path: '/grammar/content',
        query: { chapter: c.chapter }
    });
}
</script>

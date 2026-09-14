<template>
    <div class="article_list container">
        <div class="tabs" role="tablist" aria-label="文章分类">
            <div v-for="t in TABS" :key="t.id" class="tab" role="tab"
                :aria-selected="t.id === activeCat"
                :class="{ active: t.id === activeCat }" @click="activeCat = t.id">
                {{ t.name }}
            </div>
        </div>
        <div v-for="(item, index) in list" :key="index" class="article_box" @click="goArticleDetail(item.path)">
            <div class="article_box_left">
                <img v-if="item.coverImg" :src="item.coverImg" alt="" />
                <ArticleCover v-else :id="item.id" :type="item.type" />
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
<style lang="less" scoped>
/* 移动优先 */
.article_list {
    padding-top: 10px;
    padding-bottom: 40px;

    .tabs {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        margin-bottom: 14px;
        /* 窄屏页签可横向滑动 */
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
            cursor: pointer;
            transition: background-color 0.2s ease;
            &:active {
                background-color: #ececec;
            }
            &.active {
                background-color: #fc7e0f;
                color: #fff;
            }
        }
    }

    .article_box {
        background-color: #f5f5f5;
        box-sizing: border-box;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        cursor: pointer;
        margin-bottom: 10px;
        border-radius: 8px;
        transition: background-color 0.2s ease;

        &:active {
            background-color: #ececec;
        }

        .article_box_left {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            margin-right: 14px;

            img,
            .article_cover {
                width: 80px;
                height: 80px;
                border-radius: 8px;
                display: block;
            }
        }

        .article_box_right {
            min-width: 0;

            .article_box_right_title {
                font-size: 12px;
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

            .article_box_right_content {
                font-weight: bold;
                font-size: 14px;
                color: #000;
                margin-top: 6px;
            }
        }
    }
}

/* ≥768px: 桌面布局(容器限宽居中, 封面放大) */
@media (min-width: 768px) {
    .article_list {
        padding-top: 20px;
        padding-bottom: 60px;

        .tabs {
            gap: 12px;
            margin-top: 32px;
            margin-bottom: 18px;

            .tab {
                padding: 8px 28px;
                border-radius: 20px;
                font-size: 15px;
                &:hover {
                    background-color: #ececec;
                }
                &.active:hover {
                    background-color: #fc7e0f;
                }
            }
        }

        .article_box {
            padding: 10px 20px;
            margin-bottom: 12px;
            border-radius: 10px;

            &:hover {
                background-color: #ececec;
            }

            .article_box_left {
                margin-right: 40px;

                img,
                .article_cover {
                    width: 100px;
                    height: 100px;
                    border-radius: 10px;
                }
            }

            .article_box_right {
                .article_box_right_title {
                    font-size: 18px;
                }

                .article_box_right_content {
                    font-size: 18px;
                    margin-top: 10px;
                }
            }
        }
    }
}
</style>

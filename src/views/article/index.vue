<template>
    <div class="article_list container">
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
import { computed } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

import { useAticleStoreHook } from "@/store/article/index";
import { Article } from "./type";
import ArticleCover from "./components/ArticleCover.vue";
// 获取文章仓库数据
const articleStore = useAticleStoreHook();
// 获取文章列表
const list = computed<Article[]>(() => {
    return articleStore.directory;
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

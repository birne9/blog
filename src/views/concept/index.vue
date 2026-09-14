<template>
    <div class="content container">
        <div class="tabs" role="tablist" aria-label="选择册">
            <div v-for="b in BOOKS" :key="b.id" class="tab" role="tab"
                :aria-selected="b.id === conceptStore.activeBook"
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
<style lang="less" scoped>
/* 移动优先 */
.content {
    padding-bottom: 40px;

    .tabs {
        display: flex;
        gap: 10px;
        margin-top: 20px;
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
        transition: background-color 0.2s ease;
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
            min-width: 0;
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

/* ≥768px: 桌面布局 */
@media (min-width: 768px) {
    .content {
        padding-bottom: 60px;

        .tabs {
            gap: 12px;
            margin-top: 32px;

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

        .head {
            margin: 28px 0 30px;
            .head_title {
                font-size: 32px;
            }
            .head_desc {
                margin-top: 10px;
                font-size: 15px;
            }
        }

        .box {
            padding: 10px 20px;
            margin-bottom: 12px;
            transition: background-color 0.2s ease, transform 0.2s ease;
            &:hover {
                background-color: #ececec;
                transform: translateX(4px);
            }
            &:active {
                background-color: #ececec;
            }
            .box_left {
                .cover_wrap {
                    width: 80px;
                    height: 80px;
                    border-radius: 10px;
                }
                margin-right: 30px;
            }
            .box_right {
                .box_right_title {
                    font-size: 14px;
                }
                .box_right_content {
                    font-size: 20px;
                    margin-top: 6px;
                }
                .box_right_desc {
                    font-size: 15px;
                    margin-top: 6px;
                    overflow: visible;
                    text-overflow: clip;
                    white-space: normal;
                }
            }
        }
    }
}
</style>

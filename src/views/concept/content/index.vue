<template>
    <div class="lesson" v-if="lesson">
        <div class="nav_top">
            <div class="back" @click="goList">← 返回目录</div>
        </div>
        <div class="card">
            <div class="card_head">
                <div class="card_num">Lesson {{ lesson.lesson }}</div>
                <div class="card_title">{{ lesson.title }}</div>
                <div class="card_title_cn" v-if="lesson.titleCn">{{ lesson.titleCn }}</div>
            </div>

            <div class="section" v-if="lesson.en.length">
                <div class="section_label">课文</div>
                <div class="en_block">
                    <p v-for="(line, i) in lesson.en" :key="i">{{ line }}</p>
                </div>
            </div>

            <div class="section" v-if="lesson.zh.length">
                <div class="section_label">参考译文</div>
                <div class="zh_block">
                    <p v-for="(line, i) in lesson.zh" :key="i">{{ line }}</p>
                </div>
            </div>

            <div class="section" v-if="lesson.words.length">
                <div class="section_label">生词和短语</div>
                <div class="words_grid">
                    <div class="word_item" v-for="(w, i) in lesson.words" :key="i">
                        <div class="word_en">{{ w.en }}</div>
                        <div class="word_cn">{{ w.cn }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="nav_bottom">
            <div class="nav_btn" :class="{ disabled: !hasPrev }" @click="goLesson(lesson.lesson - 2)">
                ← 上一篇
            </div>
            <div class="nav_btn" :class="{ disabled: !hasNext }" @click="goLesson(lesson.lesson + 2)">
                下一篇 →
            </div>
        </div>
    </div>
    <div class="lesson_not_found" v-else>
        <div class="msg">没有找到这篇课文</div>
        <div class="back" @click="goList">← 返回目录</div>
    </div>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import lessonsData from '../lessons.json'
import { Lesson } from '../type';

const lessons = lessonsData as unknown as Lesson[]
const route = useRoute()
const router = useRouter()

const lesson = computed<Lesson | undefined>(() => {
    const id = Number(route.query.id)
    if (!id) return undefined
    return lessons.find((l: Lesson) => l.lesson === id)
})

const hasPrev = computed(() => !!lesson.value && lesson.value.lesson > 1)
const hasNext = computed(() => !!lesson.value && lesson.value.lesson < 143)

const goList = () => {
    router.push({ path: '/concept' })
}
const goLesson = (id: number) => {
    if (id < 1 || id > 143) return
    router.push({ path: '/concept/content', query: { id } })
}

// 切换课文时回到页面顶部
watch(() => route.query.id, () => {
    window.scrollTo(0, 0)
})
</script>
<style lang="less" scoped>
.lesson {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 16px 60px;
    box-sizing: border-box;

    .nav_top {
        margin-bottom: 16px;
        .back {
            display: inline-block;
            cursor: pointer;
            font-size: 15px;
            color: #fc7e0f;
            font-weight: 600;
        }
    }

    .card {
        background-color: #fff;
        border: 1px solid #eee;
        border-radius: 12px;
        padding: 32px 36px;
        box-sizing: border-box;

        .card_head {
            text-align: center;
            padding-bottom: 24px;
            border-bottom: 1px solid #f0f0f0;
            .card_num {
                font-size: 14px;
                font-weight: 600;
                color: #fc7e0f;
            }
            .card_title {
                font-size: 28px;
                font-weight: bold;
                color: #000;
                margin-top: 10px;
            }
            .card_title_cn {
                font-size: 16px;
                color: #666;
                margin-top: 8px;
            }
        }

        .section {
            margin-top: 28px;
            .section_label {
                font-size: 16px;
                font-weight: bold;
                color: #000;
                margin-bottom: 14px;
                padding-left: 10px;
                border-left: 4px solid #fc7e0f;
            }
            .en_block {
                p {
                    font-size: 17px;
                    line-height: 1.9;
                    color: #000;
                    margin: 10px 0;
                }
            }
            .zh_block {
                p {
                    font-size: 16px;
                    line-height: 1.9;
                    color: #444;
                    margin: 8px 0;
                }
            }
            .words_grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                .word_item {
                    background-color: #f7f7f7;
                    border-radius: 8px;
                    padding: 12px 14px;
                    box-sizing: border-box;
                    .word_en {
                        font-size: 15px;
                        font-weight: bold;
                        color: #000;
                    }
                    .word_cn {
                        font-size: 13px;
                        color: #888;
                        margin-top: 4px;
                    }
                }
            }
        }
    }

    .nav_bottom {
        display: flex;
        justify-content: space-between;
        margin-top: 24px;
        .nav_btn {
            cursor: pointer;
            font-size: 15px;
            font-weight: 600;
            color: #000;
            background-color: #f5f5f5;
            border-radius: 8px;
            padding: 10px 22px;
            transition: all 0.2s ease;
            &:hover {
                background-color: #ececec;
            }
            &.disabled {
                color: #bbb;
                pointer-events: none;
            }
        }
    }
}

.lesson_not_found {
    max-width: 800px;
    margin: 0 auto;
    padding: 80px 16px;
    text-align: center;
    .msg {
        font-size: 18px;
        color: #666;
    }
    .back {
        display: inline-block;
        margin-top: 24px;
        cursor: pointer;
        font-size: 15px;
        color: #fc7e0f;
        font-weight: 600;
    }
}

@media (max-width: 600px) {
    .lesson {
        padding: 16px 12px 40px;
        .card {
            padding: 22px 16px;
            .card_head {
                .card_title {
                    font-size: 22px;
                }
            }
            .section {
                .en_block p {
                    font-size: 16px;
                }
                .words_grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
            }
        }
        .nav_bottom {
            .nav_btn {
                padding: 10px 16px;
            }
        }
    }
}
</style>

<template>
    <!-- 课后练习页: 书面填空(输入 + 核对答案) -->
    <div class="max-w-[800px] mx-auto px-3 pt-4 pb-10 md:px-4 md:pt-6 md:pb-[60px] box-border" v-if="exercise && lesson">
        <div class="mb-4 flex items-center justify-between">
            <div class="inline-block cursor-pointer text-[15px] text-primary font-semibold py-2 md:py-0" @click="goList">← 返回目录</div>
            <div class="inline-block cursor-pointer text-[15px] text-primary font-semibold py-2 md:py-0" @click="goContent">返回课文 →</div>
        </div>
        <div class="bg-white border border-border rounded-lg px-4 py-[22px] md:px-9 md:py-8 box-border">
            <div class="text-center pb-6 border-b border-border-soft">
                <div class="h-[110px] w-[110px] mx-auto mb-4 rounded-lg overflow-hidden">
                    <LessonCover :lesson="lesson.lesson" />
                </div>
                <div class="text-sm font-semibold text-primary">新概念英语{{ bookMeta.name }} · Lesson {{ lesson.lesson }}<span class="inline-block ml-2 text-xs font-semibold text-accent-muted bg-accent-soft rounded-sm px-[6px] py-[1px] align-middle">课后练习</span></div>
                <div class="text-[22px] md:text-[28px] font-bold text-foreground mt-[10px]">{{ lesson.title }}</div>
                <div class="text-base text-muted mt-2" v-if="lesson.titleCn">{{ lesson.titleCn }}</div>
            </div>

            <!-- 操作栏: 核对答案 / 显示答案 / 重做 -->
            <div class="ex_toolbar">
                <div class="ex_score" v-if="checkedCount > 0">
                    得分 <b>{{ rightCount }}</b> / {{ totalCount }}
                </div>
                <div class="ex_actions">
                    <div class="ex_btn primary" @click="checkAll">核对答案</div>
                    <div class="ex_btn" @click="showAnswers = !showAnswers">{{ showAnswers ? '隐藏答案' : '显示答案' }}</div>
                    <div class="ex_btn ghost" @click="resetAll">重做</div>
                </div>
            </div>

            <div class="ex_group" v-for="(g, gi) in exercise.groups" :key="gi">
                <div class="ex_head">
                    <span class="ex_letter">{{ g.letter }}</span>
                    <span class="ex_instruction">{{ g.instruction }}</span>
                </div>
                <div class="ex_row" v-for="(item, ii) in g.items" :key="ii" :class="rowClass(gi, ii)">
                    <div class="ex_no">{{ ii + 1 }}.</div>
                    <div class="ex_main">
                        <div class="ex_prompt">{{ item }}</div>
                        <div class="ex_answerline">
                            <input
                                class="ex_input"
                                type="text"
                                v-model="inputs[gi][ii]"
                                :placeholder="showAnswers ? g.answers[ii] : '写下你的答案'"
                                :readonly="showAnswers"
                                @input="markUnknown(gi, ii)"
                                @keyup.enter="checkAll"
                            />
                            <span class="ex_mark" v-if="status[gi][ii] === 'right'">✓</span>
                            <span class="ex_mark wrong" v-if="status[gi][ii] === 'wrong'">✗</span>
                        </div>
                        <div class="ex_right" v-if="status[gi][ii] === 'wrong'">正确答案：{{ g.answers[ii] }}</div>
                        <div class="ex_right answer_hint" v-else-if="showAnswers">答案：{{ g.answers[ii] }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-between gap-[10px] md:gap-0 mt-6">
            <div class="self-start cursor-pointer px-[18px] py-[10px] text-[15px] font-semibold text-foreground bg-card rounded-card transition-colors duration-200 hover:bg-card-pressed"
                :class="{ 'text-[#bbb] pointer-events-none': !hasPrev }" @click="goLesson(-1)">
                ← 上一课
            </div>
            <div class="self-end cursor-pointer px-[18px] py-[10px] text-[15px] font-semibold text-foreground bg-card rounded-card transition-colors duration-200 hover:bg-card-pressed"
                :class="{ 'text-[#bbb] pointer-events-none': !hasNext }" @click="goLesson(1)">
                下一课 →
            </div>
        </div>
    </div>
    <div class="max-w-[800px] mx-auto px-4 py-20 text-center" v-else-if="loaded">
        <div class="text-lg text-muted">该课暂无课后练习</div>
        <div class="inline-block mt-6 cursor-pointer text-[15px] text-primary font-semibold" @click="goList">← 返回目录</div>
    </div>
    <div class="max-w-[800px] mx-auto px-4 py-20 text-center" v-else>
        <div class="text-lg text-muted">加载中…</div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Lesson, LessonExercise } from '../type';
import { loadBookLessons, loadBookExercises, getBookMeta } from '../data';
import LessonCover from '../components/LessonCover.vue';

const route = useRoute()
const router = useRouter()

// 当前册(1-4), 未传默认第二册(练习目前仅第二册有数据)
const book = computed(() => {
    const b = Number(route.query.book)
    return b >= 1 && b <= 4 ? b : 2
})
const bookMeta = computed(() => getBookMeta(book.value))

// 课文(取标题)与练习数据, 按册动态加载
const lessons = ref<Lesson[]>([])
const exercises = ref<LessonExercise[]>([])
const loaded = ref(false)
let loadSeq = 0
watch(() => book.value, async (b) => {
    const seq = ++loadSeq
    loaded.value = false
    lessons.value = []
    exercises.value = []
    const [ls, exs] = await Promise.all([loadBookLessons(b), loadBookExercises(b)])
    if (seq === loadSeq) {
        lessons.value = ls
        exercises.value = exs
        loaded.value = true
    }
}, { immediate: true })

const lesson = computed<Lesson | undefined>(() => {
    const id = Number(route.query.id)
    if (!id) return undefined
    return lessons.value.find((l) => l.lesson === id)
})
const exercise = computed<LessonExercise | undefined>(() => {
    const id = Number(route.query.id)
    if (!id) return undefined
    return exercises.value.find((e) => e.lesson === id)
})

// 作答状态: inputs=输入内容, status=unknown/right/wrong
const inputs = ref<string[][]>([])
const status = ref<('unknown' | 'right' | 'wrong')[][]>([])
const showAnswers = ref(false)

const initState = () => {
    inputs.value = (exercise.value?.groups || []).map((g) => g.items.map(() => ''))
    status.value = (exercise.value?.groups || []).map((g) => g.items.map(() => 'unknown' as const))
    showAnswers.value = false
}
watch(exercise, () => {
    if (exercise.value) initState()
}, { immediate: true })

// 判分归一化: 忽略大小写/首尾空格/连续空格/弯直引号
const normalize = (s: string) => s.trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ')

const markUnknown = (gi: number, ii: number) => {
    status.value[gi][ii] = 'unknown'
}
const checkAll = () => {
    const ex = exercise.value
    if (!ex) return
    ex.groups.forEach((g, gi) => {
        g.items.forEach((_, ii) => {
            status.value[gi][ii] = normalize(inputs.value[gi][ii]) === normalize(g.answers[ii]) ? 'right' : 'wrong'
        })
    })
}
const resetAll = () => {
    initState()
}

const totalCount = computed(() => status.value.reduce((n, g) => n + g.length, 0))
const checkedCount = computed(() => status.value.reduce((n, g) => n + g.filter((s) => s !== 'unknown').length, 0))
const rightCount = computed(() => status.value.reduce((n, g) => n + g.filter((s) => s === 'right').length, 0))

const rowClass = (gi: number, ii: number) => ({
    is_right: status.value[gi]?.[ii] === 'right',
    is_wrong: status.value[gi]?.[ii] === 'wrong',
})

// 翻页: 按当前册课程序号定位
const lessonIndex = computed(() => {
    if (!lesson.value) return -1
    return lessons.value.findIndex((l) => l.lesson === lesson.value!.lesson)
})
const hasPrev = computed(() => lessonIndex.value > 0)
const hasNext = computed(() => lessonIndex.value >= 0 && lessonIndex.value < lessons.value.length - 1)

const goList = () => {
    router.push({ path: '/concept', query: { book: book.value } })
}
const goContent = () => {
    router.push({ path: '/concept/content', query: { book: book.value, id: route.query.id } })
}
const goLesson = (offset: number) => {
    const target = lessons.value[lessonIndex.value + offset]
    if (!target) return
    router.push({ path: '/concept/exercise', query: { book: book.value, id: target.lesson } })
}

// 切换课文时回到页面顶部
watch(() => route.query.id, () => {
    window.scrollTo(0, 0)
})
</script>
<style lang="less" scoped>
.ex_toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
    padding: 12px 16px;
    background-color: #fdfcf7;
    border: 1px solid #ece4d3;
    border-radius: 10px;
    .ex_score {
        font-size: 15px;
        color: #26251f;
        b {
            color: #fc7e0f;
            font-size: 18px;
        }
    }
    .ex_actions {
        display: flex;
        gap: 10px;
        margin-left: auto;
        .ex_btn {
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #fc7e0f;
            background-color: #fff;
            border: 1px solid #fc7e0f;
            border-radius: 20px;
            padding: 8px 16px;
            transition: all 0.2s ease;
            user-select: none;
            &:hover {
                background-color: #fff4e8;
            }
            &.primary {
                background-color: #fc7e0f;
                color: #fff;
            }
            &.ghost {
                color: #555;
                border-color: #ddd;
                &:hover {
                    background-color: #f5f5f5;
                }
            }
        }
    }
}
.ex_group {
    margin-top: 28px;
    .ex_head {
        display: flex;
        align-items: baseline;
        gap: 10px;
        margin-bottom: 14px;
        .ex_letter {
            flex-shrink: 0;
            width: 26px;
            height: 26px;
            line-height: 26px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            color: #fff;
            background-color: #fc7e0f;
            border-radius: 6px;
        }
        .ex_instruction {
            font-size: 15px;
            font-weight: 600;
            color: #000;
        }
    }
    .ex_row {
        display: flex;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        & + .ex_row {
            margin-top: 4px;
        }
        &.is_right {
            background-color: #f0f9ee;
            .ex_input {
                border-color: #67c23a;
            }
        }
        &.is_wrong {
            background-color: #fdf1ef;
            .ex_input {
                border-color: #f56c6c;
            }
        }
        .ex_no {
            flex-shrink: 0;
            font-size: 15px;
            color: #999;
            width: 22px;
            line-height: 34px;
            text-align: right;
        }
        .ex_main {
            flex: 1;
            min-width: 0;
        }
        .ex_prompt {
            font-size: 15px;
            line-height: 1.9;
            color: #000;
            overflow-wrap: break-word;
            word-break: break-word;
        }
        .ex_answerline {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 6px;
            .ex_input {
                flex: 1;
                max-width: 320px;
                height: 34px;
                padding: 0 12px;
                font-size: 15px;
                color: #26251f;
                background-color: #fff;
                border: 1px solid #dcdfe6;
                border-radius: 6px;
                outline: none;
                transition: border-color 0.2s ease;
                box-sizing: border-box;
                &:focus {
                    border-color: #fc7e0f;
                }
                &::placeholder {
                    color: #b5b5b5;
                    font-size: 14px;
                }
                &[readonly] {
                    background-color: #fff4e8;
                    border-color: #f3d9b8;
                    color: #c2410c;
                    font-weight: 600;
                }
            }
            .ex_mark {
                font-size: 16px;
                font-weight: 700;
                color: #67c23a;
                &.wrong {
                    color: #f56c6c;
                }
            }
        }
        .ex_right {
            font-size: 13px;
            color: #f56c6c;
            margin-top: 4px;
            &.answer_hint {
                color: #c2410c;
            }
        }
    }
}
@media (max-width: 767px) {
    .ex_toolbar {
        .ex_actions {
            flex-wrap: wrap;
            .ex_btn {
                padding: 8px 14px;
            }
        }
    }
    .ex_group {
        .ex_row {
            padding: 10px 8px;
            .ex_answerline {
                .ex_input {
                    max-width: none;
                }
            }
        }
    }
}
</style>

<template>
    <div class="lesson" v-if="lesson">
        <div class="nav_top">
            <div class="back" @click="goList">← 返回目录</div>
        </div>
        <div class="card">
            <div class="card_head">
                <div class="card_cover">
                    <LessonCover :lesson="lesson.lesson" />
                </div>
                <div class="card_num">新概念英语{{ bookMeta.name }} · Lesson {{ lesson.lesson }}</div>
                <div class="card_title">{{ lesson.title }}</div>
                <div class="card_title_cn" v-if="lesson.titleCn">{{ lesson.titleCn }}</div>
            </div>

            <div class="section" v-if="lesson.en.length">
                <div class="section_head">
                    <div class="section_label">课文</div>
                    <div class="head_actions">
                        <div class="rate_ctrl" title="朗读语速">
                            <span v-for="opt in RATE_OPTIONS" :key="opt.value" :class="{ active: readRate === opt.value }" @click="setRate(opt.value)">{{ opt.label }}</span>
                        </div>
                        <div class="read_btn" :class="{ reading: isReading && !isPaused }" :title="readBtnTitle" @click="toggleRead">
                            <svg v-if="!isReading || isPaused" class="read_icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
                                <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" />
                                <path d="M18 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" />
                            </svg>
                            <svg v-else class="read_icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                            </svg>
                            <span>{{ readBtnLabel }}</span>
                        </div>
                        <div class="read_btn stop_btn" v-if="isReading" title="停止朗读" @click="stopRead">
                            <svg class="read_icon" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
                            </svg>
                            <span>停止</span>
                        </div>
                    </div>
                </div>
                <div class="en_block">
                    <p v-for="(line, i) in lesson.en" :key="i">
                        <template v-for="(sent, j) in lineSents[i]" :key="j">
                            <span :class="{ sent_speaking: activeLine === i && activeSent === j }">{{ sent }}</span>
                        </template>
                    </p>
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
                    <div class="word_item" v-for="(w, i) in lesson.words" :key="i" :class="{ speaking: speakingIndex === i }" :title="w.ipa ? '点击朗读' : ''" @click="speakWord(w, i)">
                        <div class="word_en">
                            <span class="word_text">{{ w.en }}</span>
                            <svg class="word_speaker" viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                                <path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor" />
                                <path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" />
                                <path d="M18 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" />
                            </svg>
                        </div>
                        <div class="word_ipa" v-if="w.ipa">/{{ w.ipa }}/</div>
                        <div class="word_cn">{{ w.cn }}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="nav_bottom">
            <div class="nav_btn" :class="{ disabled: !hasPrev }" @click="goLesson(-1)">
                ← 上一篇
            </div>
            <div class="nav_btn" :class="{ disabled: !hasNext }" @click="goLesson(1)">
                下一篇 →
            </div>
        </div>
    </div>
    <div class="lesson_not_found" v-else-if="loaded">
        <div class="msg">没有找到这篇课文</div>
        <div class="back" @click="goList">← 返回目录</div>
    </div>
    <div class="lesson_not_found" v-else>
        <div class="msg">加载中…</div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Lesson } from '../type';
import { loadBookLessons, getBookMeta } from '../data';
import LessonCover from '../components/LessonCover.vue';

const route = useRoute()
const router = useRouter()

// 当前册(1-4), 未传默认第一册
const book = computed(() => {
    const b = Number(route.query.book)
    return b >= 1 && b <= 4 ? b : 1
})
// 当前册元信息
const bookMeta = computed(() => getBookMeta(book.value))
// 当前册全部课文(动态加载, 加载完成前 loaded=false)
const lessons = ref<Lesson[]>([])
const loaded = ref(false)
let loadSeq = 0
watch(() => book.value, async (b) => {
    const seq = ++loadSeq
    loaded.value = false
    lessons.value = []
    const data = await loadBookLessons(b)
    // 防止快速切换册时旧请求覆盖新请求
    if (seq === loadSeq) {
        lessons.value = data
        loaded.value = true
    }
}, { immediate: true })

const lesson = computed<Lesson | undefined>(() => {
    const id = Number(route.query.id)
    if (!id) return undefined
    return lessons.value.find((l: Lesson) => l.lesson === id)
})

// 按当前册内的课程序号定位上一篇/下一篇
const lessonIndex = computed(() => {
    if (!lesson.value) return -1
    return lessons.value.findIndex((l: Lesson) => l.lesson === lesson.value!.lesson)
})
const hasPrev = computed(() => lessonIndex.value > 0)
const hasNext = computed(() => lessonIndex.value >= 0 && lessonIndex.value < lessons.value.length - 1)

const goList = () => {
    stopRead()
    router.push({ path: '/concept', query: { book: book.value } })
}
const goLesson = (offset: number) => {
    const target = lessons.value[lessonIndex.value + offset]
    if (!target) return
    stopRead()
    router.push({ path: '/concept/content', query: { book: book.value, id: target.lesson } })
}

// 切换课文时回到页面顶部并停止朗读
watch(() => route.query.id, () => {
    stopRead()
    window.scrollTo(0, 0)
})
watch(() => route.query.book, () => {
    stopRead()
    window.scrollTo(0, 0)
})

// 点击生词卡片朗读(浏览器内置语音合成, 美式发音)
let enVoice: SpeechSynthesisVoice | null = null
// 高质量音色关键词(优先选择更清晰自然的音色)
const QUALITY_VOICE_KEYS = ['google', 'natural', 'neural', 'premium', 'enhanced', 'samantha', 'aria', 'jenny', 'guy', 'ava', 'emma', 'zira', 'david', 'mark']
const voiceScore = (v: SpeechSynthesisVoice): number => {
    const name = v.name.toLowerCase()
    const lang = v.lang.toLowerCase()
    let score = 0
    if (lang === 'en-us') score += 100
    else if (lang.startsWith('en-us')) score += 90
    else if (lang.startsWith('en')) score += 50
    for (const key of QUALITY_VOICE_KEYS) {
        if (name.includes(key)) score += 30
    }
    if (v.localService) score += 10
    return score
}
const pickVoice = () => {
    if (enVoice || !('speechSynthesis' in window)) return
    const voices = window.speechSynthesis.getVoices()
    let best: SpeechSynthesisVoice | null = null
    let bestScore = 0
    for (const v of voices) {
        if (!v.lang.toLowerCase().startsWith('en')) continue
        const s = voiceScore(v)
        if (s > bestScore) {
            bestScore = s
            best = v
        }
    }
    enVoice = best
}
if ('speechSynthesis' in window) {
    pickVoice()
    // 部分浏览器语音列表异步加载, 就绪后重新选择
    window.speechSynthesis.onvoiceschanged = () => {
        enVoice = null
        pickVoice()
    }
}
// 当前朗读中的词卡索引(高亮反馈)
const speakingIndex = ref(-1)
const speakWord = (w: { en: string }, index: number) => {
    if (!('speechSynthesis' in window) || !w.en) return
    stopRead()
    pickVoice()
    // 先取消当前朗读(部分移动端浏览器需先取消再排队)
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(w.en)
    u.lang = 'en-US'
    if (enVoice) u.voice = enVoice
    u.rate = 0.7
    u.pitch = 1
    u.volume = 1
    const done = () => {
        if (speakingIndex.value === index) speakingIndex.value = -1
    }
    u.onend = done
    u.onerror = done
    speakingIndex.value = index
    window.speechSynthesis.speak(u)
}

// ============ 课文朗读(逐句合成, 当前句高亮) ============
// 每行课文按句末标点拆成句子, 保持原文空格不变(用于渲染)
const lineSents = computed<string[][]>(() => {
    if (!lesson.value) return []
    return lesson.value.en.map((line) => {
        const parts = line.match(/[^.!?]+[.!?]+["'”’)]?/g)
        if (!parts) return [line]
        const joined = parts.join('')
        if (joined.length < line.length) parts.push(line.slice(joined.length))
        return parts
    })
})
const isReading = ref(false)
// 暂停中(高亮停在当前句)
const isPaused = ref(false)
// 当前朗读句所在的行与句号(高亮用)
const activeLine = ref(-1)
const activeSent = ref(-1)
// 朗读语速选项(慢/常/快)
const RATE_OPTIONS = [
    { label: '慢速', value: 0.6 },
    { label: '常速', value: 0.75 },
    { label: '快速', value: 1 },
]
const readRate = ref(0.75)
const setRate = (v: number) => {
    readRate.value = v
    // 朗读中切换语速: 当前句播完后, 后续句子按新语速朗读(暂停中切换则继续时即生效)
}
const stopRead = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    isReading.value = false
    isPaused.value = false
    activeLine.value = -1
    activeSent.value = -1
}
// 当前正在播(或暂停在)的句子在队列中的位置
let curLi = 0
let curSi = 0
// 从(li, si)起朗读第一句非空文本, 播完自动推进
const speakSentence = (li: number, si: number) => {
    if (!isReading.value || isPaused.value) return
    const sents = lineSents.value
    while (li < sents.length) {
        while (si < sents[li].length) {
            const text = sents[li][si].trim()
            const cl = li
            const cs = si
            si++
            if (!text) continue
            curLi = cl
            curSi = cs
            activeLine.value = cl
            activeSent.value = cs
            const u = new SpeechSynthesisUtterance(text)
            u.lang = 'en-US'
            if (enVoice) u.voice = enVoice
            u.rate = readRate.value
            u.pitch = 1
            u.volume = 1
            u.onend = () => speakSentence(li, si)
            u.onerror = () => speakSentence(li, si)
            window.speechSynthesis.speak(u)
            return
        }
        li++
        si = 0
    }
    // 全文朗读结束
    isReading.value = false
    isPaused.value = false
    activeLine.value = -1
    activeSent.value = -1
}
const readArticle = () => {
    if (!('speechSynthesis' in window)) return
    const sents = lineSents.value
    if (!sents.length) return
    pickVoice()
    window.speechSynthesis.cancel()
    isReading.value = true
    isPaused.value = false
    curLi = 0
    curSi = 0
    speakSentence(0, 0)
}
const pauseRead = () => {
    if (!isReading.value || isPaused.value) return
    // 先标记暂停再取消当前句(避免取消触发的回调推进到下一句)
    isPaused.value = true
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    // 高亮保留在暂停的当前句
}
const resumeRead = () => {
    if (!isReading.value || !isPaused.value) return
    isPaused.value = false
    // 从暂停的当前句重新朗读
    speakSentence(curLi, curSi)
}
const readBtnLabel = computed(() => {
    if (!isReading.value) return '朗读全文'
    return isPaused.value ? '继续' : '暂停'
})
const readBtnTitle = computed(() => {
    if (!isReading.value) return '朗读全文'
    return isPaused.value ? '继续朗读' : '暂停朗读'
})
const toggleRead = () => {
    if (!isReading.value) {
        readArticle()
    } else if (isPaused.value) {
        resumeRead()
    } else {
        pauseRead()
    }
}
// 离开页面时停止朗读
onBeforeUnmount(stopRead)
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
            .card_cover {
                width: 110px;
                height: 110px;
                margin: 0 auto 16px;
                border-radius: 12px;
                overflow: hidden;
            }
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
            .section_head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 8px;
                .head_actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-left: auto;
                    .rate_ctrl {
                        display: inline-flex;
                        border: 1px solid #fc7e0f;
                        border-radius: 20px;
                        overflow: hidden;
                        flex-shrink: 0;
                        span {
                            font-size: 13px;
                            font-weight: 600;
                            color: #fc7e0f;
                            padding: 5px 10px;
                            cursor: pointer;
                            user-select: none;
                            transition: all 0.2s ease;
                            & + span {
                                border-left: 1px solid #fc7e0f;
                            }
                            &:hover {
                                background-color: #fff4e8;
                            }
                            &.active {
                                background-color: #fc7e0f;
                                color: #fff;
                            }
                        }
                    }
                    .read_btn {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        color: #fc7e0f;
                        background-color: #fff;
                        border: 1px solid #fc7e0f;
                        border-radius: 20px;
                        padding: 6px 16px;
                        transition: all 0.2s ease;
                        user-select: none;
                        .read_icon {
                            flex-shrink: 0;
                        }
                        &:hover {
                            background-color: #fff4e8;
                        }
                        &.reading {
                            background-color: #fc7e0f;
                            color: #fff;
                        }
                    }
                    .stop_btn {
                        color: #555;
                        border-color: #ddd;
                        &:hover {
                            background-color: #f5f5f5;
                        }
                    }
                }
            }
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
                    .sent_speaking {
                        background-color: #ffedd5;
                        border-radius: 3px;
                    }
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
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    &:hover {
                        background-color: #eef3fb;
                    }
                    &.speaking {
                        background-color: #dcebfb;
                        .word_speaker {
                            color: #fc7e0f;
                        }
                    }
                    .word_en {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        font-size: 15px;
                        font-weight: bold;
                        color: #000;
                        .word_text {
                            word-break: break-word;
                        }
                        .word_speaker {
                            color: #999;
                            flex-shrink: 0;
                        }
                    }
                    .word_ipa {
                        font-size: 12px;
                        color: #3a6ea5;
                        margin-top: 3px;
                        word-break: break-word;
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
        .nav_top {
            .back {
                display: inline-block;
                padding: 8px 0;
            }
        }
        .card {
            padding: 22px 16px;
            .card_head {
                .card_title {
                    font-size: 22px;
                }
            }
            .section {
                .section_head {
                    .head_actions {
                        .rate_ctrl {
                            span {
                                padding: 7px 11px;
                            }
                        }
                        .read_btn {
                            padding: 8px 16px;
                        }
                        .stop_btn {
                            padding: 8px 12px;
                        }
                    }
                }
                .en_block p {
                    font-size: 16px;
                }
                .words_grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                    .word_item {
                        padding: 12px;
                        min-height: 44px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        .word_en {
                            font-size: 15px;
                        }
                        .word_ipa {
                            font-size: 12px;
                        }
                    }
                }
            }
        }
        .nav_bottom {
            gap: 10px;
            .nav_btn {
                flex: 1;
                text-align: center;
                padding: 12px 0;
            }
        }
    }
}
</style>

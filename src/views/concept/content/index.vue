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
                <div class="card_num">新概念英语{{ bookMeta.name }} · Lesson {{ lesson.lesson }}<span v-if="isPractice" class="kind_badge">练习课</span></div>
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

            <div class="section" v-if="isPractice">
                <div class="section_label">句型练习</div>
                <div class="drill_block">
                    <p v-for="(line, i) in lesson.drill" :key="i">{{ line }}</p>
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

            <div class="section" v-if="grammarSections.length">
                <div class="section_label">语法讲解</div>
                <div class="grammar_group" v-for="(g, i) in grammarSections" :key="i">
                    <div class="grammar_title">{{ g.title }}</div>
                    <template v-for="(para, j) in g.content" :key="j">
                        <div v-if="g.title === '词汇学习'" class="vocab_block" v-html="renderVocabLines(para, ipaMap)" @click="onVocabClick"></div>
                        <div v-else class="grammar_block" v-html="renderGrammarLines(para)" @click="onVocabClick"></div>
                    </template>
                </div>
            </div>

            <div class="section" v-if="isPractice && lesson.exercises && lesson.exercises.length">
                <div class="section_label">书面练习</div>
                <div class="ex_group" v-for="(ex, i) in lesson.exercises" :key="i">
                    <div class="ex_head">
                        <span class="ex_letter">{{ ex.letter }}</span>
                        <span class="ex_instruction">{{ ex.instruction }}</span>
                    </div>
                    <div class="ex_example" v-if="ex.example">
                        <div class="ex_example_label">示例</div>
                        <p v-for="(line, j) in splitLines(ex.example)" :key="j">{{ line }}</p>
                    </div>
                    <div class="ex_item" v-for="(item, j) in ex.items" :key="j">{{ item }}</div>
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
import { Lesson, GrammarSection } from '../type';
import { loadBookLessons, loadBookGrammar, getBookMeta } from '../data';
import { highlightGrammarKeywords, renderVocabLines, renderGrammarLines } from './highlight';
import LessonCover from '../components/LessonCover.vue';
import ipaMap from '../ipa-map.json';

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

// 语法讲解: 按册按需加载(奇数课带讲解, 偶数课无)
interface GrammarEntry {
    lesson: number;
    sections: GrammarSection[];
}
const grammarMap = ref<Map<number, GrammarSection[]>>(new Map())
let grammarSeq = 0
watch(() => book.value, async (b) => {
    const seq = ++grammarSeq
    const data = await loadBookGrammar(b)
    if (seq === grammarSeq) {
        grammarMap.value = new Map(data.map((e: GrammarEntry) => [e.lesson, e.sections]))
    }
}, { immediate: true })
const grammarSections = computed<GrammarSection[]>(() => {
    if (!lesson.value) return []
    return grammarMap.value.get(lesson.value.lesson) || []
})

// 练习课(偶数课): 有句型练习, 无课文/译文
const isPractice = computed(() => !!(lesson.value?.drill && lesson.value.drill.length > 0))
// 示例文本按换行拆分渲染
const splitLines = (s: string) => s.split('\n').filter((l) => l.trim().length > 0)

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
// 朗读一段英文(词卡/词汇学习喇叭共用, 美式发音)
const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text) return
    stopRead()
    pickVoice()
    // 先取消当前朗读(部分移动端浏览器需先取消再排队)
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    if (enVoice) u.voice = enVoice
    u.rate = 0.7
    u.pitch = 1
    u.volume = 1
    window.speechSynthesis.speak(u)
}
const speakWord = (w: { en: string }, index: number) => {
    if (!('speechSynthesis' in window) || !w.en) return
    stopRead()
    pickVoice()
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
// 词汇学习词条喇叭: 事件委托读取 data-word 朗读单词
const onVocabClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest('.vd-spk') as HTMLElement | null
    if (!el) return
    const word = (el.dataset.word || '').trim()
    if (word) speakText(word)
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
                .kind_badge {
                    display: inline-block;
                    margin-left: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #3a6ea5;
                    background-color: #e8f0fa;
                    border-radius: 4px;
                    padding: 1px 6px;
                    vertical-align: middle;
                }
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
                // 经典书卷风: 纸张卡片 + 衬线字体 + 宽行距
                background-color: #fdfcf7;
                border: 1px solid #ece4d3;
                border-radius: 10px;
                padding: 22px 28px;
                box-shadow: 0 1px 3px rgba(70, 58, 34, 0.06);
                p {
                    font-family: Georgia, 'Times New Roman', 'Songti SC', serif;
                    font-size: 18px;
                    line-height: 2.1;
                    letter-spacing: 0.3px;
                    color: #26251f;
                    margin: 12px 0;
                    .sent_speaking {
                        background-color: #ffedd2;
                        border-radius: 3px;
                        padding: 1px 2px;
                    }
                }
            }
            .zh_block {
                p {
                    font-family: 'Songti SC', 'STSong', 'SimSun', 'Noto Serif SC', Georgia, serif;
                    font-size: 16px;
                    line-height: 2;
                    letter-spacing: 0.4px;
                    color: #756d5e;
                    margin: 8px 0;
                }
            }
            .drill_block {
                p {
                    font-size: 16px;
                    line-height: 1.9;
                    color: #000;
                    margin: 8px 0;
                    padding-left: 16px;
                    position: relative;
                    &::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 13px;
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background-color: #fc7e0f;
                    }
                }
            }
            .grammar_group {
                background-color: #ffffff;
                border: 1px solid #e8edf4;
                border-radius: 12px;
                padding: 16px 18px 14px;
                margin-bottom: 14px;
                &:last-child {
                    margin-bottom: 0;
                }
                .grammar_title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1b2b45;
                    line-height: 1.4;
                    margin-bottom: 10px;
                    padding-left: 10px;
                    border-left: 4px solid #2f6fe4;
                }
                .grammar_block {
                    // 编号要点: 圆徽章 + 内容
                    :deep(.gp-point) {
                        display: flex;
                        gap: 10px;
                        margin: 12px 0;
                        .gp-badge {
                            flex-shrink: 0;
                            min-width: 22px;
                            height: 22px;
                            padding: 0 6px;
                            border-radius: 11px;
                            background-color: #2f6fe4;
                            color: #ffffff;
                            font-size: 13px;
                            font-weight: 700;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            margin-top: 4px;
                            box-sizing: border-box;
                            &.gp-sub {
                                background-color: #ffffff;
                                border: 1px solid #bcd3f7;
                                color: #2f6fe4;
                                font-size: 12px;
                            }
                            &.gp-step {
                                border-radius: 6px;
                                background-color: #33475b;
                                font-size: 12px;
                                letter-spacing: 0.3px;
                            }
                        }
                        .gp-body {
                            flex: 1;
                            min-width: 0;
                        }
                        &.gp-nested {
                            margin: 6px 0 6px 14px;
                            padding-left: 12px;
                            border-left: 2px dashed #dde7f5;
                        }
                    }
                    :deep(.gp-para) {
                        margin: 6px 0;
                    }
                    // 正文: 语法术语橙色高亮
                    :deep(.gp-text) {
                        font-size: 15px;
                        line-height: 1.9;
                        color: #3a4653;
                        margin: 4px 0;
                        .kw {
                            font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
                            font-size: 0.88em;
                            background-color: #fff4e8;
                            color: #c2410c;
                            padding: 1px 5px;
                            border-radius: 4px;
                            margin: 0 1px;
                        }
                    }
                    // 例句块: 英文加粗带喇叭 + 中文灰译
                    :deep(.gp-ex) {
                        background-color: #f4f8fd;
                        border-left: 3px solid #2f6fe4;
                        border-radius: 6px;
                        padding: 7px 12px;
                        margin: 6px 0;
                        .gp-ex-en {
                            display: flex;
                            align-items: flex-start;
                            font-size: 14.5px;
                            font-weight: 600;
                            color: #1f2937;
                            line-height: 1.7;
                            .gp-ex-txt {
                                flex: 1;
                                min-width: 0;
                            }
                            .vd-ex-spk {
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                color: #3b7ce8;
                                cursor: pointer;
                                user-select: none;
                                margin-right: 6px;
                                margin-top: 3px;
                                transition: background-color 0.15s ease;
                                &:hover {
                                    background-color: #e8f0fe;
                                }
                                &:active {
                                    background-color: #d8e6fc;
                                }
                                svg {
                                    width: 11px;
                                    height: 11px;
                                }
                            }
                        }
                        .gp-ex-zh {
                            font-size: 13px;
                            color: #8a99ac;
                            line-height: 1.6;
                            margin-top: 3px;
                        }
                    }
                }
                .vocab_block {
                    // 有道词典风格词条卡片
                    :deep(.vd-entry) {
                        background-color: #f8fafd;
                        border: 1px solid #e8edf4;
                        border-radius: 10px;
                        padding: 14px 18px 12px;
                        margin-bottom: 12px;
                        &:last-child {
                            margin-bottom: 0;
                        }
                    }
                    :deep(.vd-head) {
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 2px 10px;
                        margin-bottom: 2px;
                        .vd-word {
                            font-size: 20px;
                            font-weight: 700;
                            color: #1b2b45;
                        }
                        .vd-ipa {
                            font-size: 14px;
                            color: #8a99ac;
                        }
                        .vd-spk {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            width: 22px;
                            height: 22px;
                            border-radius: 50%;
                            color: #3b7ce8;
                            cursor: pointer;
                            user-select: none;
                            transition: background-color 0.15s ease;
                            &:hover {
                                background-color: #e8f0fe;
                            }
                            &:active {
                                background-color: #d8e6fc;
                            }
                        }
                        .vd-note {
                            font-size: 13px;
                            color: #8a99ac;
                        }
                    }
                    :deep(.vd-group) {
                        margin-top: 4px;
                    }
                    :deep(.vd-pos-line) {
                        margin-top: 8px;
                        padding-bottom: 4px;
                        border-bottom: 1px dashed #e4eaf2;
                        .vd-pos {
                            display: inline-block;
                            font-size: 12px;
                            font-weight: 600;
                            color: #2f6fe4;
                            background-color: #e9f1fe;
                            border-radius: 4px;
                            padding: 1px 8px;
                        }
                    }
                    :deep(.vd-sense) {
                        margin-top: 8px;
                    }
                    :deep(.vd-sense-top) {
                        display: flex;
                        align-items: baseline;
                        gap: 8px;
                        .vd-sno {
                            font-size: 13px;
                            font-weight: 600;
                            color: #8a99ac;
                            flex-shrink: 0;
                        }
                        .vd-meaning {
                            font-size: 15px;
                            color: #303a46;
                            line-height: 1.7;
                        }
                    }
                    :deep(.vd-ex) {
                        background-color: #f1f5fa;
                        border-radius: 8px;
                        padding: 8px 14px;
                        margin-top: 8px;
                        .vd-ex-en {
                            display: flex;
                            align-items: flex-start;
                            font-size: 14.5px;
                            color: #1f2937;
                            line-height: 1.7;
                            .vd-ex-txt {
                                flex: 1;
                                min-width: 0;
                            }
                            .vd-kw {
                                font-weight: 700;
                                color: #2f6fe4;
                            }
                            .vd-ex-spk {
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                flex-shrink: 0;
                                width: 18px;
                                height: 18px;
                                border-radius: 50%;
                                color: #3b7ce8;
                                cursor: pointer;
                                user-select: none;
                                margin-right: 6px;
                                // 与首行文字垂直居中: (行高-图标)/2 ≈ 3px
                                margin-top: 3px;
                                transition: background-color 0.15s ease;
                                &:hover {
                                    background-color: #e8f0fe;
                                }
                                &:active {
                                    background-color: #d8e6fc;
                                }
                                svg {
                                    width: 11px;
                                    height: 11px;
                                }
                            }
                        }
                        .vd-ex-zh {
                            font-size: 13px;
                            color: #8a99ac;
                            line-height: 1.6;
                            margin-top: 3px;
                        }
                    }
                    :deep(.vd-simple) {
                        .vd-head {
                            margin-bottom: 0;
                            .vd-word {
                                font-size: 17px;
                            }
                            .vd-pos {
                                font-size: 12px;
                                font-weight: 600;
                                color: #2f6fe4;
                                background-color: #e9f1fe;
                                border-radius: 4px;
                                padding: 1px 8px;
                            }
                            .vd-trans {
                                font-size: 14.5px;
                                color: #4a5568;
                            }
                        }
                        .vd-ex {
                            margin-top: 6px;
                        }
                    }
                }
            }
            .ex_group {
                margin-bottom: 24px;
                &:last-child {
                    margin-bottom: 0;
                }
                .ex_head {
                    display: flex;
                    align-items: baseline;
                    gap: 10px;
                    margin-bottom: 10px;
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
                .ex_example {
                    background-color: #fff4e8;
                    border-left: 3px solid #fc7e0f;
                    border-radius: 4px;
                    padding: 10px 14px;
                    margin-bottom: 10px;
                    .ex_example_label {
                        font-size: 12px;
                        font-weight: 600;
                        color: #fc7e0f;
                        margin-bottom: 4px;
                    }
                    p {
                        font-size: 15px;
                        line-height: 1.8;
                        color: #444;
                        margin: 4px 0;
                    }
                }
                .ex_item {
                    font-size: 15px;
                    line-height: 1.9;
                    color: #000;
                    padding-left: 14px;
                    position: relative;
                    &::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 13px;
                        width: 6px;
                        height: 6px;
                        border-radius: 50%;
                        background-color: #999;
                    }
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

@media (max-width: 767px) {
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
                .en_block {
                    padding: 16px 14px;
                    p {
                        font-size: 16.5px;
                        line-height: 2;
                    }
                }
                .zh_block p {
                    font-size: 15px;
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
                .grammar_group {
                    padding: 14px 12px 12px;
                    .grammar_block {
                        :deep(.gp-point) {
                            gap: 8px;
                            &.gp-nested {
                                margin-left: 6px;
                                padding-left: 8px;
                            }
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

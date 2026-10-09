<template>
    <!-- 页面外壳与 Concept 内容页一致; 语法块深层定制样式复用同一套 class -->
    <div class="max-w-[800px] mx-auto px-3 pt-4 pb-10 md:px-4 md:pt-6 md:pb-[60px] box-border" v-if="chapter">
        <div class="mb-4">
            <div class="inline-block cursor-pointer text-[15px] text-primary font-semibold py-2 md:py-0" @click="goList">← 返回目录</div>
        </div>
        <div class="bg-white border border-border rounded-lg px-4 py-[22px] md:px-9 md:py-8 box-border">
            <div class="text-center pb-6 border-b border-border-soft">
                <div class="h-[64px] w-[64px] mx-auto mb-4 rounded-xl bg-primary flex items-center justify-center">
                    <span class="text-white font-bold text-[26px]">{{ chapter.chapter }}</span>
                </div>
                <div class="text-sm font-semibold text-primary">英语语法 · Chapter {{ chapter.chapter }} · {{ chapter.group }}</div>
                <div class="text-[22px] md:text-[28px] font-bold text-foreground mt-[10px]">{{ chapter.title }}</div>
                <div class="text-base text-muted mt-2">{{ chapter.titleEn }}</div>
            </div>

            <div class="section">
                <div class="grammar_group" v-for="(g, i) in chapter.sections" :key="i">
                    <div class="grammar_title">{{ g.title }}</div>
                    <template v-for="(para, j) in g.content" :key="j">
                        <div class="grammar_block" v-html="renderGrammarLines(para)" @click="onVocabClick"></div>
                    </template>
                </div>
            </div>
        </div>

        <div class="flex justify-between gap-[10px] md:gap-0 mt-6">
            <div class="self-start cursor-pointer px-[18px] py-[10px] text-[15px] font-semibold text-foreground bg-card rounded-card transition-colors duration-200 hover:bg-card-pressed"
                :class="{ 'text-[#bbb] pointer-events-none': !hasPrev }" @click="goChapter(-1)">
                ← 上一章
            </div>
            <div class="self-end cursor-pointer px-[18px] py-[10px] text-[15px] font-semibold text-foreground bg-card rounded-card transition-colors duration-200 hover:bg-card-pressed"
                :class="{ 'text-[#bbb] pointer-events-none': !hasNext }" @click="goChapter(1)">
                下一章 →
            </div>
        </div>
    </div>
    <div class="max-w-[800px] mx-auto px-4 py-20 text-center" v-else-if="loaded">
        <div class="text-lg text-muted">没有找到这一章</div>
        <div class="inline-block mt-6 cursor-pointer text-[15px] text-primary font-semibold" @click="goList">← 返回目录</div>
    </div>
    <div class="max-w-[800px] mx-auto px-4 py-20 text-center" v-else>
        <div class="text-lg text-muted">加载中…</div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { loadChapters, GrammarChapter } from '../data'
import { renderGrammarLines } from '../../concept/content/highlight'

const route = useRoute()
const router = useRouter()

// 全部章节(动态加载, 加载完成前 loaded=false)
const chapters = ref<GrammarChapter[]>([])
const loaded = ref(false)
loadChapters().then((data) => {
    chapters.value = data
    loaded.value = true
})

// 当前章节号(未传默认第 1 章)
const chapterNo = computed(() => {
    const n = Number(route.query.chapter)
    return n >= 1 ? n : 1
})
const chapter = computed<GrammarChapter | undefined>(() => {
    return chapters.value.find((c) => c.chapter === chapterNo.value)
})

// 上一章/下一章
const chapterIndex = computed(() => {
    return chapters.value.findIndex((c) => c.chapter === chapterNo.value)
})
const hasPrev = computed(() => chapterIndex.value > 0)
const hasNext = computed(() => chapterIndex.value >= 0 && chapterIndex.value < chapters.value.length - 1)

const goList = () => {
    stopSpeak()
    router.push({ path: '/grammar' })
}
const goChapter = (offset: number) => {
    const target = chapters.value[chapterIndex.value + offset]
    if (!target) return
    stopSpeak()
    router.push({ path: '/grammar/content', query: { chapter: target.chapter } })
}

// 切换章节时回到页面顶部
watch(() => route.query.chapter, () => {
    stopSpeak()
    window.scrollTo(0, 0)
})

// 例句喇叭: 浏览器内置语音合成, 优先挑选高质量美式音色(与 Concept 板块同一套策略)
let enVoice: SpeechSynthesisVoice | null = null
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
    window.speechSynthesis.onvoiceschanged = () => {
        enVoice = null
        pickVoice()
    }
}
const stopSpeak = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
}
const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text) return
    pickVoice()
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    if (enVoice) u.voice = enVoice
    u.rate = 0.7
    u.pitch = 1
    u.volume = 1
    window.speechSynthesis.speak(u)
}
// 事件委托: 点击喇叭读 data-word
const onVocabClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest('.vd-spk') as HTMLElement | null
    if (!el) return
    const word = (el.dataset.word || '').trim()
    if (word) speakText(word)
}
onBeforeUnmount(stopSpeak)
</script>
<style lang="less" scoped>
// 与 Concept 语法讲解同一套视觉: 蓝徽章编号要点 / 蓝边例句卡 / 橙底术语高亮
.section {
    margin-top: 28px;
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
                min-width: 0;
                overflow-wrap: break-word;
                word-break: break-word;
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
                        overflow-wrap: break-word;
                        word-break: break-word;
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
                    overflow-wrap: break-word;
                    word-break: break-word;
                }
            }
        }
    }
}

@media (max-width: 767px) {
    .section {
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
</style>

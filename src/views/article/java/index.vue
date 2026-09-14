<template>
    <div class="java_doc">
        <div class="nav_top">
            <div class="back" @click="goList">← 返回文章列表</div>
        </div>
        <div class="card" v-if="doc">
            <div class="doc_head">
                <div class="doc_meta">
                    <span class="doc_type">{{ doc.type }}</span>
                    <span class="doc_date">{{ doc.date }}</span>
                </div>
                <div class="doc_title">{{ doc.title }}</div>
                <div class="doc_desc" v-if="doc.desc">{{ doc.desc }}</div>
            </div>
            <div class="doc_body">
                <template v-for="(b, i) in doc.blocks" :key="i">
                    <h2 v-if="b.type === 'h2'" class="blk_h2">{{ b.text }}</h2>
                    <h3 v-else-if="b.type === 'h3'" class="blk_h3">{{ b.text }}</h3>
                    <p v-else-if="b.type === 'p'" class="blk_p">{{ b.text }}</p>
                    <pre v-else-if="b.type === 'code'" class="blk_code"><code>{{ b.text }}</code></pre>
                    <div v-else-if="b.type === 'tip'" class="blk_tip">{{ b.text }}</div>
                </template>
            </div>
        </div>
        <div class="doc_not_found" v-else-if="loaded">
            <div class="msg">没有找到这篇文章</div>
            <div class="back" @click="goList">← 返回文章列表</div>
        </div>
        <div class="doc_not_found" v-else>
            <div class="msg">加载中…</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArticleBlock } from '../content/type';
import { parseMarkdown } from '../content/parse';
import { useAticleStoreHook } from '@/store/article/index';

const route = useRoute()
const router = useRouter()
const articleStore = useAticleStoreHook()

interface Doc {
    type: string
    date: string
    title: string
    desc: string
    blocks: ArticleBlock[]
}

const doc = ref<Doc | null>(null)
const loaded = ref(false)
let loadSeq = 0

// 各文章正文(按需加载, 打包时自动分包)
const loaders: Record<string, () => Promise<{ default: string }>> = {
    basics: () => import('../content/basics.md?raw'),
    oop: () => import('../content/oop.md?raw'),
    api: () => import('../content/api.md?raw'),
    advanced: () => import('../content/advanced.md?raw'),
    relational: () => import('../content/relational.md?raw'),
    query: () => import('../content/query.md?raw'),
    join: () => import('../content/join.md?raw'),
    transaction: () => import('../content/transaction.md?raw'),
}

watch(() => route.path, async () => {
    const seq = ++loadSeq
    loaded.value = false
    doc.value = null
    window.scrollTo(0, 0)

    // 从文章目录取元信息(标题/分类/日期/简介), path 形如 /article/sql-query.html
    const path = route.path
    const meta = articleStore.directory.find((item) => item.path === path)
    const m = path.match(/^\/article\/(?:java|sql)-(.+)\.html$/)
    const loader = m ? loaders[m[1]] : undefined
    if (!loader || !meta) {
        if (seq === loadSeq) loaded.value = true
        return
    }
    const mod = await loader()
    if (seq !== loadSeq) return
    doc.value = {
        type: meta.type,
        date: meta.date,
        title: meta.title,
        desc: meta.desc,
        blocks: parseMarkdown(mod.default),
    }
    loaded.value = true
}, { immediate: true })

const goList = () => {
    router.push('/article')
}
</script>
<style lang="less" scoped>
.java_doc {
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

        .doc_head {
            padding-bottom: 24px;
            border-bottom: 1px solid #f0f0f0;
            .doc_meta {
                display: flex;
                align-items: center;
                gap: 12px;
                .doc_type {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fc7e0f;
                }
                .doc_date {
                    font-size: 13px;
                    color: #aaa;
                    font-weight: 600;
                }
            }
            .doc_title {
                font-size: 26px;
                font-weight: bold;
                color: #000;
                margin-top: 10px;
            }
            .doc_desc {
                font-size: 15px;
                color: #666;
                margin-top: 8px;
            }
        }

        .doc_body {
            .blk_h2 {
                font-size: 19px;
                font-weight: bold;
                color: #000;
                margin: 28px 0 14px;
                padding-left: 10px;
                border-left: 4px solid #fc7e0f;
            }
            .blk_h3 {
                font-size: 16px;
                font-weight: bold;
                color: #000;
                margin: 20px 0 10px;
            }
            .blk_p {
                font-size: 16px;
                line-height: 1.9;
                color: #000;
                margin: 10px 0;
            }
            .blk_code {
                background-color: #f7f7f7;
                border: 1px solid #eee;
                border-radius: 8px;
                padding: 14px 16px;
                margin: 12px 0;
                overflow-x: auto;
                code {
                    font-family: 'SF Mono', Menlo, Monaco, Consolas, monospace;
                    font-size: 14px;
                    line-height: 1.7;
                    color: #000;
                }
            }
            .blk_tip {
                background-color: #fff4e8;
                border-left: 4px solid #fc7e0f;
                border-radius: 4px;
                padding: 10px 14px;
                margin: 12px 0;
                font-size: 14px;
                line-height: 1.8;
                color: #555;
            }
        }
    }
}

.doc_not_found {
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
    .java_doc {
        padding: 16px 12px 40px;
        .nav_top {
            .back {
                display: inline-block;
                padding: 8px 0;
            }
        }
        .card {
            padding: 22px 16px;
            .doc_head {
                .doc_title {
                    font-size: 22px;
                }
            }
            .doc_body {
                .blk_h2 {
                    font-size: 18px;
                }
                .blk_p {
                    font-size: 15px;
                }
                .blk_code {
                    padding: 12px;
                    code {
                        font-size: 12.5px;
                    }
                }
            }
        }
    }
}
</style>

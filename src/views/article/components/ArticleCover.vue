<template>
    <svg class="article_cover" :viewBox="'0 0 200 200'" xmlns="http://www.w3.org/2000/svg" role="img"
        :aria-label="type + ' cover'">
        <defs>
            <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :stop-color="color1" />
                <stop offset="100%" :stop-color="color2" />
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="200" rx="18" :fill="`url(#${gradId})`" />
        <circle cx="168" cy="34" r="52" fill="rgba(255,255,255,0.10)" />
        <circle cx="18" cy="186" r="64" fill="rgba(0,0,0,0.08)" />
        <text x="100" :y="118" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" :font-size="fontSize"
            font-weight="700" fill="#ffffff">{{ type }}</text>
    </svg>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ id: number; type: string }>()

// 按文章 id 散列色相: 每篇文章一个固定渐变色, 相邻文章不撞色
const hue = computed(() => (props.id * 137.508) % 360)
const color1 = computed(() => `hsl(${hue.value}, 52%, 46%)`)
const color2 = computed(() => `hsl(${(hue.value + 42) % 360}, 58%, 32%)`)
const gradId = computed(() => `article-cover-grad-${props.id}`)
// 文字长度自适应字号
const fontSize = computed(() => {
    const len = props.type.length
    if (len <= 4) return 36
    if (len <= 8) return 28
    return 22
})
</script>
<style lang="less" scoped>
.article_cover {
    display: block;
    width: 100%;
    height: 100%;
}
</style>

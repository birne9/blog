<template>
    <svg class="lesson_cover" :viewBox="'0 0 200 200'" xmlns="http://www.w3.org/2000/svg" role="img"
        :aria-label="'Lesson ' + lesson + ' cover'">
        <defs>
            <linearGradient :id="gradId" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" :stop-color="color1" />
                <stop offset="100%" :stop-color="color2" />
            </linearGradient>
        </defs>
        <rect x="0" y="0" width="200" height="200" rx="18" :fill="`url(#${gradId})`" />
        <circle cx="168" cy="34" r="52" fill="rgba(255,255,255,0.10)" />
        <circle cx="18" cy="186" r="64" fill="rgba(0,0,0,0.08)" />
        <text x="100" y="122" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="76"
            font-weight="700" fill="#ffffff">{{ lesson }}</text>
        <text x="100" y="156" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15"
            letter-spacing="3" fill="rgba(255,255,255,0.92)">LESSON</text>
    </svg>
</template>
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ lesson: number }>()

// 黄金角散列：每课一个固定色相，72 课颜色不重复且相邻课不撞色
const hue = computed(() => (props.lesson * 137.508) % 360)
const color1 = computed(() => `hsl(${hue.value}, 52%, 46%)`)
const color2 = computed(() => `hsl(${(hue.value + 42) % 360}, 58%, 32%)`)
const gradId = computed(() => `lesson-cover-grad-${props.lesson}`)
</script>
<style lang="less" scoped>
.lesson_cover {
    display: block;
    width: 100%;
    height: 100%;
}
</style>

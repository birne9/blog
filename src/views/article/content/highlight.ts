// Vue 关键词高亮: 把正文(p/h2/h3/tip)里的 Vue API 与模板语法包成 <code class="kw">, 供 v-html 渲染
// 输入文本先转义再替换, 代码块不做处理

// 关键词列表, 替换前按长度降序, 保证长词(如 watchEffect/v-else-if)先于短词(如 watch/v-if)匹配
const KEYWORDS = [
    'createWebHashHistory',
    'watchEffect',
    'onBeforeUnmount',
    'storeToRefs',
    'createWebHistory',
    'defineProps',
    'defineEmits',
    'defineExpose',
    'createRouter',
    'onBeforeMount',
    'onBeforeUpdate',
    'router-view',
    'router-link',
    'shallowRef',
    'useRouter',
    'useRoute',
    'defineStore',
    'immediate',
    'v-else-if',
    'onMounted',
    'onUnmounted',
    'onUpdated',
    'reactive',
    'computed',
    'createApp',
    'nextTick',
    'getters',
    'actions',
    'methods',
    'v-model',
    'v-bind',
    'v-show',
    'v-slot',
    'v-html',
    'v-text',
    'v-once',
    'v-memo',
    'v-cloak',
    'v-else',
    'v-for',
    'v-on',
    'v-if',
    'toRefs',
    'toRef',
    'setup',
    'props',
    'emits',
    'watch',
    'emit',
    'slot',
    'store',
    'data',
    'state',
    'mount',
    'ref',
    'deep',
    'getter',
    'setter',
    'provide',
    'inject',
].sort((a, b) => b.length - a.length)

// HTML 转义, v-html 渲染前的安全底线
export function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 高亮 Vue 关键词: 转义后把匹配到的词包成 <code class="kw">
export function highlightVueKeywords(text: string): string {
    let out = escapeHtml(text)

    // 第一遍: 模板语法 @事件 与 :绑定(如 @click、@remove、:key、:value)。
    // 必须先于关键词替换, 否则关键词包出来的 </code> 会被当成绑定前字(如 v-slot:title 的 :title 误伤);
    // 前字若是中文/字母数字(如"三块:template"、"v-slot:title"), 视为普通冒号不处理
    const bindRe = new RegExp('(^|[^\\u4e00-\\u9fa5A-Za-z0-9_])([@:][A-Za-z][A-Za-z0-9-]*)(?![A-Za-z0-9_])', 'gi')
    out = out.replace(bindRe, '$1<code class="kw">$2</code>')

    // 第二遍: API/指令关键词。
    // 前导捕获组 (^|[^A-Za-z0-9_]) 代替 (?<!...) 反向断言, 兼容旧版 Safari;
    // 尾随 (?![A-Za-z0-9_]) 防止半词误伤; i 修饰符让标题里的 Props/Emit 也能命中
    const kwAlt = KEYWORDS.join('|')
    const kwRe = new RegExp('(^|[^A-Za-z0-9_])(' + kwAlt + ')(?![A-Za-z0-9_])', 'gi')
    out = out.replace(kwRe, '$1<code class="kw">$2</code>')

    return out
}

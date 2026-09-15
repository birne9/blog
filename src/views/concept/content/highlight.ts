// 语法讲解关键词高亮: 把语法讲解段落里的中文语法术语与词性缩写包成 <code class="kw">, 供 v-html 渲染
// 输入文本先转义再替换, 与文章模块高亮保持一致的安全底线

// 关键词列表, 替换前按长度降序, 保证长词(如"时间状语从句")先于短词(如"状语从句"/"从句")匹配
const GRAMMAR_KEYWORDS = [
    'there be',
    '动词不定式',
    '时间状语从句',
    '条件状语从句',
    '过去进行时',
    '将来进行时',
    '现在完成时',
    '过去完成时',
    '一般现在时',
    '一般过去时',
    '一般将来时',
    '现在进行时',
    '反意疑问句',
    '一般疑问句',
    '特殊疑问句',
    '选择疑问句',
    '否定疑问句',
    '情态动词',
    '人称代词',
    '物主代词',
    '反身代词',
    '不定代词',
    '指示代词',
    '疑问代词',
    '关系代词',
    '不定冠词',
    '定冠词',
    '系动词',
    '助动词',
    '及物动词',
    '不及物动词',
    '现在分词',
    '过去分词',
    '动名词',
    '比较级',
    '最高级',
    '被动语态',
    '主动语态',
    '宾语从句',
    '定语从句',
    '状语从句',
    '直接宾语',
    '间接宾语',
    '所有格',
    'be动词',
    '主格',
    '宾格',
    '单数',
    '复数',
    '祈使句',
    '感叹句',
    '陈述句',
    '倒装',
    '借代',
    '升调',
    '降调',
    '语态',
    '时态',
    '同位语',
    '表语',
    '主语',
    '谓语',
    '宾语',
    '定语',
    '状语',
    '补语',
    'adj.',
    'adv.',
    'prep.',
    'pron.',
    'conj.',
    'int.',
    'aux.',
    'v.',
    'n.',
].sort((a, b) => b.length - a.length)

// HTML 转义, v-html 渲染前的安全底线
function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// 通用关键词高亮: 转义后把匹配到的词包成 <code class="kw">
// 前导捕获组 (^|[^A-Za-z0-9_]) 代替 (?<!...) 反向断言, 兼容旧版 Safari;
// 尾随 (?![A-Za-z0-9_]) 防止半词误伤; i 修饰符让英文术语大小写都能命中
export function highlightGrammarKeywords(text: string): string {
    const out = escapeHtml(text)
    const kwAlt = GRAMMAR_KEYWORDS.join('|')
    const kwRe = new RegExp('(^|[^A-Za-z0-9_])(' + kwAlt + ')(?![A-Za-z0-9_])', 'gi')
    return out.replace(kwRe, '$1<code class="kw">$2</code>')
}

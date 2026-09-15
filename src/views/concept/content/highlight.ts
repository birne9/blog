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
    'be 动词',
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
// 尾随 (?![A-Za-z0-9_]) 防止半词误伤; i 修饰符让英文术语大小写都能命中;
// 关键词里的点号(如 int.)须转义, 否则会当作通配符误伤 into 之类单词
export function highlightGrammarKeywords(text: string): string {
    const out = escapeHtml(text)
    const kwAlt = GRAMMAR_KEYWORDS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
    const kwRe = new RegExp('(^|[^A-Za-z0-9_])(' + kwAlt + ')(?![A-Za-z0-9_])', 'gi')
    return out.replace(kwRe, '$1<code class="kw">$2</code>')
}

// ==================== 词汇学习有道词典风格渲染 ====================
// 数据按 \n 分行存储, 分为两类:
//  A 型(编号词条): "1．look v.（1）看，瞧，观，望：" + 例句行 + "（2）面向，朝向：" ...
//  B 型(词汇列表): "feel v. 感觉" / "come home [在家，谈及回家]" + 纯英文例句行
// 解析为结构化词条后按有道词典样式输出:
//  词头(单词大字+音标+喇叭) → 词性分组 → 义项编号+释义 → 例句块(英文关键词高亮+中文译文)

// 词性缩写(含 n．/n. 全半角点与 modal verb/interjection 全写)
const POS_ABBR = '(?:n|v|adj|adv|prep|pron|conj|aux|art|int|interj|interjection|num)'

// 行首词性剥离: " v.（1）看..." -> pos=v. rest=（1）看...
// 缩写必须带点, 全写(mode verb/interjection)可不带, 避免 "near" 被误当成 n.
const LEAD_POS_RE = new RegExp('^\\s*(?:(?:' + POS_ABBR + ')\\s*[．.]|modal verb|interjection)\\s*', 'i')
function stripLeadPos(s: string): { pos: string; rest: string } {
    let pos = ''
    let rest = s
    while (true) {
        const m = LEAD_POS_RE.exec(rest)
        if (!m) break
        const token = m[0].trim().replace(/[．]$/, '.')
        pos += (pos ? ' ' : '') + token
        rest = rest.slice(m[0].length)
    }
    return { pos, rest }
}

// 词头尾词性剥离: "afford v." -> word=afford pos=v. / "must modal verb" -> word=must pos=modal verb
const TAIL_POS_RE = new RegExp('\\s+(?:(?:' + POS_ABBR + ')\\s*[．.]|modal verb|interjection)\\s*$', 'i')
function stripTailPos(run: string): { word: string; pos: string } {
    let pos = ''
    let rest = run
    while (true) {
        const m = TAIL_POS_RE.exec(rest)
        if (!m) break
        const token = m[0].trim().replace(/[．]$/, '.')
        pos = token + (pos ? ' ' + pos : '')
        rest = rest.slice(0, m.index)
    }
    return { word: rest.trim(), pos }
}

// 词头注记: （on）类搭配说明
const NOTE_RE = /^[（(]([A-Za-z][A-Za-z .'-]*)[）)]/

// 义项编号: （1）或 (1)
const SENSE_NO_RE = /^[（(](\d+)[）)]/

// 是否含中文
function hasCjk(s: string): boolean {
    return /[\u4e00-\u9fff]/.test(s)
}

// 例句对象: 英文/中文可缺其一
interface VdExample {
    en?: string;
    zh?: string;
}

// 英文句段归一: 去掉首尾空白, 结尾全角标点转半角
function normEn(s: string): string {
    return s.trim().replace(/[。]$/, '.').replace(/[！]$/, '!').replace(/[？]$/, '?')
}

// 按语言模式切分: 遇到句末标点([.!?。！？])且语言模式切换(英↔中)处断开
function modeSplit(s: string): string[] {
    const segs: string[] = []
    let cur = ''
    let curMode: 'en' | 'zh' | '' = ''
    for (const ch of s) {
        const isCjk = /[\u4e00-\u9fff]/.test(ch)
        const isAscii = /[A-Za-z]/.test(ch)
        const mode: 'en' | 'zh' | '' = isCjk ? 'zh' : isAscii ? 'en' : ''
        if (mode && curMode && mode !== curMode && /[.!?。！？]/.test(cur[cur.length - 1] || '')) {
            segs.push(cur)
            cur = ''
        }
        cur += ch
        if (mode) curMode = mode
    }
    if (cur) segs.push(cur)
    return segs
}

// 无句末标点的短语对切分: "casual dress 便服 evening dress 晚礼服" -> [{en,zh},{en,zh}]
// 也用于处理"短语+整句"混合行: "catch a cold 伤风 I have caught a bad cold."
function splitMixedPairs(s: string): VdExample[] {
    const out: VdExample[] = []
    let rest = s.trim()
    while (rest) {
        // 英文串(允许数字/撇号/连字符/全角＄), 停在中文前或行尾
        const em = /^([A-Za-z][A-Za-z0-9' ,.\-＄]*?)(?=\s*[\u4e00-\u9fff]|$)/.exec(rest)
        if (em && em[1].trim()) {
            out.push({ en: em[1].trim() })
            rest = rest.slice(em[0].length).trim()
            continue
        }
        // 中文串(开头允许 <英> 之类残留标记), 停在下个英文串前或行尾
        const zm = /^([^\u4e00-\u9fffA-Za-z]*[\u4e00-\u9fff][\s\S]*?)(?=\s+[A-Za-z]|$)/.exec(rest)
        if (zm && zm[1].trim()) {
            out.push({ zh: zm[1].trim() })
            rest = rest.slice(zm[0].length).trim()
            continue
        }
        out.push({ en: rest.trim() })
        break
    }
    return out
}

// 相邻的中英片段合并成完整例句(en在前zh在后, 或zh在前en补前)
function mergeEnZh(items: VdExample[]): VdExample[] {
    const out: VdExample[] = []
    for (const it of items) {
        const prev = out[out.length - 1]
        if (it.zh && prev && prev.en && !prev.zh) {
            prev.zh = it.zh
        } else if (it.en && prev && prev.zh && !prev.en) {
            prev.en = it.en
        } else {
            out.push({ ...it })
        }
    }
    return out
}

// 例句行拆分: 整句对按句末标点切, 短语对按中英模式切, 混合行先切整句再拆短语
function splitExamples(line: string): VdExample[] {
    const s = line.trim()
    if (!s) return []
    if (!/[.!?。！？]/.test(s)) return mergeEnZh(splitMixedPairs(s))
    const out: VdExample[] = []
    for (const seg of modeSplit(s)) {
        if (hasCjk(seg) && /[A-Za-z]/.test(seg)) {
            // 污染段: 短语对与整句混杂, 递归拆短语
            out.push(...mergeEnZh(splitMixedPairs(seg)))
        } else if (/[A-Za-z]/.test(seg)) {
            out.push({ en: normEn(seg) })
        } else if (seg.trim()) {
            out.push({ zh: seg.trim() })
        }
    }
    return mergeEnZh(out)
}

// 义项: 编号+词性+释义+例句
interface VdSense {
    no: string;        // 义项编号(显式（N）才有, 隐式为空)
    pos: string;       // 义项级词性(优先于词头级)
    meaning: string;
    examples: VdExample[];
}

// 词条
interface VdEntry {
    word: string;
    pos: string;         // 词头级词性
    note: string;        // 词头级注记如 （on）
    sourceIpa: string;   // 源数据方括号音标([nju:z]), 无映射时兜底
    senses: VdSense[];
    trans: string;       // B 型: 释义
    noteTrans: string;   // B 型: 释义后的方括号说明
    examples: VdExample[]; // B 型: 例句
}

// 释义与行内例句: 以最后一个'：'为界
function splitMeaningAndInline(s: string): { meaning: string; inline: string } {
    const li = s.lastIndexOf('：')
    if (li < 0) return { meaning: s.trim(), inline: '' }
    return { meaning: s.slice(0, li).trim(), inline: s.slice(li + 1).trim() }
}

// 解析一行成为义项(含可选词性/注记/行内例句)
// 词性可能出现两处: 义项编号前("v.（1）看...")与编号后("（1）v.睡觉："), 两处都识别
function parseSense(s: string, fallbackPos: string): VdSense {
    let rest = s
    let { pos: leadPos, rest: r1 } = stripLeadPos(rest)
    rest = r1
    let note = ''
    const noteM = NOTE_RE.exec(rest)
    if (noteM) {
        note = noteM[1]
        rest = rest.slice(noteM[0].length)
    }
    let no = ''
    const noM = SENSE_NO_RE.exec(rest)
    if (noM) {
        no = noM[1]
        rest = rest.slice(noM[0].length)
        const inner = stripLeadPos(rest)
        if (inner.pos) {
            leadPos = inner.pos
            rest = inner.rest
        }
    }
    const { meaning, inline } = splitMeaningAndInline(rest)
    return {
        no,
        pos: leadPos || fallbackPos,
        meaning: (note ? '（' + note + '）' : '') + meaning,
        examples: inline ? splitExamples(inline) : [],
    }
}

// A 型词条头行: "1．look v.（1）看，瞧，观，望："
const HEAD_RE = /^(\d+)[．.]\s*([A-Za-z][A-Za-z'. -]*?)(?=\s*[\u4e00-\u9fa5（\[:：]|$)([\s\S]*)$/
// B 型词条行: "feel v. 感觉" / "come home [在家，谈及回家]"
const WORD_RE = /^([A-Za-z][A-Za-z'. /-]*?)(?=\s*[\u4e00-\u9fa5（\[【:：]|$)/

// 整段解析: 返回词条数组与段落类型
function parseVocab(text: string): { mode: 'A' | 'B'; entries: VdEntry[] } {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    const mode: 'A' | 'B' = lines.some((l) => HEAD_RE.test(l)) ? 'A' : 'B'
    const entries: VdEntry[] = []
    if (mode === 'A') {
        let cur: VdEntry | null = null
        for (const line of lines) {
            const head = HEAD_RE.exec(line)
            if (head) {
                const { word, pos } = stripTailPos(head[2])
                cur = { word, pos, note: '', sourceIpa: '', senses: [], trans: '', noteTrans: '', examples: [] }
                const sense = parseSense(head[3], pos)
                cur.senses.push(sense)
                entries.push(cur)
                continue
            }
            const sn = SENSE_NO_RE.exec(line)
            if (sn) {
                if (!cur) {
                    cur = { word: '', pos: '', note: '', sourceIpa: '', senses: [], trans: '', noteTrans: '', examples: [] }
                    entries.push(cur)
                }
                cur.senses.push(parseSense(line, cur.pos))
                continue
            }
            // 例句行: 挂到当前词条最后一个义项下(无义项则建隐式义项)
            const ex = splitExamples(line)
            if (!ex.length) continue
            if (!cur) {
                cur = { word: '', pos: '', note: '', sourceIpa: '', senses: [], trans: '', noteTrans: '', examples: [] }
                entries.push(cur)
            }
            if (!cur.senses.length) {
                cur.senses.push({ no: '', pos: cur.pos, meaning: '', examples: [] })
            }
            cur.senses[cur.senses.length - 1].examples.push(...ex)
        }
        return { mode, entries }
    }
    // B 型词汇列表
    let cur: VdEntry | null = null
    for (const line of lines) {
        const wm = WORD_RE.exec(line)
        if (wm) {
            const run = wm[1].trim()
            const rest0 = line.slice(wm[0].length)
            // 整句排除: 英文串以句末标点结尾且末词不是词性缩写(如 next time.)才视为例句,
            // 词性结尾(feel v.)是合法词条行
            const isPosTail = new RegExp('(?:^|\\s)(?:' + POS_ABBR + ')\\.$', 'i').test(run)
            if (hasCjk(rest0) && !(/[.!?]$/.test(run) && !isPosTail)) {
                const { word, pos } = stripTailPos(run)
                const { pos: leadPos, rest: r1 } = stripLeadPos(rest0)
                cur = {
                    word,
                    pos: leadPos || pos,
                    note: '', sourceIpa: '', senses: [], trans: '', noteTrans: '', examples: [],
                }
                entries.push(cur)
                // 释义: 中文串 + 可选方括号(说明或音标)
                let r = r1
                const zm = /^\s*([\u4e00-\u9fff][^\[\]]*?)(?=\s*[\[【]|\s+[A-Za-z]|$)/.exec(r)
                if (zm) {
                    cur.trans = zm[1].trim()
                    r = r.slice(zm[0].length)
                }
                while (true) {
                    const bm = /^\s*[\[【]([^\]】]*)[\]】]/.exec(r)
                    if (!bm) break
                    const content = bm[1].trim()
                    if (hasCjk(content)) {
                        // 中文方括号: 无释义时作为释义, 有释义时作为注记
                        if (!cur.trans) {
                            cur.trans = content
                        } else {
                            cur.noteTrans = content
                        }
                    } else if (/^[a-zɑ-əθðʃʒŋˈˌ0-9: ]+$/i.test(content)) {
                        // 纯音标字符的方括号: 音标映射缺失时兜底
                        if (!cur.sourceIpa) cur.sourceIpa = content
                    }
                    r = r.slice(bm[0].length)
                }
                const tail = r.trim()
                if (tail) cur.examples.push(...splitExamples(tail))
                continue
            }
        }
        // 例句行(纯英文整句/短语)
        const ex = splitExamples(line)
        if (!ex.length) continue
        if (!cur) {
            cur = { word: '', pos: '', note: '', sourceIpa: '', senses: [], trans: '', noteTrans: '', examples: [] }
            entries.push(cur)
        }
        cur.examples.push(...ex)
    }
    return { mode, entries }
}

// 例句英文中的词头高亮: 转义后把词头(含常见词尾变化)包成 <b class="vd-kw">
function highlightHeadword(escEn: string, word: string): string {
    if (!word || !/[A-Za-z]/.test(word)) return escEn
    const w = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    // 单词词头匹配常见屈折词尾(s/es/d/ed/ing), 短语词头整体匹配
    const suffix = /\s/.test(w) ? '' : '(?:s|es|d|ed|ing)?'
    const re = new RegExp('(^|[^A-Za-z])(' + w + suffix + ')(?![A-Za-z])', 'gi')
    return escEn.replace(re, '$1<b class="vd-kw">$2</b>')
}

// 喇叭图标(与生词卡片同款)
const SPK_SVG = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">' +
    '<path d="M3 9v6h4l5 5V4L7 9H3z" fill="currentColor"/>' +
    '<path d="M15.5 8.5a4.5 4.5 0 0 1 0 7" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M18 6a8 8 0 0 1 0 12" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '</svg>'

// 词头行(单词+音标+喇叭+可选注记)
function renderHead(e: VdEntry, ipaMap: Record<string, string> | undefined): string {
    const ipa = (ipaMap && ipaMap[e.word.toLowerCase()]) || e.sourceIpa
    const parts: string[] = []
    parts.push('<span class="vd-word">' + escapeHtml(e.word) + '</span>')
    if (ipa) parts.push('<span class="vd-ipa">/' + escapeHtml(ipa) + '/</span>')
    if (e.word) {
        parts.push('<span class="vd-spk" data-word="' + escapeHtml(e.word) + '" title="点击发音">' + SPK_SVG + '</span>')
    }
    if (e.note) parts.push('<span class="vd-note">（' + escapeHtml(e.note) + '）</span>')
    return '<div class="vd-head">' + parts.join('') + '</div>'
}

// 属性转义: 额外处理双引号, 供 data-word 使用
function attrEscape(s: string): string {
    return escapeHtml(s).replace(/"/g, '&quot;')
}

// 例句块(英文句带喇叭, 点击朗读整句)
function renderExamples(examples: VdExample[], word: string): string {
    return examples.map((ex) => {
        const parts: string[] = []
        if (ex.en) {
            const spk = '<span class="vd-spk vd-ex-spk" data-word="' + attrEscape(ex.en) + '" title="点击朗读例句">' + SPK_SVG + '</span>'
            parts.push('<div class="vd-ex-en">' + spk + '<span class="vd-ex-txt">' + highlightHeadword(escapeHtml(ex.en), word) + '</span></div>')
        }
        if (ex.zh) parts.push('<div class="vd-ex-zh">' + escapeHtml(ex.zh) + '</div>')
        return '<div class="vd-ex">' + parts.join('') + '</div>'
    }).join('')
}

// A 型词条渲染: 词头 + 按词性分组的义项
function renderEntryA(e: VdEntry, ipaMap: Record<string, string> | undefined): string {
    // 按词性分组(保持出现顺序)
    const groups: { pos: string; senses: VdSense[] }[] = []
    for (const s of e.senses) {
        const pos = s.pos || e.pos
        const last = groups[groups.length - 1]
        if (last && last.pos === pos) {
            last.senses.push(s)
        } else {
            groups.push({ pos, senses: [s] })
        }
    }
    const parts: string[] = [renderHead(e, ipaMap)]
    for (const g of groups) {
        const gParts: string[] = []
        if (g.pos) gParts.push('<div class="vd-pos-line"><span class="vd-pos">' + escapeHtml(g.pos) + '</span></div>')
        for (const s of g.senses) {
            if (!s.meaning && !s.examples.length) continue
            const top: string[] = []
            if (s.no) top.push('<span class="vd-sno">' + escapeHtml(s.no) + '.</span>')
            if (s.meaning) top.push('<span class="vd-meaning">' + escapeHtml(s.meaning) + '</span>')
            gParts.push('<div class="vd-sense">' + (top.length ? '<div class="vd-sense-top">' + top.join('') + '</div>' : '') +
                renderExamples(s.examples, e.word) + '</div>')
        }
        parts.push('<div class="vd-group">' + gParts.join('') + '</div>')
    }
    return '<div class="vd-entry">' + parts.join('') + '</div>'
}

// B 型词条渲染: 词头(含词性与释义) + 例句
function renderEntryB(e: VdEntry, ipaMap: Record<string, string> | undefined): string {
    const ipa = (ipaMap && ipaMap[e.word.toLowerCase()]) || e.sourceIpa
    const parts: string[] = []
    parts.push('<span class="vd-word">' + escapeHtml(e.word) + '</span>')
    if (ipa) parts.push('<span class="vd-ipa">/' + escapeHtml(ipa) + '/</span>')
    if (e.word) {
        parts.push('<span class="vd-spk" data-word="' + escapeHtml(e.word) + '" title="点击发音">' + SPK_SVG + '</span>')
    }
    if (e.pos) parts.push('<span class="vd-pos">' + escapeHtml(e.pos) + '</span>')
    if (e.trans) parts.push('<span class="vd-trans">' + escapeHtml(e.trans) + '</span>')
    if (e.noteTrans) parts.push('<span class="vd-note">[' + escapeHtml(e.noteTrans) + ']</span>')
    const head = '<div class="vd-head">' + parts.join('') + '</div>'
    return '<div class="vd-entry vd-simple">' + head + renderExamples(e.examples, e.word) + '</div>'
}

// 词汇学习整段渲染入口: 识别 A/B 型后逐词条输出有道风格 HTML
// ipaMap 为 {单词小写: 音标}, 由调用方注入(四册生词表)
export function renderVocabLines(text: string, ipaMap?: Record<string, string>): string {
    const { mode, entries } = parseVocab(text)
    if (mode === 'A') {
        return entries.map((e) => renderEntryA(e, ipaMap)).join('')
    }
    return entries.map((e) => renderEntryB(e, ipaMap)).join('')
}

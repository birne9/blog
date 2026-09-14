// 代码块语法高亮: 基于 highlight.js 按需注册语言, 返回可直接 v-html 的安全 HTML
import hljs from 'highlight.js/lib/core'
import java from 'highlight.js/lib/languages/java'
import sql from 'highlight.js/lib/languages/sql'
import javascript from 'highlight.js/lib/languages/javascript'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import http from 'highlight.js/lib/languages/http'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/github.css'
import { escapeHtml } from './highlight'

hljs.registerLanguage('java', java)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('http', http)
hljs.registerLanguage('json', json)

// 围栏语言别名归一化: vue 文件按 xml 语法高亮(自带 <script> 内 JS 子语言);
// jsx/tsx 归到 javascript(v11 的 JS 语法自带 JSX 标签解析, jsx 是它的官方别名)
const LANG_ALIAS: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    tsx: 'javascript',
    vue: 'xml',
    html: 'xml',
}

export function highlightCode(code: string, lang?: string): string {
    const target = lang ? LANG_ALIAS[lang] || lang : ''
    if (target && hljs.getLanguage(target)) {
        try {
            return hljs.highlight(code, { language: target }).value
        } catch {
            // 语法解析异常时退回纯转义文本
        }
    }
    return escapeHtml(code)
}

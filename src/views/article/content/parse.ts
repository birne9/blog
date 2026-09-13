import { ArticleBlock } from './type'

// 轻量 Markdown 解析: 支持 ##/### 标题、```代码块、> 提示块、普通段落
export function parseMarkdown(src: string): ArticleBlock[] {
    const blocks: ArticleBlock[] = []
    const lines = src.split(/\r?\n/)
    let i = 0
    let buf: string[] = []
    const flush = () => {
        if (buf.length) {
            blocks.push({ type: 'p', text: buf.join('').trim() })
            buf = []
        }
    }
    while (i < lines.length) {
        const line = lines[i]
        if (line.startsWith('```')) {
            flush()
            const code: string[] = []
            i++
            while (i < lines.length && !lines[i].startsWith('```')) {
                code.push(lines[i])
                i++
            }
            i++ // 跳过结束围栏
            blocks.push({ type: 'code', text: code.join('\n') })
        } else if (/^#{2,3}\s/.test(line)) {
            flush()
            const level: 'h2' | 'h3' = line.startsWith('###') ? 'h3' : 'h2'
            blocks.push({ type: level, text: line.replace(/^#{2,3}\s*/, '') })
            i++
        } else if (line.startsWith('> ')) {
            flush()
            const tips: string[] = []
            while (i < lines.length && lines[i].startsWith('> ')) {
                tips.push(lines[i].slice(2))
                i++
            }
            blocks.push({ type: 'tip', text: tips.join('') })
        } else if (line.trim() === '') {
            flush()
            i++
        } else {
            buf.push(line.trim())
            i++
        }
    }
    flush()
    return blocks
}

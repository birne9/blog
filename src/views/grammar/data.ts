// 英语语法章节数据加载
// 数据存于 chapters.json(约 15 章), 整包动态 import, 首次加载后缓存

export interface GrammarSection {
    title: string;
    content: string[];
}

export interface GrammarChapter {
    chapter: number;   // 章节号(从 1 开始)
    group: string;     // 分组: 词法 / 动词 / 句法
    title: string;     // 中文标题
    titleEn: string;   // 英文标题
    desc: string;      // 章节内容概要
    sections: GrammarSection[];
}

let cache: GrammarChapter[] | null = null

export async function loadChapters(): Promise<GrammarChapter[]> {
    if (!cache) {
        const m = await import('./chapters.json')
        cache = m.default as GrammarChapter[]
    }
    return cache
}

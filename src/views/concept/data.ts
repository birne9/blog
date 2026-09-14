import { Lesson, LessonBrief } from './type'
import book1Index from './book1-index.json'
import book2Index from './book2-index.json'
import book3Index from './book3-index.json'
import book4Index from './book4-index.json'

// 四册元信息: 第一册奇数课72篇课文+偶数课72篇练习, 其余三册连续编号
export interface BookMeta {
    id: number;
    name: string;
    title: string;
    desc: string;
    count: number;
}

export const BOOKS: BookMeta[] = [
    {
        id: 1,
        name: '第一册',
        title: '新概念英语第一册',
        desc: 'New Concept English · Book 1 — 课文 72 篇 + 练习课 72 篇，中英对照，点击进入阅读',
        count: 144,
    },
    {
        id: 2,
        name: '第二册',
        title: '新概念英语第二册',
        desc: 'New Concept English · Book 2 — 课文共 96 篇，中英对照，点击进入阅读',
        count: 96,
    },
    {
        id: 3,
        name: '第三册',
        title: '新概念英语第三册',
        desc: 'New Concept English · Book 3 — 课文共 60 篇，中英对照，点击进入阅读',
        count: 60,
    },
    {
        id: 4,
        name: '第四册',
        title: '新概念英语第四册',
        desc: 'New Concept English · Book 4 — 课文共 48 篇，中英对照，点击进入阅读',
        count: 48,
    },
]

const BOOK_INDEX: Record<number, LessonBrief[]> = {
    1: book1Index as unknown as LessonBrief[],
    2: book2Index as unknown as LessonBrief[],
    3: book3Index as unknown as LessonBrief[],
    4: book4Index as unknown as LessonBrief[],
}

// 列表页目录(轻量, 只含课号与标题)
export function getBookIndex(book: number): LessonBrief[] {
    return BOOK_INDEX[book] || BOOK_INDEX[1]
}

// 详情页全量课文(动态 import, 按册拆 chunk, 用到才加载)
export async function loadBookLessons(book: number): Promise<Lesson[]> {
    switch (book) {
        case 2: {
            const m = await import('./book2.json')
            return m.default as unknown as Lesson[]
        }
        case 3: {
            const m = await import('./book3.json')
            return m.default as unknown as Lesson[]
        }
        case 4: {
            const m = await import('./book4.json')
            return m.default as unknown as Lesson[]
        }
        default: {
            const m = await import('./book1.json')
            return m.default as unknown as Lesson[]
        }
    }
}

export function getBookMeta(book: number): BookMeta {
    return BOOKS.find((b) => b.id === book) || BOOKS[0]
}

export interface Concept {
    title: string;
    path?: string;
    desc: string;
    type: string;
    date: string;
    coverImg:string;
    id:number
    // 课型标记: practice=练习课(偶数课)
    kind?: 'lesson' | 'practice';
}

export interface LessonWord {
    en: string;
    cn: string;
    // 美式音标(无斜杠, UI 显示时加 /…/)
    ipa?: string;
}

// 列表页轻量目录条目(全量课文按需加载)
export interface LessonBrief {
    lesson: number;
    title: string;
    titleCn: string;
    // 课型: lesson=课文课(奇数课), practice=练习课(偶数课)
    kind?: 'lesson' | 'practice';
}

// 书面练习: 一个字母部分(如 A/B/C), 含指令、示例与题目
export interface WrittenExercise {
    letter: string;
    instruction: string;
    example?: string;
    items: string[];
}

// 语法讲解块: 标题(自学导读/课堂笔记/语法/词汇学习) + 段落
export interface GrammarSection {
    title: string;
    content: string[];
}

export interface Lesson {
    lesson: number;
    title: string;
    titleCn: string;
    en: string[];
    zh: string[];
    words: LessonWord[];
    // 练习课(偶数课)专用: 句型练习与书面练习, 无课文/译文
    drill?: string[];
    exercises?: WrittenExercise[];
}

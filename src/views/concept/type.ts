export interface Concept {
    title: string;
    path?: string;
    desc: string;
    type: string;
    date: string;
    coverImg:string;
    id:number
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
}

export interface Lesson {
    lesson: number;
    title: string;
    titleCn: string;
    en: string[];
    zh: string[];
    words: LessonWord[];
}

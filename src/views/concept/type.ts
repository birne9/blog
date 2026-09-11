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
}

export interface Lesson {
    lesson: number;
    title: string;
    titleCn: string;
    en: string[];
    zh: string[];
    words: LessonWord[];
}

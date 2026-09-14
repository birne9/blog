export interface Article {
    title: string;
    path: string;
    desc: string;
    type: string;
    cat: 'frontend' | 'backend';
    date: string;
    coverImg:string;
    id:number
}
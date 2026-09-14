const n=`## React 与 TS 的配合方式

React 组件用 TS 写的体验和 Vue 略有不同:Vue 靠自动推断多一点,React 靠显式标注多一点——因为 React 是纯函数编程,组件就是一个函数,函数的参数(props)和返回值(JSX)都需要类型,恰好是 TS 最擅长的领域。React 基础篇的函数组件,加上类型之后长这样:

\`\`\`tsx
// StudentCard.tsx —— 函数组件 + TS
interface Props {
    name: string
    score: number
    rank?: number
}

function StudentCard({ name, score, rank }: Props) {
    return (
        <div className="student-card">
            <h3>{name}</h3>
            <p>{score} 分</p>
            {rank && <p>第 {rank} 名</p>}
        </div>
    )
}

export default StudentCard
\`\`\`

和 JS 版唯一的差别:Props 接口 + 参数解构处的类型标注。组件内部代码一行没变。这印证了 TS 篇第一篇的说法——TS 是 JS 的超集,加类型是渐进式的,不侵入逻辑。Vue 用 defineProps<Props>(),React 用函数参数标注,两边殊途同归:props 是组件对外契约,用 interface 描述。

## useState 与事件类型

useState 的泛型标注和 Vue 的 ref 对照看最有意思。Vue 的 ref 从初始值自动推断,useState 同样能推断,但空容器(初始 null)必须显式标注:

\`\`\`tsx
import { useState } from "react"

function ScoreEditor() {
    // 简单类型: 自动推断
    const [name, setName] = useState("小明")   // string
    const [score, setScore] = useState(90)     // number

    // 空容器: 必须显式标注, 否则推断成 null 类型, 之后 set 报错
    const [student, setStudent] = useState<Student | null>(null)

    // 异步数据加载完成后 set
    async function load() {
        const data = await fetchStudent(1)
        setStudent(data)
    }

    return (
        <div>
            <p>{student ? student.name : "加载中..."}</p>
        </div>
    )
}
\`\`\`

useState<Student | null>(null) 这个写法值得拆开:泛型参数 Student | null 表示"这个状态要么是 Student 要么是 null",初始值 null 合法,后续 setStudent(data) 也合法。渲染时 student ? ... 的判断不是可选的——因为类型是 Student | null,不判空直接用 student.name,编译器会报错。类型逼着你处理 null 分支,这正是 React 数据请求场景里最常见的运行时崩溃(undefined 报错)被提前消灭的地方。

事件处理函数的类型,React 提供了现成的事件类型包,导入即用:

\`\`\`tsx
import { useState, type ChangeEvent } from "react"

function ScoreForm() {
    const [name, setName] = useState("")
    const [score, setScore] = useState(0)

    // 输入框事件: 类型是 ChangeEvent<HTMLInputElement>
    function onNameChange(e: ChangeEvent<HTMLInputElement>) {
        setName(e.target.value)
    }

    // 表单提交事件: 类型是 FormEvent<HTMLFormElement>
    function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        console.log(name, score)
    }

    return (
        <form onSubmit={onSubmit}>
            <input value={name} onChange={onNameChange} />
            <button type="submit">提交</button>
        </form>
    )
}
\`\`\`

React 的事件是合成事件体系,类型都在 react 包里:ChangeEvent 泛型参数指定目标元素类型(HTMLInputElement),FormEvent 对应表单提交,还有 MouseEvent 对应点击。这些类型不用记,写的时候让编辑器自动补全:先写 (e) => 然后看报错提示,按提示补类型——或者直接把处理函数内联在 JSX 里,类型会被自动推断,这是更省事的写法:

\`\`\`tsx
// 内联写法: e 的类型被自动推断, 不用手标
<input value={name} onChange={(e) => setName(e.target.value)} />
\`\`\`

经验:内联箭头函数里的参数类型永远自动推断正确,抽成独立函数时才需要手标事件类型。能内联就内联,是少写样板代码的实用技巧。

## 泛型组件与 useRef

React 的泛型场景集中在两类:列表组件和 useRef。列表组件是泛型组件的经典案例——结构相同、数据类型不同:

\`\`\`tsx
interface ListProps<T> {
    items: T[]
    render: (item: T) => ReactNode
}

function StudentList<T>({ items, render }: ListProps<T>) {
    return <ul>{items.map((item, index) => <li key={index}>{render(item)}</li>)}</ul>
}

// 用法一: 渲染学生对象
interface Student {
    id: number
    name: string
    score: number
}

const students: Student[] = [
    { id: 1, name: "小明", score: 90 },
    { id: 2, name: "小红", score: 85 },
]

<StudentList
    items={students}
    render={(s) => \`\${s.name} - \${s.score}分\`}   // s 被推断为 Student
/>

// 用法二: 同一组件渲染纯数字
<StudentList items={[90, 85, 78]} render={(n) => \`\${n}分\`} />
\`\`\`

泛型组件和 TS 接口篇的泛型函数是同一个道理:类型参数 T 由调用方决定,组件内部保持"items 和 render 的 T 一致"的关系。这和 Vue 里泛型组件的思路一致,只是语法位置不同。

useRef 的类型标注有两个分支,取决于 ref 指向什么:

\`\`\`tsx
import { useRef, useEffect } from "react"

function SearchBox() {
    // 分支一: 指向 DOM 元素, 初始值 null, 类型是元素类型 | null
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        // 聚焦输入框 —— ref.current 判空后才能用
        inputRef.current?.focus()
    }, [])

    // 分支二: 保存可变值, 类型从初始值推断
    const countRef = useRef(0)

    return <input ref={inputRef} placeholder="搜索学生" />
}
\`\`\`

useRef<HTMLInputElement>(null) 的读法:泛型参数是元素的类型,初始值是 null,所以 ref.current 的类型是 HTMLInputElement | null,使用前必须判空——可选链 ?. 是最顺手的写法。React 基础篇讲过 useRef 两种用途(拿 DOM、存可变值),TS 里只是多一层标注,规则不变。

## 数据请求实战:防抖搜索

把 React 基础篇的防抖搜索框用 TS 重写,作为本系列收尾案例:

\`\`\`tsx
import { useEffect, useRef, useState, type ChangeEvent } from "react"

interface Student {
    id: number
    name: string
    score: number
}

function StudentSearch() {
    const [keyword, setKeyword] = useState("")
    const [list, setList] = useState<Student[]>([])
    const timerRef = useRef<number | null>(null)

    function onKeywordChange(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)
        // 防抖: 停止输入 300ms 后才真正请求
        if (timerRef.current !== null) {
            window.clearTimeout(timerRef.current)
        }
        timerRef.current = window.setTimeout(() => {
            search(e.target.value)
        }, 300)
    }

    async function search(value: string) {
        const res = await fetch(\`/api/students?keyword=\${value}\`)
        const data = (await res.json()) as { list: Student[] }
        setList(data.list)
    }

    return (
        <div>
            <input value={keyword} onChange={onKeywordChange} placeholder="搜索学生" />
            <ul>
                {list.map((s) => (
                    <li key={s.id}>{s.name} - {s.score} 分</li>
                ))}
            </ul>
        </div>
    )
}

export default StudentSearch
\`\`\`

TS 在这段代码里做了四件事:list 空数组显式标注 Student[];setTimeout 的返回值在浏览器里是 number,useRef<number | null>(null) 标注计时器;事件参数类型用 ChangeEvent;接口返回的 JSON 用 as 断言成约定结构。四件事各对应一个常见崩溃点:空数组无类型、计时器类型混淆、事件参数无提示、接口返回无契约。

> 工程里更推荐把接口层抽成独立文件,用 axios 泛型声明返回类型(TS 与 Vue3 篇讲过),而不是在组件里 fetch + as 断言。示例用原生 fetch 是为了不引入额外依赖,真实项目按 Vue 篇的 api.ts 模式组织。

## 小结

React 与 TS 的配合集中在四处:props 用 interface 声明、useState 空容器显式标泛型、事件处理内联靠推断抽离靠标注、useRef 按用途分两种标注。React 的函数式风格让类型标注自然融入参数和返回值,没有额外魔法。至此 TS 系列完结:类型基础、interface 与泛型、Vue 与 React 两大框架实战,TS 从语法到工程的路径已经打通。
`;export{n as default};

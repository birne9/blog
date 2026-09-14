## 工程搭建与接口层

React 版前端与 Vue 篇功能完全一致:列表、搜索、新增、编辑、删除。工程用 Vite + React 模板搭建,代理配置相同(HTTP 联调篇的跨域解法对两个框架一视同仁):

```ts
// vite.config.ts —— 与 Vue 版完全相同的代理
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
        },
    },
})
```

接口层同样集中在 api/student.ts。React 生态里 axios 一样是主流,类型与拆信封逻辑与 Vue 版逐行相同——这正是"接口层与框架无关"的体现:

```ts
// api/student.ts —— 与 Vue 版相同的接口层
import axios from "axios"

export interface Student {
    id: number
    name: string
    score: number
}

interface Result<T> {
    code: number
    message: string
    data: T
}

const http = axios.create({ baseURL: "/api" })

http.interceptors.response.use(
    (response) => {
        const { code, message, data } = response.data as Result<unknown>
        if (code === 200) return data
        alert(message)
        return Promise.reject(new Error(message))
    },
    (error) => Promise.reject(error),
)

export function fetchStudents(keyword: string) {
    return http.get("/students", { params: { keyword } })
}

export function createStudent(data: { name: string; score: number }) {
    return http.post("/students", data)
}

export function updateStudent(id: number, data: { name: string; score: number }) {
    return http.put(`/students/${id}`, data)
}

export function deleteStudent(id: number) {
    return http.delete(`/students/${id}`)
}
```

接口层是前后端契约的前端载体,与框架无关——Vue 版和 React 版共用同一份代码(只差文件扩展名)。这是 TS 篇接口层模式的价值:换框架时,组件重写,接口层原样搬走。

## 列表页

React 的列表页用 useState 管状态、useEffect 加载数据,对照 Vue 版看差异:

```tsx
// StudentList.tsx
import { useEffect, useState, type ChangeEvent } from "react"
import { deleteStudent, fetchStudents, type Student } from "../api/student"

function StudentList() {
    const [keyword, setKeyword] = useState("")
    const [list, setList] = useState<Student[]>([])
    const [loading, setLoading] = useState(false)

    // 表单显隐与编辑对象: null 表示新增
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<Student | null>(null)

    async function load() {
        setLoading(true)
        try {
            const data = (await fetchStudents(keyword)) as unknown as Student[]
            setList(data)
        } finally {
            setLoading(false)
        }
    }

    function onKeywordChange(e: ChangeEvent<HTMLInputElement>) {
        setKeyword(e.target.value)
    }

    function openCreate() {
        setEditing(null)
        setShowForm(true)
    }

    function openEdit(s: Student) {
        setEditing(s)
        setShowForm(true)
    }

    function onSaved() {
        setShowForm(false)
        load()
    }

    async function onDelete(id: number) {
        if (!window.confirm("确定删除这个学生吗?")) return
        await deleteStudent(id)
        load()
    }

    useEffect(() => {
        load()
    }, [])

    return (
        <div>
            <div className="toolbar">
                <input
                    value={keyword}
                    onChange={onKeywordChange}
                    placeholder="搜索学生姓名"
                    onKeyUp={(e) => e.key === "Enter" && load()}
                />
                <button onClick={load}>搜索</button>
                <button onClick={openCreate}>新增学生</button>
            </div>

            {loading ? (
                <p>加载中...</p>
            ) : (
                <table>
                    <thead>
                        <tr><th>ID</th><th>姓名</th><th>分数</th><th>操作</th></tr>
                    </thead>
                    <tbody>
                        {list.map((s) => (
                            <tr key={s.id}>
                                <td>{s.id}</td>
                                <td>{s.name}</td>
                                <td>{s.score}</td>
                                <td>
                                    <button onClick={() => openEdit(s)}>编辑</button>
                                    <button onClick={() => onDelete(s.id)}>删除</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showForm && (
                <StudentForm
                    student={editing}
                    onSaved={onSaved}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    )
}

export default StudentList
```

与 Vue 版的功能一一对应,写法上的差异正是 React 基础篇讲过的核心:状态用 useState 逐一声明(对照 ref),列表渲染用 map 加 key(对照 v-for),加载时机用 useEffect 空依赖(对照 onMounted),条件渲染用三元表达式(对照 v-if)。同一个"状态变更后重拉数据"策略,在这里是 onSaved/onDelete 里调 load,与 Vue 版完全一致——框架换,套路不变。

## 新增与编辑表单

React 的表单是受控组件(React 基础篇):输入框的 value 绑 state,onChange 更新 state。新增编辑共用一个组件,student 为 null 表示新增:

```tsx
// StudentForm.tsx
import { useEffect, useState, type ChangeEvent } from "react"
import { createStudent, updateStudent, type Student } from "../api/student"

interface Props {
    student: Student | null
    onSaved: () => void
    onCancel: () => void
}

function StudentForm({ student, onSaved, onCancel }: Props) {
    const [name, setName] = useState("")
    const [score, setScore] = useState(0)

    // 编辑对象变化时同步到表单(首次渲染也执行)
    useEffect(() => {
        setName(student ? student.name : "")
        setScore(student ? student.score : 0)
    }, [student])

    async function onSubmit() {
        if (student) {
            await updateStudent(student.id, { name, score })
        } else {
            await createStudent({ name, score })
        }
        onSaved()
    }

    function onScoreChange(e: ChangeEvent<HTMLInputElement>) {
        setScore(Number(e.target.value))   // 输入是字符串, 手动转 number
    }

    return (
        <div className="form-mask">
            <div className="form-panel">
                <h3>{student ? "编辑学生" : "新增学生"}</h3>
                <label>
                    姓名 <input value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>
                    分数 <input type="number" value={score} onChange={onScoreChange} />
                </label>
                <div>
                    <button onClick={onSubmit}>保存</button>
                    <button onClick={onCancel}>取消</button>
                </div>
            </div>
        </div>
    )
}

export default StudentForm
```

与 Vue 版 StudentForm 逐点对照:Vue 用 reactive 一个对象装两个字段,React 用两个 useState;Vue 用 watch + immediate 同步预填,React 用 useEffect 依赖 [student]——注意依赖数组里放的是编辑对象,切换编辑对象时 effect 重跑;Vue 的 v-model.number 自动转类型,React 的输入框值永远是字符串,要手动 Number() 转换,这是两个框架最容易踩的差异点;Vue 子组件 emit 事件父组件监听,React 直接把回调函数当 props 传下来——本质都是"子通知父",只是语法形式不同。取消与保存后关闭表单,两个版本都交给父组件控制,表单自身不管理显隐。

## 两个框架的实现对照

同一个系统写了两遍,正是对照学习的好材料。差异根源只有一个:Vue 用模板+响应式系统,React 用 JSX+不可变状态。往下推演出一系列具体差异:状态上 Vue 的 ref 原地改值即可(score.value += 1),React 必须 setState 换新值;列表上 v-for 指令 vs map 函数;事件上 @click vs onClick,事件对象也分原生与合成;表单上 v-model 双向绑定 vs 受控组件手动绑定;组件通信上 emit 事件 vs 回调 props;数据加载时机上 onMounted 钩子 vs useEffect 空依赖。

相同之处比差异更重要:接口层完全一致、代理配置完全一致、状态变更后重拉数据的策略一致、表单共用与显隐控制一致、统一返回结构的处理一致。框架差异集中在"视图层怎么写",而全栈项目的骨架——接口约定、数据流、状态策略——是框架无关的。这也是为什么本系列把重点放在设计篇:设计对了,换哪个框架实现都顺。

## 小结

React 版与 Vue 版功能镜像,差异集中在视图层语法,骨架完全一致。至此前后端两端都实现完毕,本地联调可跑通完整链路。最后一步是把两套工程从 localhost 搬到服务器上,让系统真正"上线"——下一篇讲打包部署。

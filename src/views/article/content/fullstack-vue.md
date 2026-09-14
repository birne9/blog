## 工程搭建与代理

前端用 Vite + Vue3 搭建(TS 第三篇的技术栈)。初始化工程后第一件事是配开发代理:开发期前端跑在 5173,后端跑在 8080,跨域问题用 Vite 代理解决,前端代码里只写 /api 相对路径:

```ts
// vite.config.ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 5173,
        proxy: {
            // /api 开头的请求转发到后端 8080
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
            },
        },
    },
})
```

代理的原理在 HTTP 联调篇讲过:开发服务器替浏览器转发请求,浏览器只跟 5173 同源通信。后端代码零改动,生产环境这个代理会被 Nginx 的同域反代取代(部署篇细讲)。

## 接口层封装

按设计篇的约定,接口调用集中在 api/student.ts,组件不直接碰 axios。类型先行——Student 接口和 Result 外壳都来自设计篇的接口文档:

```ts
// api/student.ts —— 接口层: 类型 + 请求封装
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

// axios 实例 + 响应拦截器: 统一拆信封
const http = axios.create({ baseURL: "/api" })

http.interceptors.response.use(
    (response) => {
        const { code, message, data } = response.data as Result<unknown>
        if (code === 200) return data
        // 非 200 统一提示并抛错, 组件里不用重复处理
        alert(message)
        return Promise.reject(new Error(message))
    },
    (error) => Promise.reject(error),
)

// 五个方法对应设计篇的五个接口
export function fetchStudents(keyword: string) {
    return http.get("/students", { params: { keyword } })
}

export function fetchStudent(id: number) {
    return http.get(`/students/${id}`)
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

响应拦截器是前端侧的关键设计:code 200 时把 data 解出来直接返回,组件拿到的就是业务数据;非 200 时提示 message 并抛错。拆信封的逻辑写一次,五个方法全部受益——这正是 Spring Boot 第五篇说的"前端统一处理"的落地。

> axios 响应拦截器里返回 data 后,调用方的返回值类型需要自己声明。工程里更严谨的做法是给每个方法标返回泛型,示例保持简洁,TS 篇第二篇讲过 axios.get<T> 的完整写法。

## 列表页

列表页承载列表、搜索、删除三个功能,新增与编辑交给子组件 StudentForm 完成,列表页通过 props/emit 与它通信:

```vue
<script setup lang="ts">
import { onMounted, ref } from "vue"
import { deleteStudent, fetchStudents, type Student } from "../api/student"
import StudentForm from "./StudentForm.vue"

const keyword = ref("")
const list = ref<Student[]>([])
const loading = ref(false)

// 表单显隐与编辑对象: editing 为 null 表示新增
const showForm = ref(false)
const editing = ref<Student | null>(null)

async function load() {
    loading.value = true
    try {
        const data = (await fetchStudents(keyword.value)) as unknown as Student[]
        list.value = data
    } finally {
        loading.value = false
    }
}

function onSearch() {
    load()
}

function openCreate() {
    editing.value = null
    showForm.value = true
}

function openEdit(s: Student) {
    editing.value = s
    showForm.value = true
}

function onSaved() {
    showForm.value = false
    load()          // 保存成功后重新加载列表
}

async function onDelete(id: number) {
    if (!window.confirm("确定删除这个学生吗?")) return
    await deleteStudent(id)
    load()          // 删除成功后重新加载列表
}

onMounted(load)
</script>

<template>
    <div>
        <div class="toolbar">
            <input v-model="keyword" placeholder="搜索学生姓名" @keyup.enter="onSearch" />
            <button @click="onSearch">搜索</button>
            <button @click="openCreate">新增学生</button>
        </div>

        <p v-if="loading">加载中...</p>
        <table v-else>
            <thead>
                <tr><th>ID</th><th>姓名</th><th>分数</th><th>操作</th></tr>
            </thead>
            <tbody>
                <tr v-for="s in list" :key="s.id">
                    <td>{{ s.id }}</td>
                    <td>{{ s.name }}</td>
                    <td>{{ s.score }}</td>
                    <td>
                        <button @click="openEdit(s)">编辑</button>
                        <button @click="onDelete(s.id)">删除</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- 表单子组件: 传编辑对象, 收保存/取消事件 -->
        <StudentForm
            v-if="showForm"
            :student="editing"
            @saved="onSaved"
            @cancel="showForm = false"
        />
    </div>
</template>
```

要点:数据加载统一走 load 函数,新增/编辑/删除完成后都调 load 刷新——"状态变更后重新拉数据"是最简单可靠的同步策略,比手动改本地数组少很多边界情况;删除前 confirm 确认,防误删;搜索支持回车触发,体验细节。新增与编辑的表单是同一个子组件,用 editing 是否为 null 区分两种模式,这正是 Vue 基础篇讲过的 props 向下、emit 向上的通信模式。

## 新增与编辑表单

新增和编辑共用 StudentForm 组件:父组件传入编辑对象(新增时传 null),表单用 watch 同步预填数据,提交时按 student 是否为 null 区分两种模式:

```vue
<script setup lang="ts">
import { reactive, watch } from "vue"
import { createStudent, updateStudent, type Student } from "../api/student"

const props = defineProps<{ student: Student | null }>()
const emit = defineEmits<{ (e: "saved"): void; (e: "cancel"): void }>()

const form = reactive({ name: "", score: 0 })

// 编辑对象变化时同步到表单(首次打开也会触发)
watch(
    () => props.student,
    (s) => {
        form.name = s ? s.name : ""
        form.score = s ? s.score : 0
    },
    { immediate: true },
)

async function onSubmit() {
    if (props.student) {
        await updateStudent(props.student.id, { name: form.name, score: form.score })
    } else {
        await createStudent({ name: form.name, score: form.score })
    }
    emit("saved")
}
</script>

<template>
    <div class="form-mask">
        <div class="form-panel">
            <h3>{{ student ? "编辑学生" : "新增学生" }}</h3>
            <label>姓名 <input v-model="form.name" /></label>
            <label>分数 <input v-model.number="form.score" type="number" /></label>
            <div>
                <button @click="onSubmit">保存</button>
                <button @click="emit('cancel')">取消</button>
            </div>
        </div>
    </div>
</template>
```

三个细节:分数输入用 v-model.number 修饰符,输入自动转 number 类型,不然提交的是字符串,后端 @NotNull 过了但业务上不对;watch 的 immediate 选项让首次打开表单时也执行同步逻辑,不然新增时残留上次编辑的数据;取消按钮直接 emit cancel 事件,显隐控制权始终在父组件手里——表单自己只负责"数据收集与提交",不自己决定何时消失,职责清晰。表单的前端校验(必填、范围)轻量处理即可,重校验永远在后端——后端校验是最后防线,不能省。

## 一条请求的完整旅程

功能齐了,走查一遍"搜索学生"这趟完整旅程,把全栈链路串起来:输入框回车触发 onSearch → load 调 fetchStudents → axios 发 GET /api/students?keyword=小 → Vite 代理把请求转发到 8080(浏览器视角全程只有 5173)→ 后端 StudentController.list 收参数 → Service 转空串兜底 → Mapper 执行 LIKE SQL → MySQL 返回行数据 → MyBatis 映射成 Student 对象列表 → Controller 包 Result 外壳 → Jackson 序列化成 JSON 原路返回 → axios 拦截器拆信封 code 200 取 data → list.value 赋值 → 表格重新渲染。

这条链路上,每一环都对应前面某篇的知识:HTTP 联调篇的报文与代理、Spring Boot 篇的映射与 MyBatis、TS 篇的类型与接口层、本篇的组件与状态。全栈开发的"全",不是什么都精通,而是这条链路的每一环都能看懂、能排查。接口报错时能迅速判断问题出在哪一环,这就是全栈能力的第一层含义。

## 小结

Vue3 前端实现的骨架:Vite 代理解决开发期跨域,api/ 目录集中接口调用与拆信封逻辑,列表页状态变更后重拉数据,新增编辑共用表单按 id 区分。前端代码全部围绕设计篇的接口约定写,没有一处偏离。下一篇用 React 实现同样的功能,对照两个框架的差异。

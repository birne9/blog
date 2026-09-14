const n=`## Vue3 里的 TS 从哪开始

Vue3 对 TypeScript 的支持是原生级别的:官方就用 TS 重写了核心,组合式 API 的类型推导做得极好。要在 Vue 单文件组件里写 TS,第一步是给 script 标签加 lang="ts",整个 script 块就从 JS 变成 TS 了:

\`\`\`vue
<script setup lang="ts">
import { ref } from "vue"

const name = ref("小明")      // Ref<string>, 自动推断
const score = ref(90)         // Ref<number>, 自动推断

function addScore(delta: number) {
    score.value += delta
}
<\/script>

<template>
    <div>
        <p>{{ name }}: {{ score }} 分</p>
        <button @click="addScore(5)">加5分</button>
    </div>
</template>
\`\`\`

注意一个细节:ref 的推断是自动的,但类型包在 Ref 外壳里——ref("小明") 的类型是 Ref<string>,模板里用 name 时框架自动解包成 string,代码里取 .value 拿到的也是 string,两边都无感。这和 React 的 useState 用法不同,后面 React 篇会对照。

script setup 语法糖让 TS 的体验很舒服:响应式变量直接声明,类型标注直接写在变量和函数上,没有额外的样板代码。Vue 基础篇学过 script setup,现在只多一件事——写类型。

## defineProps:用 interface 声明 props

组件对外接收的参数,用 interface 描述结构,然后传给 defineProps 的泛型参数。学生成绩卡组件:

\`\`\`vue
<script setup lang="ts">
interface Props {
    name: string
    score: number
    rank?: number        // 可选: 有的班级不排名的
}

const props = defineProps<Props>()
<\/script>

<template>
    <div class="student-card">
        <h3>{{ props.name }}</h3>
        <p>{{ props.score }} 分</p>
        <p v-if="props.rank">第 {{ props.rank }} 名</p>
    </div>
</template>
\`\`\`

defineProps<Props>() 这种"泛型传接口"的写法是 Vue3.3+ 的推荐姿势,替代了老式的 defineProps({ name: String }) 运行时声明。它的好处正是 TS 篇前两篇讲的:类型在编译期检查,父组件传错字段、类型不对,编译器直接报错,不用等页面渲染。

父组件怎么用?传参照常,检查交给编译器:

\`\`\`vue
<script setup lang="ts">
import StudentCard from "./StudentCard.vue"

interface Student {
    id: number
    name: string
    score: number
}

const students: Student[] = [
    { id: 1, name: "小明", score: 90 },
    { id: 2, name: "小红", score: 85 },
]
<\/script>

<template>
    <StudentCard v-for="s in students" :key="s.id" :name="s.name" :score="s.score" />
</template>
\`\`\`

v-for 遍历时有完整推断:s 的类型是 Student,s.name、s.score 都有补全。少了 score 传参?报错。多传一个不存在的字段?报错。这就是"数据契约"的威力——组件之间的通信约定被写死成了类型。

## defineEmits:给事件也标类型

emit 的事件在 JS 里全靠字符串约定,拼错事件名、传错参数都只能在运行时发现。TS 版把事件签名也声明出来:

\`\`\`vue
<script setup lang="ts">
interface Props {
    name: string
    score: number
}

// 声明事件: "update-score" 事件的参数是 number
const emit = defineEmits<{
    (e: "update-score", newScore: number): void
    (e: "remove"): void
}>()

const props = defineProps<Props>()

function onAddScore() {
    emit("update-score", props.score + 5)
}
<\/script>

<template>
    <div class="student-card">
        <h3>{{ props.name }}</h3>
        <p>{{ props.score }} 分</p>
        <button @click="onAddScore">加5分</button>
        <button @click="emit('remove')">删除</button>
    </div>
</template>
\`\`\`

defineEmits 的泛型声明里,每个函数签名就是一条"事件契约":事件名、参数类型、返回值类型全都明确。拼错事件名(比如 emit("updateScore") 驼峰写错)编译器直接报错,参数类型不匹配也报错。前端类比:事件类型声明之于 emit,就像 interface 之于 props——都是把口头约定变成机器检查。更深一层类比:这就是后端的接口签名,方法名、参数类型、返回值,缺一不可。

## 学生成绩列表实战

把前面几篇的知识拼成一个完整组件:列表页拿数据、筛选、渲染。数据请求封装用 TS 接口篇讲的 axios 泛型:

\`\`\`ts
// api.ts —— 接口层: 泛型 + interface 定义数据契约
import axios from "axios"

export interface Student {
    id: number
    name: string
    score: number
}

export interface PageResult<T> {
    total: number
    page: number
    list: T[]
}

export function fetchStudents(keyword: string): Promise<PageResult<Student>> {
    return axios
        .get<PageResult<Student>>("/api/students", { params: { keyword } })
        .then((res) => res.data)
}
\`\`\`

\`\`\`vue
<script setup lang="ts">
import { ref } from "vue"
import { fetchStudents, type Student } from "./api"

const keyword = ref("")
const list = ref<Student[]>([])
const total = ref(0)

async function search() {
    const page = await fetchStudents(keyword.value)
    list.value = page.list
    total.value = page.total
}

search()
<\/script>

<template>
    <div>
        <input v-model="keyword" placeholder="搜索学生" />
        <button @click="search">搜索</button>
        <p>共 {{ total }} 条</p>
        <ul>
            <li v-for="s in list" :key="s.id">{{ s.name }} - {{ s.score }} 分</li>
        </ul>
    </div>
</template>
\`\`\`

几个 TS 相关的细节:list 用 ref<Student[]>([]) 显式标注,因为空数组推断不出元素类型,不标的话 list.value.push 一个对象会被推断成 never[] 报错——这是新手最常见的 TS 报错之一,记住"空容器必须显式标类型";import 类型时加 type 关键字(import { type Student }),告诉编译器这个导入只在类型层存在,打包时会被完全擦除,产物更干净。

到这里,TS 与 Vue 的配合模式已经完整:接口层用泛型+interface 定义契约,组件 props 和 emit 用 defineProps/defineEmits 泛型声明,组件内部靠自动推断,空容器显式标注。剩下的响应式 API(computed、watch)基本不需要手动标类型,推断都替你做好了——这是 Vue3 组合式 API 对 TS 友好到近乎透明的部分。

## 小结

Vue3 的 TS 集成是"渐进"的:script 加 lang="ts" 就进入 TS 模式;defineProps<Props>() 和 defineEmits<{...}>() 用泛型把 props 和事件变成编译期契约;接口层用 axios 泛型 + interface 锁定后端返回结构;日常写法里唯一要记的显式标注是"空容器必须标类型"。类型系统的回报在联调时体现:后端字段一改,前端编译就红,改起来又快又准。
`;export{n as default};

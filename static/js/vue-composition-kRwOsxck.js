const n=`## 为什么需要组合式 API

Vue 2 的写法叫选项式 API:把数据放 data、方法放 methods、计算属性放 computed,按"选项类型"分块。组件小时没什么问题,组件一大,同一个功能的代码被拆散到各个选项里,改一个功能要上下翻代码。

组合式 API(Composition API)解决的就是这个:一个功能的代码写在一起,数据、方法、计算属性、生命周期都聚在同一段 setup 逻辑里。看一个对比,同样是搜索功能,选项式散落四处,组合式收拢一处:

\`\`\`vue
<script setup>
import { ref, computed, onMounted } from 'vue'

// 搜索功能: 数据 + 计算 + 初始化, 全在这里
const keyword = ref('')
const list = ref([])
const filtered = computed(() =>
  list.value.filter(s => s.name.includes(keyword.value))
)
onMounted(async () => {
  const res = await fetch('/api/students')
  list.value = await res.json()
})

// 统计功能: 另一个独立的段落
const avg = computed(() => /* 平均分逻辑 */ 0)
<\/script>
\`\`\`

代码按"功能"组织而不是按"类型"组织,这是组合式 API 最核心的价值。在此基础上,还能把一段功能整体抽出去复用,这就是组合式函数。

## 组合式函数

组合式函数(Composables)是把一段可复用的响应式逻辑封装成普通函数,约定以 use 开头命名。比如"学生列表 + 增删改查"这段逻辑,多个页面都要用,就抽成 useStudents:

\`\`\`js
// composables/useStudents.js
import { ref, computed } from 'vue'

export function useStudents() {
  const students = ref([])
  const keyword = ref('')

  const filtered = computed(() =>
    students.value.filter(s => s.name.includes(keyword.value))
  )

  function add(s) {
    students.value.push({ id: Date.now(), ...s })
  }
  function remove(id) {
    students.value = students.value.filter(s => s.id !== id)
  }
  function sortByScore() {
    students.value.sort((a, b) => b.score - a.score)
  }

  // 把组件要用的东西全部返回
  return { students, keyword, filtered, add, remove, sortByScore }
}
\`\`\`

组件里调用这个函数,解构出需要的数据和方法,就拥有了完整的列表能力:

\`\`\`vue
<template>
  <div>
    <input v-model="keyword">
    <button @click="sortByScore">排序</button>
    <ul>
      <li v-for="s in filtered" :key="s.id">
        {{ s.name }} - {{ s.score }}
        <button @click="remove(s.id)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useStudents } from '../composables/useStudents'

const { keyword, filtered, sortByScore, remove } = useStudents()
<\/script>
\`\`\`

注意两点:组合式函数返回的 ref 解构后仍然是响应式的,模板里照常使用;但解构对象时要小心,reactive 对象直接解构会丢失响应式,要用 toRefs 转换。命名用 use 开头不是语法要求而是约定,编辑器插件靠这个约定识别并提供优化。

组合式函数的意义在于:响应式状态和操作它的逻辑打包成"能力",组件引用能力,而不是复制代码。几个组件共用的数据甚至可以通过共享同一个组合式函数实例来共享状态,这就通向状态管理。

## script setup 语法细节

script setup 是组合式 API 的编译期增强,前几篇一直在用,这里把细节补齐。它是普通 script 的语法糖,内部代码被编译进组件的 setup 函数,所以:顶层定义的变量直接暴露给模板,不需要 return;import 进来的组件直接用,不需要注册。

defineProps 和 defineEmits 是 script setup 专用的编译宏,不需要 import,只在 script setup 里可用:

\`\`\`vue
<script setup>
const props = defineProps({
  list: { type: Array, required: true }
})
const emit = defineEmits(['remove'])

function handleRemove(id) {
  emit('remove', id)
}
<\/script>
\`\`\`

defineExpose 控制组件对外暴露的内容,配合模板 ref 使用:父组件用 ref 拿到子组件实例,但只能访问 defineExpose 暴露出来的成员,这是组合式写法下组件实例默认封闭的对应方案。script setup 里还能写顶层 await,不过日常开发中异步初始化用 onMounted 更稳妥。

## 路由与 Pinia 入门

单页应用要有页面跳转,靠 vue-router。核心概念:createRouter 定义路由表,页面用 router-view 占位显示当前路由的组件,router-link 生成跳转链接,代码里用 useRouter 和 useRoute 拿到路由对象和当前路由信息:

\`\`\`js
// router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: () => import('../views/List.vue') },
    { path: '/student/:id', component: () => import('../views/Detail.vue') },
  ]
})

export default router
\`\`\`

\`\`\`vue
<template>
  <router-link to="/">列表</router-link>
  <router-view />
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function goDetail(id) {
  router.push(\`/student/\${id}\`)   // 编程式跳转
}
console.log(route.params.id)       // 读取路由参数
<\/script>
\`\`\`

跨组件共享状态用 Pinia,Vue 官方推荐的下一代状态管理。defineStore 定义一个 store,state 放数据,getters 放派生值,actions 放修改数据的方法:

\`\`\`js
// stores/students.js
import { defineStore } from 'pinia'

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: []
  }),
  getters: {
    passCount: (state) => state.students.filter(s => s.score >= 60).length
  },
  actions: {
    add(s) { this.students.push({ id: Date.now(), ...s }) },
    remove(id) { this.students = this.students.filter(s => s.id !== id) }
  }
})
\`\`\`

组件里调用 useStudentStore 拿到 store,模板里直接使用。store 里的状态是响应式的,解构时用 storeToRefs 保持响应式:

\`\`\`vue
<script setup>
import { storeToRefs } from 'pinia'
import { useStudentStore } from '../stores/students'

const store = useStudentStore()
const { students, passCount } = storeToRefs(store)

store.add({ name: '新生', score: 88 })   // actions 直接调用
<\/script>
\`\`\`

什么时候用 Pinia、什么时候用组合式函数?简单判断:数据只在一个页面用,组合式函数就够;数据要在多个页面、多个组件间共享并保持一致,Pinia 更合适,它还自带开发者工具支持,方便调试。

## 小案例:完整的成绩管理系统

把四篇的知识汇成一个完整项目:store 统一管理学生数据,列表页用组合式函数做过滤统计,路由实现列表和详情两个页面:

\`\`\`js
// stores/students.js
import { defineStore } from 'pinia'

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: [
      { id: 1, name: '小明', score: 90 },
      { id: 2, name: '小红', score: 95 },
      { id: 3, name: '小白', score: 55 },
    ]
  }),
  getters: {
    avg: (state) => (state.students.reduce((a, s) => a + s.score, 0) / state.students.length).toFixed(1),
    passCount: (state) => state.students.filter(s => s.score >= 60).length
  },
  actions: {
    add(s) { this.students.push({ id: Date.now(), ...s }) },
    remove(id) { this.students = this.students.filter(s => s.id !== id) }
  }
})
\`\`\`

\`\`\`vue
<!-- views/List.vue -->
<template>
  <div>
    <input v-model="keyword" placeholder="搜索">
    <p>平均分:{{ store.avg }} | 及格:{{ store.passCount }}人</p>
    <ul>
      <li v-for="s in filtered" :key="s.id">
        <router-link :to="\`/student/\${s.id}\`">{{ s.name }} - {{ s.score }}</router-link>
        <button @click="store.remove(s.id)">删除</button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStudentStore } from '../stores/students'

const store = useStudentStore()
const keyword = ref('')
const filtered = computed(() =>
  store.students.filter(s => s.name.includes(keyword.value))
)
<\/script>
\`\`\`

\`\`\`vue
<!-- views/Detail.vue -->
<template>
  <div>
    <p>{{ student.name }} - {{ student.score }}分</p>
    <p>{{ student.score >= 60 ? '及格' : '不及格' }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStudentStore } from '../stores/students'

const route = useRoute()
const store = useStudentStore()
const student = computed(() =>
  store.students.find(s => s.id === Number(route.params.id))
)
<\/script>
\`\`\`

到这里,一个 Vue 3 应用的完整骨架就立起来了:组件组织界面,组合式函数复用逻辑,Pinia 管理共享状态,路由串起页面。这套结构足以支撑日常开发中的绝大多数需求。

## 小结

四篇走完,主线是清晰的:响应式和指令让数据驱动视图,组件和插槽让界面可拆分,computed 与 watch 处理派生和副作用,组合式 API 让逻辑按功能组织并可复用,最后路由和 Pinia 把页面和状态串成完整应用。下一步的进阶方向:TypeScript 的类型标注、组件库的使用、以及用这套知识把成绩管理系统接到后端接口上,和 SQL 系列的数据表对应起来,做一个真正前后端打通的练手项目。
`;export{n as default};

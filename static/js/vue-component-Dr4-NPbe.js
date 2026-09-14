const n=`## 组件的四种关系

界面一大,把所有代码塞在一个文件里就不可维护了。组件(Component)是 Vue 里可复用的界面单元:一块模板加一段逻辑,打包成一个"自定义标签",哪里需要就放哪里。组件名习惯用 PascalCase 大写驼峰,使用时分两步:先 import 引入,再在模板里当标签写。

组件之间默认数据不共享,每个组件有自己的作用域,这是组件化的基础。要跨组件传数据,先看清两个组件是什么关系。任意两个组件,无非四种关系:父子(直接嵌套)、兄弟(同一个父组件下的两个)、隔代(祖孙,中间隔着层级)、远亲(完全没有血缘,甚至不在一个页面)。

这四种关系可以归成两大类:父子类和兄弟/远亲类。父子类的通信是"顺着组件树走",机制讲究精准,一共有六种:props 与 emit、$parent 与 $children、provide 与 inject、ref 与 defineExpose、$attrs、插槽。兄弟与远亲之间没有直接通道,必须找一个"中间人"搭桥,常用的有三种:mitt 事件总线、Pinia 状态管理、localStorage 与 sessionStorage。

> 判断顺序:先看组件关系是父子类还是非父子类,再在对应机制里挑。能用 props 与 emit 解决的就不要上总线。

## props与emit:父子直连

props 父传子,emit 子传父,是最基础的一对组合,大部分通信需求到此为止。

子组件用 defineProps 声明自己接受哪些数据,可以带类型和默认值:

\`\`\`vue
<!-- StudentTable.vue: 声明 props 接收数据 -->
<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="s in list" :key="s.id">{{ s.name }} - {{ s.score }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  list: {
    type: Array,
    required: true,
    default: () => []
  }
})
<\/script>
\`\`\`

父组件用 v-bind 把数据传进去,属性名用短横线写法对应子组件的驼峰声明:

\`\`\`vue
<StudentTable title="一班成绩" :list="students" />
\`\`\`

props 是单向数据流:数据只能从父流向子,子组件不允许直接修改 props 的值。想改数据,应该让父组件改,或者子组件发事件请父组件改。这个纪律避免了数据被多个组件乱改、出了问题不知道是谁改的。

子组件需要通知父组件"发生了某件事"(比如用户点了删除),用 emit。子组件先用 defineEmits 声明事件,再在需要的地方触发:

\`\`\`vue
<!-- StudentRow.vue: 声明事件, 点击时抛给父组件 -->
<template>
  <li>
    {{ s.name }} - {{ s.score }}
    <button @click="$emit('remove', s.id)">删除</button>
  </li>
</template>

<script setup>
defineProps(['s'])
defineEmits(['remove'])
<\/script>
\`\`\`

父组件在标签上监听这个事件,写 @remove 接住,收到子组件传来的参数:

\`\`\`vue
<!-- 父组件监听事件并处理 -->
<template>
  <ul>
    <StudentRow v-for="s in students" :key="s.id" :s="s" @remove="handleRemove" />
  </ul>
</template>

<script setup>
import StudentRow from './StudentRow.vue'
import { ref } from 'vue'

const students = ref([
  { id: 1, name: '小明', score: 90 },
])

function handleRemove(id) {
  students.value = students.value.filter(s => s.id !== id)
}
<\/script>
\`\`\`

props 往下传数据,emit 往上抛事件,一上一下构成父子通信的闭环。

## $parent与$children:退役的直连

Vue2 时代,组件实例上挂着 $parent 和 $children,可以顺着组件树直接摸到对方的内部数据,看起来很方便。Vue3 直接移除了 $children,$parent 虽然还在,但官方明确不推荐使用。

原因在于它破坏了单向数据流:任何组件都能绕过 props 直接改祖先的内部状态,改动路径无法追踪,组件之间被焊死成强耦合,抽出来复用就崩。Vue3 的设计哲学是"数据流明确可见",所以这类"走后门"的 API 要么删除要么打入冷宫。

> 一句话:这类 API 在 Vue3 里已经退役,了解它的历史作用即可,新代码不要再用。它的三种用途分别有正规替代——想拿父组件数据用 props,想调子组件方法用 ref 加 defineExpose,想跨层级传数据用 provide 与 inject。

## provide与inject:跨层级透传

父子通信里最尴尬的场景是隔代:爷爷的数据要给孙子用,按规矩得先传给儿子再传给孙子,中间那层组件只是"二传手",自己根本不用这份数据,却要声明一堆 props。provide 与 inject 就是为跨层级透传准备的:祖先组件 provide 提供数据,任意后代 inject 注入使用,中间层完全不用参与。

典型场景是全局配置,比如当前登录用户、主题色、班级信息。以班级信息为例,顶层提供,深层组件直接用:

\`\`\`vue
<!-- App.vue: 顶层提供班级信息 -->
<script setup>
import { provide, ref } from 'vue'

const className = ref('一班')
const semester = ref('2026 秋')

provide('className', className)
provide('semester', semester)
<\/script>
\`\`\`

\`\`\`vue
<!-- 深层组件注入使用, 中间隔着多少层都无所谓 -->
<template>
  <p>{{ className }} - {{ semester }}</p>
</template>

<script setup>
import { inject } from 'vue'

const className = inject('className')
const semester = inject('semester', '默认学期')
<\/script>
\`\`\`

provide 传的是响应式数据,祖先改值,所有 inject 它的后代都会同步更新。inject 第二个参数是默认值,防止祖先没提供时拿到 undefined。它的局限是数据来源不明显:看组件代码不知道这份数据是谁提供的,所以只适合长链路透传的公共数据,普通父子关系仍然老老实实用 props。

## ref与defineExpose:父调子方法

props 传的是数据,如果父组件想调用的不是数据而是子组件的方法(比如让表单组件自己清空),模板 ref 配合 defineExpose 就是正规做法。

script setup 的组件默认是封闭的,内部的东西对外不可见,这是刻意设计,避免父组件乱摸子组件内部。子组件想开放什么,就通过 defineExpose 列出来:

\`\`\`vue
<!-- StudentForm.vue: 通过 defineExpose 开放 reset 方法 -->
<template>
  <div>
    <input v-model="name" placeholder="姓名">
    <input v-model.number="score" placeholder="成绩">
  </div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const score = ref(0)

function reset() {
  name.value = ''
  score.value = 0
}

defineExpose({ reset })
<\/script>
\`\`\`

父组件给子组件标签挂一个 ref,就能通过这个引用调用开放出来的方法:

\`\`\`vue
<!-- 父组件: 模板 ref 拿到子组件实例, 调用开放的方法 -->
<template>
  <div>
    <StudentForm ref="formRef" @add="handleAdd" />
    <button @click="formRef.reset()">清空表单</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StudentForm from './StudentForm.vue'

const formRef = ref()

function handleAdd(s) {
  // 新增逻辑
}
<\/script>
\`\`\`

这套机制适合"父组件要指挥子组件做事"的场景,比如触发校验、调用保存、打开弹窗。它和 emit 的分工是:子组件主动发生的事用 emit 上报,父组件主动下的命令用 ref 调用。

## $attrs:属性透传

中间层组件经常遇到一个尴尬:它只是给底层组件套个壳(加边框、加动画),父组件传下来的属性它自己并不关心,却得全部声明一遍再转发。$attrs 就是干这个的:中间层不声明的属性和事件,会自动收集在 $attrs 里,原样透传下去。

\`\`\`vue
<!-- StudentCard.vue: 套个壳, 属性和事件原样透传 -->
<template>
  <div class="card">
    <StudentTable v-bind="$attrs" />
  </div>
</template>

<script setup>
import StudentTable from './StudentTable.vue'
<\/script>
\`\`\`

使用的时候照常写属性和事件,它们会穿过 StudentCard 一路落到 StudentTable 上:

\`\`\`vue
<StudentCard title="一班成绩" :list="students" @remove="handleRemove" />
\`\`\`

Vue2 里事件监听单独叫 $listeners,Vue3 把它合并进了 $attrs,属性与事件统一透传,少记一个概念。默认情况下 $attrs 还会自动继承到组件的根元素上,如果不想让这些属性落在根元素,就把 inheritAttrs 设为 false,自己决定怎么分配。

## 插槽:内容分发

有时候子组件的某块内容要由父组件决定,比如弹窗的标题和按钮文字。插槽(Slot)就是在子组件模板里留一个"空位",父组件用标签内容把它填上。

默认插槽:子组件里写 slot 标签,父组件写在组件标签内部的内容就会渲染到这个位置:

\`\`\`vue
<!-- Dialog.vue -->
<template>
  <div class="dialog">
    <slot>默认内容</slot>
    <button>确定</button>
  </div>
</template>
\`\`\`

\`\`\`vue
<Dialog>确认删除这个学生吗?</Dialog>
\`\`\`

具名插槽给多个空位起名字,父组件用 v-slot:名字 指定填充哪个:

\`\`\`vue
<!-- Dialog.vue -->
<template>
  <div class="dialog">
    <header><slot name="title">提示</slot></header>
    <main><slot name="content" /></main>
    <footer><slot name="actions" /></footer>
  </div>
</template>
\`\`\`

\`\`\`vue
<Dialog>
  <template #title>删除确认</template>
  <template #content>删除后无法恢复</template>
  <template #actions>
    <button @click="confirm">删除</button>
  </template>
</Dialog>
\`\`\`

#title 是 v-slot:title 的简写。还有一种作用域插槽:子组件把内部数据通过 slot 抛给父组件,父组件拿到数据决定怎么渲染,常用在"列表组件但每一行长什么样由调用方决定"的场景。

## mitt事件总线:兄弟之间的邮局

兄弟组件之间没有父子通道,数据想让对方知道,需要一个中间人。事件总线(EventBus)就是最轻量的中间人:一方往总线上发事件,另一方在总线上订阅,双方互不认识,完全解耦。

Vue2 时代用 new Vue() 当总线,靠 $on、$off、$emit 收发。Vue3 把这些实例方法移除了,改用 mitt 这个微型库,API 几乎同名,先建一个总线:

\`\`\`js
// utils/eventBus.js: 导出一个全局总线
import mitt from 'mitt'

const eventBus = mitt()

export default eventBus
\`\`\`

发事件的一方在合适时机 emit,比如搜索框输入时通知兄弟组件过滤列表:

\`\`\`vue
<!-- SearchBar.vue: 发事件 -->
<template>
  <input v-model="keyword" placeholder="按姓名搜索" @input="onSearch">
</template>

<script setup>
import { ref } from 'vue'
import eventBus from '../utils/eventBus.js'

const keyword = ref('')

function onSearch() {
  eventBus.emit('search', keyword.value)
}
<\/script>
\`\`\`

订阅的一方用 on 监听,注意组件销毁前必须 off,否则组件反复挂载会留下多个监听,同一个事件触发多次:

\`\`\`vue
<!-- StudentTable.vue: 订阅事件 -->
<script setup>
import { onBeforeUnmount } from 'vue'
import eventBus from '../utils/eventBus.js'

function handleSearch(keyword) {
  // 按关键词过滤列表
}

eventBus.on('search', handleSearch)

onBeforeUnmount(() => {
  eventBus.off('search', handleSearch)
})
<\/script>
\`\`\`

总线的优点是灵活:发与收完全解耦,隔着多少层组件树都无所谓。缺点是事件是全局广播,项目大了事件名满天飞,谁发的、谁收的都得靠人工记忆,排查问题时要全局搜索。所以它适合偶发性的、跨组件树的通信,不适合高频的共享数据读写。

## Pinia状态管理:共享数据的单一仓库

如果一份数据有多个组件都要读、都要改(比如学生列表:列表页要显示,统计组件要算平均分,新增表单要往里加数据),用总线来回传会越来越乱。这种场景的正规解是状态管理:把共享数据集中到一个仓库(store)里,任何组件直接读写仓库,不需要互相通信。

Vue2 用 Vuex,Vue3 官方主推 Pinia,API 更简洁。定义一个学生仓库,数据、派生值、修改方法都收在里面:

\`\`\`js
// stores/student.js
import { defineStore } from 'pinia'

export const useStudentStore = defineStore('student', {
  state: () => ({
    students: [
      { id: 1, name: '小明', score: 90 },
    ],
  }),
  getters: {
    avgScore(state) {
      const sum = state.students.reduce((acc, s) => acc + s.score, 0)
      return state.students.length ? (sum / state.students.length).toFixed(1) : '0'
    },
  },
  actions: {
    addStudent(s) {
      this.students.push(s)
    },
    removeStudent(id) {
      this.students = this.students.filter(s => s.id !== id)
    },
  },
})
\`\`\`

任何组件想用,调用一次 useStudentStore 拿到同一个仓库实例。统计组件只读平均分,列表组件负责增删,两边不需要知道对方的存在:

\`\`\`vue
<!-- ScoreSummary.vue: 任意组件都能读派生值 -->
<template>
  <p>班级平均分:{{ store.avgScore }}</p>
</template>

<script setup>
import { useStudentStore } from '../stores/student.js'

const store = useStudentStore()
<\/script>
\`\`\`

\`\`\`vue
<!-- 列表组件: 数据与操作都走 store -->
<script setup>
import { storeToRefs } from 'pinia'
import { useStudentStore } from '../stores/student.js'

const store = useStudentStore()
const { students } = storeToRefs(store)

function handleAdd(s) {
  store.addStudent(s)
}
<\/script>
\`\`\`

注意解构 store 的属性时要用 storeToRefs 包一层,否则解构出来的只是当时的值快照,失去响应性。Pinia 适合跨多个组件的共享业务数据;反过来,只有单个组件自己用的局部状态就不要往 store 里放,那属于滥用。

## localStorage与sessionStorage:浏览器存储搭桥

两个组件还能通过浏览器存储间接通信:一方写进去,另一方读出来,存储本身成了共享的"留言板"。适合放登录信息、用户偏好这类需要持久化的配置。以列表排序方式为例:

\`\`\`js
// 写入: 保存排序偏好
localStorage.setItem('sortBy', 'score')

// 读取: 另一组件启动时取出, 没有则用默认值
const sortBy = localStorage.getItem('sortBy') || 'name'
\`\`\`

sessionStorage 的 API 与 localStorage 完全相同,区别只在生命周期:localStorage 永久保存直到手动清除,sessionStorage 关闭标签页即失效。两者的共同局限是:数据变化不会自动通知其他组件,读的一方只有主动去读才知道变了;而且只能存字符串,存对象要自己 JSON 序列化,容量也只有几兆。所以它适合低频的持久化配置,不适合实时通信,更不能替代状态管理。

## 按场景怎么选

九种方式摆在一起容易懵,记住"先分关系、再挑机制"就不会选错。

父子类有六种:常规数据流用 props(父传子)加 emit(子传父);跨越多层透传用 provide 与 inject;父组件要调用子组件方法用 ref 加 defineExpose;中间层不想声明属性用 $attrs 透传;内容结构由父组件决定用插槽;$parent 与 $children 已退役,不再考虑。

非父子类有三种:偶发事件用 mitt 总线;多组件共享业务数据用 Pinia;只存持久化配置用 localStorage 与 sessionStorage。

> 选择口诀:能 props 与 emit 就不用总线;跨层级才 provide 与 inject;需要全局共享才 Pinia;只想存个配置才用浏览器存储。

## 小结

组件通信的本质是先判断组件关系:父子类顺着组件树走(props 与 emit、provide 与 inject、ref 与 defineExpose、$attrs、插槽),非父子类靠中间人搭桥(mitt 事件总线、Pinia 状态管理、localStorage 与 sessionStorage)。Vue3 相对 Vue2 的调整集中体现了一个原则:数据流要明确——$children 被移除、$listeners 并入 $attrs、Vuex 换成 Pinia、总线换成 mitt。掌握了这套地图,下一篇讲组件内部的两个得力工具:计算属性与侦听器。
`;export{n as default};

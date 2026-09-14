const n=`## 组件是什么

界面一大,把所有代码塞在一个文件里就不可维护了。组件(Component)是 Vue 里可复用的界面单元:一块模板加一段逻辑,打包成一个"自定义标签",哪里需要就放哪里。

使用组件分两步:先 import 引入,再在模板里用组件名当标签写。组件名习惯用 PascalCase 大写驼峰:

\`\`\`vue
<template>
  <StudentTable :list="students" />
</template>

<script setup>
import StudentTable from './StudentTable.vue'
import { ref } from 'vue'

const students = ref([
  { id: 1, name: '小明', score: 90 },
])
<\/script>
\`\`\`

组件与组件之间数据不共享,每个组件有自己的作用域,这是组件化的基础。需要跨组件传数据,就要靠下面三种机制:props 从上往下传,emit 从下往上通知,插槽从外往里塞内容。

## Props:父传子

父组件把数据传给子组件,靠 props。子组件用 defineProps 声明自己接受哪些数据,还可以带类型和默认值:

\`\`\`vue
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

## Emit:子传父

子组件需要通知父组件"发生了某件事"(比如用户点了删除),用 emit。子组件先用 defineEmits 声明事件,再在需要的地方触发:

\`\`\`vue
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

props 往下传数据,emit 往上抛事件,一上一下构成组件通信的闭环。事件名约定用短横线(remove-item),这样在模板里写 @remove-item 和代码里 emit 的名字天然对应。

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

## 小案例:拆解学生成绩系统

把上一篇的列表拆成三个组件,体会 props、emit、插槽的实际分工。父组件 StudentsPage 持有数据,StudentTable 负责渲染表格,StudentForm 负责新增学生的表单:

\`\`\`vue
<!-- StudentsPage.vue -->
<template>
  <div>
    <StudentForm @add="handleAdd" />
    <StudentTable :list="students" @remove="handleRemove" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StudentForm from './StudentForm.vue'
import StudentTable from './StudentTable.vue'

const students = ref([
  { id: 1, name: '小明', score: 90 },
])

let nextId = 2
function handleAdd(s) {
  students.value.push({ id: nextId++, ...s })
}
function handleRemove(id) {
  students.value = students.value.filter(s => s.id !== id)
}
<\/script>
\`\`\`

StudentForm 组件里用 v-model 收集姓名和成绩,提交时 emit add 事件把数据交给父组件:

\`\`\`vue
<!-- StudentForm.vue -->
<template>
  <div>
    <input v-model="name" placeholder="姓名">
    <input v-model.number="score" placeholder="成绩">
    <button @click="submit">新增</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const name = ref('')
const score = ref(0)
const emit = defineEmits(['add'])

function submit() {
  if (!name.value) return
  emit('add', { name: name.value, score: score.value })
  name.value = ''
  score.value = 0
}
<\/script>
\`\`\`

这套结构是 Vue 应用的标准骨架:页面组件持有数据,展示组件靠 props 接收数据,交互组件靠 emit 上报动作,数据永远只在一个地方改,流向清晰可追踪。

## 小结

组件化三件套:props 父传子(单向数据流,子组件不可改),emit 子传父(事件上报,父组件处理),插槽父填子(内容分发,还支持具名和作用域)。掌握了它们,就能把界面拆成层次分明的小组件。下一篇讲组件内部的两个得力工具:计算属性和侦听器。
`;export{n as default};

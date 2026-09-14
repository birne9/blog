## 一个最小的 Vue 应用

Vue 的核心思想是把界面和数据绑定起来:数据变了,界面自动跟着变,不用手动操作 DOM。先看一个最小例子:

```js
import { createApp, ref } from 'vue'

const app = createApp({
  setup() {
    const message = ref('Hello, Vue!')
    return { message }
  },
  template: '<h1>{{ message }}</h1>'
})

app.mount('#app')
```

createApp 创建应用,mount 把它挂载到页面上的某个元素。setup 里定义响应式数据,template 里用双花括号输出。

真实项目里用的是单文件组件,一个 .vue 文件包含三块:template 写模板,script 写逻辑,style 写样式:

```vue
<template>
  <h1>{{ message }}</h1>
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello, Vue!')
</script>
```

script 标签带 setup 属性时,里面定义的变量直接在模板里可用,不需要手动 return,这是 Vue 3 推荐的写法,本系列全部使用这种写法。工程搭建用 Vite 一条命令:create-vue 或 npm create vue,按提示选 Vue + JavaScript 即可。

## 响应式数据:ref 与 reactive

Vue 3 有两种声明响应式数据的方式。ref 适合基本类型,在 script 里要用 .value 读写,在模板里自动解包,直接写变量名:

```vue
<template>
  <p>{{ score }}</p>
  <button @click="score++">加分</button>
</template>

<script setup>
import { ref } from 'vue'
const score = ref(90)
score.value = 95   // script 里必须 .value
</script>
```

reactive 适合对象,读写直接用属性,不需要 .value:

```vue
<script setup>
import { reactive } from 'vue'
const student = reactive({
  name: '小明',
  score: 90
})
student.score = 95   // 直接改属性
</script>
```

新手最容易踩的坑就是忘了 ref 的 .value,在 script 里直接 score = 95 会把响应式引用整个替换成普通数字,界面就不会更新了。记忆方法:模板自动解包,script 手动解包。

响应式的原理一句话:Vue 3 用 Proxy 拦截对象的读写,数据一变就知道谁在用这个数据,从而精准更新对应的界面,不需要手动调任何刷新函数。

## 常用指令

指令是写在标签上的特殊属性,以 v- 开头,负责把数据和 DOM 行为连起来。

v-bind 把数据绑定到属性上,简写是冒号。v-on 绑定事件,简写是 @。v-if 按条件渲染,v-else-if、v-else 配合使用;v-show 也是条件显示,区别是 v-if 不渲染 DOM,v-show 只是切换 display 样式:

```vue
<template>
  <img :src="avatar" :alt="name">
  <button @click="save">保存</button>
  <p v-if="score >= 90">优秀</p>
  <p v-else-if="score >= 60">及格</p>
  <p v-else>不及格</p>
  <p v-show="loading">加载中...</p>
</template>
```

v-for 循环渲染列表,遍历数组或对象。一定要给循环项加唯一的 :key,它帮助 Vue 精确追踪每一项,列表增删时才不会错乱:

```vue
<template>
  <ul>
    <li v-for="s in students" :key="s.id">{{ s.name }} - {{ s.score }}</li>
  </ul>
</template>

<script setup>
import { ref } from 'vue'
const students = ref([
  { id: 1, name: '小明', score: 90 },
  { id: 2, name: '小红', score: 95 },
])
</script>
```

v-model 是双向绑定的语法糖,表单输入和响应式数据互相同步,本质是 :value 加 @input 的组合:

```vue
<template>
  <input v-model="keyword" placeholder="搜索学生">
  <p>当前搜索:{{ keyword }}</p>
</template>

<script setup>
import { ref } from 'vue'
const keyword = ref('')
</script>
```

事件和 v-model 还支持修饰符:keyup.enter 只在按回车时触发,click.stop 阻止冒泡,v-model.number 自动转数字,v-model.trim 去掉首尾空格。

## 小案例:学生成绩列表

把这一篇的知识串起来,做一个学生成绩列表:数据是响应式的,输入框过滤姓名,按钮给成绩排序:

```vue
<template>
  <div>
    <input v-model="keyword" placeholder="按姓名搜索">
    <button @click="sortDesc">按成绩降序</button>
    <ul>
      <li v-for="s in filtered" :key="s.id">
        {{ s.name }} - {{ s.score }}分
        <span v-if="s.score >= 90">(优秀)</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const students = ref([
  { id: 1, name: '小明', score: 90 },
  { id: 2, name: '小红', score: 95 },
  { id: 3, name: '小白', score: 81 },
])

const keyword = ref('')
const filtered = computed(() =>
  students.value.filter(s => s.name.includes(keyword.value))
)

function sortDesc() {
  students.value.sort((a, b) => b.score - a.score)
}
</script>
```

模板里的 v-for 遍历 computed 算出的 filtered,输入框一变 filtered 自动重算,列表自动更新。sortDesc 直接改数组,sort 会触发响应式更新。这个案例在后续几篇会逐步扩展成完整的成绩管理系统。

> 这里用到了 computed(计算属性),第三篇会专门讲它。现在只需要知道:它根据 students 和 keyword 自动算出 filtered,依赖数据一变就自动重算,是模板里做"派生数据"的标准工具。

## 小结

这一篇的地基:响应式数据(ref/reactive)让数据驱动视图,指令(v-bind/v-on/v-if/v-for/v-model)负责把数据接到界面上。记住两个关键纪律:script 里 ref 必须 .value,v-for 必须带 :key。下一篇把界面拆成组件,讲组件之间怎么传数据。

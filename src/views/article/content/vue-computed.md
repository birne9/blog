## 计算属性 computed

模板里经常要写一些"由其他数据算出来的值",比如过滤后的列表、平均分。直接在模板里写表达式会又长又难读,而且每次渲染都重新计算。computed 就是专门解决这个的:声明一个计算属性,它根据依赖的数据自动算出结果,而且会缓存——依赖不变,取多少次都只算一次:

```vue
<template>
  <p>平均分:{{ avgScore }}</p>
  <p>及格人数:{{ passCount }}</p>
</template>

<script setup>
import { ref, computed } from 'vue'

const students = ref([
  { id: 1, name: '小明', score: 90 },
  { id: 2, name: '小红', score: 95 },
  { id: 3, name: '小白', score: 55 },
])

const avgScore = computed(() => {
  const total = students.value.reduce((sum, s) => sum + s.score, 0)
  return (total / students.value.length).toFixed(1)
})

const passCount = computed(() =>
  students.value.filter(s => s.score >= 60).length
)
</script>
```

computed 的回调里用到了哪些响应式数据,就依赖哪些数据;它们一变,computed 自动重算,模板自动更新。computed 默认只读,直接给它赋值会报错;确实需要可写时,可以给它同时定义 getter 和 setter,setter 里写反向修改依赖数据的逻辑,不过日常开发极少用到。

一个常见的对比问题:computed 和普通函数都能算结果,为什么用 computed?区别就在缓存:函数每次渲染都执行,computed 只在依赖变化时重算。列表很长、计算很重的时候,这个差距就是性能差距。

## 侦听器 watch

computed 负责"算值",watch 负责"响应变化"。当某个数据变化时,你要执行一段副作用逻辑(请求接口、存本地、操作其他数据),就用 watch。它显式指定监听谁、变化后做什么:

```vue
<script setup>
import { ref, watch } from 'vue'

const keyword = ref('')
const page = ref(1)

watch(keyword, (newVal, oldVal) => {
  console.log('搜索词变化:', oldVal, '->', newVal)
  page.value = 1   // 搜索词变了, 页码重置回第一页
})
</script>
```

监听 ref 直接传变量;监听 reactive 对象的属性要写成函数形式。监听整个对象默认是浅层的,对象内部属性变化不会触发,需要 deep: true 深度监听;想让监听器一注册就先执行一次,加 immediate: true:

```vue
<script setup>
import { reactive, watch } from 'vue'

const filter = reactive({ keyword: '', classId: 1 })

watch(
  () => filter.keyword,
  (val) => console.log('关键词变为', val)
)

watch(
  () => filter,
  () => console.log('过滤条件变化了'),
  { deep: true }
)
</script>
```

watchEffect 是 watch 的简化版:不用指定监听谁,回调里用到什么就自动监听什么,依赖变化就重新执行。适合"不管哪些数据,变了就重跑这段逻辑"的场景:

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const keyword = ref('')
const classId = ref(1)

watchEffect(() => {
  // 自动依赖 keyword 和 classId, 任一变化都重新请求
  console.log('请求列表:', classId.value, keyword.value)
})
</script>
```

## computed 与 watch 怎么选

两个工具职责不同,选错的症状很明显。判断口诀:要一个"结果值"给模板用,用 computed;要"变化的副作用"执行动作,用 watch。

典型场景对照:列表过滤、平均分、购物车总价,这些都是派生值,用 computed;输入防抖搜索、路由变化后重新请求、数据保存到 localStorage,这些都是副作用,用 watch。另一个实用判断:computed 必须同步返回结果,watch 回调里可以做任何异步操作。如果一个"计算"里要发请求、要定时器,它不是 computed,是 watch。

## 生命周期钩子

一个组件从创建到销毁,会经历一系列时间点,Vue 在这些时间点提供钩子函数,让你挂上自己的逻辑。Vue 3 组合式写法里最常用的四个:

onMounted 组件挂载到页面后执行,是发起数据请求、初始化第三方库的最佳时机。onBeforeUnmount 组件销毁前执行,用来清理定时器、移除事件监听,防止内存泄漏。onUpdated 组件更新后执行,onUnmounted 组件销毁后执行:

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const students = ref([])
let timer = null

onMounted(async () => {
  // 页面出来后再拉数据
  const res = await fetch('/api/students')
  students.value = await res.json()
  // 启动轮询
  timer = setInterval(() => console.log('心跳'), 30000)
})

onBeforeUnmount(() => {
  // 组件要销毁了, 清理定时器
  clearInterval(timer)
})
</script>
```

注意 onMounted 里写 await 是允许的,但别把整个 setup 变成异步的,setup 本身不能是 async 函数。清理资源这条纪律必须养成:定时器、事件监听、WebSocket 连接,在哪里创建就要在 onBeforeUnmount 里对应销毁,不然组件销毁后这些"幽灵引用"还在跑,轻则内存泄漏,重则重复请求。

## 小案例:成绩统计面板

给成绩系统加一个统计面板:平均分、最高分用 computed 派生,搜索词变化用 watch 重置页码并打印日志,onMounted 模拟从接口加载数据:

```vue
<template>
  <div>
    <input v-model="keyword" placeholder="搜索姓名">
    <p>平均分:{{ avg }} | 最高分:{{ max }} | 及格率:{{ passRate }}%</p>
    <ul>
      <li v-for="s in filtered" :key="s.id">{{ s.name }} - {{ s.score }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const students = ref([])
const keyword = ref('')

const avg = computed(() => {
  if (!students.value.length) return 0
  return (students.value.reduce((a, s) => a + s.score, 0) / students.value.length).toFixed(1)
})
const max = computed(() => Math.max(...students.value.map(s => s.score), 0))
const passRate = computed(() => {
  if (!students.value.length) return 0
  const pass = students.value.filter(s => s.score >= 60).length
  return Math.round(pass / students.value.length * 100)
})
const filtered = computed(() =>
  students.value.filter(s => s.name.includes(keyword.value))
)

watch(keyword, () => {
  console.log('搜索:', keyword.value)
})

onMounted(async () => {
  const res = await fetch('/api/students')
  students.value = await res.json()
})
</script>
```

这个面板里四个 computed 各司其职,模板里只放变量名,干净易读;数据一变,统计自动刷新,不需要任何手动更新调用。

## 小结

这一篇的两个工具要分清:computed 派生值,带缓存,给模板用;watch/watchEffect 响应变化,执行副作用,做动作。生命周期钩子里最重要的是 onMounted(初始化)和 onBeforeUnmount(清理)。下一篇进入组合式 API 的核心思想:怎么把这些能力组织成可复用的逻辑单元。

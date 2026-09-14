## 一个最小的 React 应用

React 的核心思想是组件化:界面由一个个组件拼出来,数据变了就重新渲染,不用手动操作 DOM。先看一个最小例子:

```jsx
import { createRoot } from 'react-dom/client'

const root = createRoot(document.getElementById('root'))
root.render(<h1>Hello, React!</h1>)
```

createRoot 在页面里创建根容器,render 把界面渲染进去。这里 `<h1>` 不是字符串也不是 HTML,而是 JSX——一种写在 JavaScript 里的"标签语法",编译后变成普通的函数调用。

工程搭建用 Vite 一条命令:npm create vite@latest my-app -- --template react,然后 npm install、npm run dev 就能跑起来。创建出来的项目里 App 组件默认套在 StrictMode 中,它只在开发环境帮你发现潜在问题,不影响生产运行。

## JSX 语法规则

JSX 看起来像 HTML,但本质是 JavaScript,所以它有几条和 HTML 不一样的规矩。

大括号 {} 里可以写任意 JavaScript 表达式,用来嵌入变量、计算结果:

```jsx
const name = '小明'
const score = 90

const el = (
  <div>
    <h1>你好, {name}</h1>
    <p>{score >= 60 ? '及格' : '不及格'}</p>
  </div>
)
```

一个组件只能返回一个根元素,多个标签要用 div 包起来,或者用不渲染任何 DOM 的空标签 Fragment(简写 <>...</>)。class 是 JavaScript 的保留字,所以样式类名要写成 className;属性名一律驼峰,onclick 写成 onClick,tabindex 写成 tabIndex。

JSX 里写注释要用 {/* 注释 */} 包起来,直接写 // 或 <!-- --> 都不行。动态属性值用大括号,静态属性值可以写引号:className="card" 和 className={cls} 都对。

## 函数组件与 props

组件就是一个返回 JSX 的函数,函数名首字母必须大写,React 靠大小写区分组件和普通标签:

```jsx
function StudentCard({ name, score }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>成绩: {score} 分</p>
    </div>
  )
}

// 像标签一样使用, 首字母大写
<StudentCard name="小明" score={90} />
<StudentCard name="小红" score={95} />
```

父组件把数据写在标签属性上传下去,子组件通过参数接收,这就是 props。props 是只读的:子组件里不能给 props.name 赋值,要改只能让父组件改。数据永远从上往下流,这条单向数据流的纪律让组件之间的依赖关系一目了然。

参数可以解构,上面 StudentCard 的写法就是把 props 对象拆成 name 和 score。不传值时可以给默认值:function StudentCard({ name = '未知', score = 0 })。

拆分组件的原则很简单:界面里重复出现的部分、或是一块职责独立的部分,就抽成一个组件。拆得越细,每个组件越好读、越好复用。

## 小案例:学生卡片列表

把这一篇的知识串起来,做一个学生成绩卡片列表:数据写在数组里,用 map 遍历渲染成一组卡片:

```jsx
function App() {
  const students = [
    { id: 1, name: '小明', score: 90 },
    { id: 2, name: '小红', score: 95 },
    { id: 3, name: '小白', score: 81 },
  ]

  return (
    <div>
      <h2>学生成绩</h2>
      {students.map((s) => (
        <StudentCard key={s.id} name={s.name} score={s.score} />
      ))}
    </div>
  )
}
```

map 返回的是一组 JSX,React 会按顺序渲染出来。key 是每项的身份证,帮助 React 精确追踪哪一项变了,列表增删时才不会错乱,一定要给唯一的 key(用 id,别用下标)。这个案例在后续几篇会逐步扩展成完整的成绩管理系统。

> 条件渲染在 map 里也常用:想只显示及格的学生,就在 map 前先 filter,或者在大括号里写 students.filter(...).map(...)。下一篇和第三篇会专门讲事件和条件渲染。

## 小结

这一篇的地基:JSX 让 JavaScript 直接描述界面,函数组件负责拆块,props 负责传数据。记住三条纪律:组件首字母大写、只能返回一个根元素、props 只读。下一篇讲 state——组件自己的会变的数据,以及事件处理。

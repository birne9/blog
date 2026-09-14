const n=`## 状态:useState

props 是父组件给的,不能改;组件自己的、会变化的数据叫 state(状态)。useState 用来声明状态:

\`\`\`jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>点击了 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  )
}
\`\`\`

useState(0) 声明了一个初值为 0 的状态,返回一个数组:第一个元素是当前值 count,第二个元素是修改函数 setCount。解构出来的两个名字是约定俗成,可以随便起。

改状态必须调用 setCount,直接写 count = 1 没有任何效果——React 只有在 setCount 被调用时才知道数据变了,然后带着新值重新渲染组件,界面才跟着更新。每次重新渲染都会重新执行组件函数,useState 保证 count 拿到的是最新值。

状态是组件私有的:同一个 Counter 用两次,两个实例的 count 互不影响,各数各的。

## 不可变更新

对象和数组的状态,要复制一份再改,不能直接改原值:

\`\`\`jsx
const [student, setStudent] = useState({ name: '小明', score: 90 })
// 对: 展开复制后改属性
setStudent({ ...student, score: 95 })
// 错: 直接改原对象, 引用没变, React 不更新
// student.score = 95

const [list, setList] = useState(['a', 'b'])
setList([...list, 'c'])                       // 新增
setList(list.filter((x) => x !== 'a'))        // 删除
\`\`\`

为什么必须这样:React 靠"引用变没变"来判断状态是否更新,比较用的是浅比较。直接改原对象的属性,引用还是同一个,React 认为没变化就跳过了更新。数组的 push、sort 这些原地修改的方法都要避免,改用返回新数组的方式。

连续多次更新同一个状态时,推荐函数式写法:setCount((c) => c + 1)。函数拿到的一定是最新值,不会因为闭包里的旧值而出错,下一节的例子就能看到区别。

## 事件处理

JSX 里用 onClick、onChange 这类驼峰属性绑定事件,值传函数本身,不是函数的调用结果:

\`\`\`jsx
function Form() {
  const [name, setName] = useState('')

  function handleSubmit(e) {
    e.preventDefault()   // 阻止表单默认的整页刷新
    alert('提交: ' + name)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="输入姓名"
      />
      <button type="submit">提交</button>
    </form>
  )
}
\`\`\`

onClick={handleSubmit} 传的是函数引用;写成 onClick={handleSubmit()} 会在渲染时就立刻执行,还拿不到事件对象,是新手最常见的错误。需要传参数时用箭头函数包一层:onClick={() => remove(s.id)}。

事件处理函数的第一个参数 e 是合成事件,和原生事件用法基本一致,e.target 拿到触发元素,e.preventDefault() 阻止默认行为。上面的输入框就是受控组件的雏形:输入框的值完全由 state 控制,用户一输入就 onChange 更新状态,状态一变界面跟着变,值永远和状态一致——这个模式第三篇会展开讲。

## 小案例:成绩加减器

把状态和事件串起来,做一个学生成绩面板:两个按钮加减分,一个按钮重置:

\`\`\`jsx
function ScorePanel() {
  const [score, setScore] = useState(80)

  return (
    <div>
      <p>当前成绩: {score} 分</p>
      <button onClick={() => setScore(score + 5)}>+5</button>
      <button onClick={() => setScore(score - 5)}>-5</button>
      <button onClick={() => setScore(80)}>重置</button>
    </div>
  )
}
\`\`\`

把 +5 改成连续加:onClick={() => setScore((s) => s + 5)}。两种写法在单次点击时结果一样,但函数式写法在连续快速点击、或一个事件里多次更新时更可靠,因为它永远基于最新值计算。习惯上"新值依赖旧值"就用函数式更新,是新手的标准姿势。

> 状态设计有个原则:最小化状态。能从 props 算出来的不要存 state,能用公式推的不要存 state,状态越少,组件越不容易出 bug。score 这样的值算不出来才存,而"是否及格"就不用存——它是 score >= 60 的派生值,渲染时直接算。

## 小结

这一篇的核心:useState 声明状态,setCount 修改状态触发重渲染,修改对象数组要复制后改。事件用驼峰属性绑定,传函数引用。记住两条纪律:状态只能通过修改函数更新,更新永远基于不可变数据。下一篇讲条件渲染、列表和受控表单,把界面写得更灵活。
`;export{n as default};

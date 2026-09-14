const n=`## 副作用与 useEffect

渲染期间应该保持纯粹:同样的 props 和 state,渲染结果就应该一样。而请求数据、定时器、订阅、操作 DOM,这些都是"渲染之外的事",统称副作用。副作用必须放在 useEffect 里,它会在渲染完成后执行:

\`\`\`jsx
import { useEffect, useState } from 'react'

function Clock() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)   // 清理函数
  }, [])   // 空依赖数组: 只在挂载后执行一次

  return <p>现在时间: {now.toLocaleTimeString()}</p>
}
\`\`\`

useEffect 第一个参数是副作用函数,第二个参数是依赖数组,它决定副作用什么时候执行:依赖数组里的值变了,就重新执行。空数组代表"不依赖任何值",只在组件挂载后执行一次;不写依赖数组,每次渲染后都执行;写了 [count],count 变化时才执行。

副作用函数里 return 的函数是清理函数:组件卸载前、或下次副作用执行前,React 会先调用它,把上一次的副作用收尾。定时器要 clearInterval,订阅要取消,不然内存泄漏、旧数据乱跳。

依赖数组要如实填写:副作用里用到的、会变化的值,都要写进去。漏了依赖,闭包里的值就是旧的,很多"诡异 bug"都来自这里。Vite 创建的 React 项目自带 ESLint 规则,漏写依赖会直接提示。

## 数据请求

最常见的副作用是从接口拉数据。初始数据是空数组,挂载后发请求,拿到数据再更新状态:

\`\`\`jsx
function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>加载中...</p>
  return (
    <ul>
      {students.map((s) => <li key={s.id}>{s.name}</li>)}
    </ul>
  )
}
\`\`\`

空依赖数组保证请求只发一次,而不是每次渲染都发。loading 状态让首屏有反馈,是请求类组件的标配。

请求还有个经典竞态问题:列表页切到详情页,慢的旧请求后返回,把新页面的数据覆盖了。用清理函数加一个"忽略标记"就能解决:

\`\`\`jsx
useEffect(() => {
  let ignore = false

  fetch('/api/students')
    .then((res) => res.json())
    .then((data) => {
      if (!ignore) setStudents(data)
    })

  return () => {
    ignore = true   // 组件卸载后, 旧请求的结果直接丢弃
  }
}, [])
\`\`\`

## useRef:拿到真实 DOM

大部分时候不用碰 DOM,但聚焦输入框、读取滚动位置这类场景确实需要。useRef 返回一个盒子,挂在元素的 ref 属性上,就能拿到真实 DOM:

\`\`\`jsx
import { useRef } from 'react'

function FocusInput() {
  const inputRef = useRef(null)

  return (
    <div>
      <input ref={inputRef} placeholder="输入姓名" />
      <button onClick={() => inputRef.current.focus()}>聚焦</button>
    </div>
  )
}
\`\`\`

inputRef.current 就是那个 input 元素,想怎么操作都行。useRef 和 state 的最大区别:改 ref 的值不会触发重新渲染,所以它适合存"变了但不影响界面"的东西——DOM 引用、定时器 id、上一次的值。

## 自定义 Hook

多个组件有重复逻辑时,把它抽成以 use 开头的函数,这就是自定义 Hook。上一节的请求逻辑抽出来:

\`\`\`jsx
function useStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/students')
      .then((res) => res.json())
      .then((data) => {
        setStudents(data)
        setLoading(false)
      })
  }, [])

  return { students, loading }
}

// 组件里一行代码复用全部逻辑
function StudentList() {
  const { students, loading } = useStudents()
  if (loading) return <p>加载中...</p>
  return (
    <ul>
      {students.map((s) => <li key={s.id}>{s.name}</li>)}
    </ul>
  )
}
\`\`\`

自定义 Hook 是普通函数,内部可以用其他 Hook,名字必须以 use 开头——这是约定,ESLint 靠它识别 Hook 并检查规则。每个组件调用 useStudents 都是独立的一份状态,互不干扰。

计算量大的派生数据还可以用 useMemo 缓存:useMemo(() => 计算结果, [依赖]),依赖不变时直接返回上次的结果,跳过重复计算。同样,useCallback 用来缓存函数引用,避免每次渲染都生成新函数导致子组件跟着重渲染。两者都是性能工具,先用起来,等界面明显卡了再优化也不迟。

## 小案例:带清理的搜索框

把定时器、状态、清理串起来:输入停止半秒后才执行搜索,这是防抖的简化版:

\`\`\`jsx
function SearchBox() {
  const [keyword, setKeyword] = useState('')
  const [result, setResult] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setResult(\`搜索: \${keyword}\`)
    }, 500)

    return () => clearTimeout(timer)   // 每次输入都清掉上一个定时器
  }, [keyword])

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="输入关键词"
      />
      <p>{result}</p>
    </div>
  )
}
\`\`\`

keyword 每变一次,先清掉上一个定时器,再立一个新定时器,只有停止输入半秒后定时器才真正执行。清理函数在这里不是收尾,而是防抖的核心机制——"下次执行前先撤销上次",这个心智模型能解释大部分 useEffect 的行为。

> 一个常见困惑:为什么 useEffect 里读到的 keyword 总是最新的?因为 keyword 变了 React 就重新执行副作用,而依赖数组保证了这一点。如果把 keyword 从依赖数组里漏掉,定时器里读到的永远是第一次的值——依赖数组是 useEffect 正确性的关键。

## 小结

这一篇补齐了 React 的最后一块地基:useEffect 处理渲染之外的副作用,依赖数组控制执行时机,清理函数负责收尾;useRef 拿 DOM,自定义 Hook 复用逻辑。记住两条纪律:依赖数组如实填写,定时器和订阅必须清理。四篇下来,组件、props、state、事件、列表、表单、副作用已经构成完整的 React 基础闭环,接下来就是拿真实项目练习了。
`;export{n as default};

## 条件渲染

界面经常要"符合条件才显示"。JSX 里不能写 if 语句,但大括号里可以写表达式,所以条件渲染有两种标准写法:&& 和三元表达式。

```jsx
function Grade({ score }) {
  return (
    <div>
      {score >= 90 && <span>优秀</span>}
      {score >= 60 ? <span>及格</span> : <span>不及格</span>}
    </div>
  )
}
```

&& 的逻辑是"前面为真就渲染后面的 JSX",适合"有或没有"的场景;三元适合"二选一"的场景,两段 JSX 都要写。

&& 有个经典陷阱:左边是 0 时,0 是假值,&& 会直接把这个 0 渲染出来,界面上凭空出现一个数字 0。所以左边一定要是布尔表达式,写成 list.length > 0 && <List />,或者干脆用三元。

逻辑复杂时别硬塞在 JSX 里,先在函数体里用 if 算好结果,再渲染:

```jsx
function Grade({ score }) {
  let text
  if (score >= 90) text = '优秀'
  else if (score >= 60) text = '及格'
  else text = '不及格'

  return <span>{text}</span>
}
```

## 列表渲染:map 与 key

列表用 map 渲染,这是 React 的绝对主力:

```jsx
function StudentList({ students }) {
  return (
    <ul>
      {students.map((s) => (
        <li key={s.id}>{s.name} - {s.score} 分</li>
      ))}
    </ul>
  )
}
```

map 里的每一项必须带 key,它是 React 追踪元素的身份证。React 更新列表时靠 key 判断哪一项是新增的、哪一项被删了,key 错了列表就会错乱:该复用 DOM 的时候新建,该新建的时候复用。

key 的规矩:在同级列表里唯一即可(不同列表之间可以重复);要稳定,数据不变 key 不变;优先用数据的 id,没有 id 再用组合字段,不要用数组下标——列表增删时下标会变,同样的下标指向了不同的数据,React 就会更新错元素。

列表为空时给个友好提示,这是好习惯:

```jsx
{students.length === 0
  ? <p>暂无学生</p>
  : students.map((s) => <li key={s.id}>{s.name}</li>)}
```

## 受控表单

第二篇已经见过雏形:输入框的 value 由 state 控制,onChange 更新状态。React 里推荐所有表单都这么做,称为受控组件——输入的值永远来自 state,状态是唯一的数据源:

```jsx
function SearchBox() {
  const [keyword, setKeyword] = useState('')

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索学生"
      />
      <p>当前搜索: {keyword}</p>
    </div>
  )
}
```

其他表单元素同理,只是属性和事件略有差别。文本域用 value + onChange;下拉框 select 也用 value + onChange,选中项的值由 value 决定;复选框用 checked + onChange:

```jsx
const [checked, setChecked] = useState(false)
<input
  type="checkbox"
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
/>
```

受控的好处:输入框的值随时在 state 里,想校验、想过滤、想清空,直接操作状态就行,输入框自动跟着变。

## 状态提升

两个组件要共享一份数据时,把 state 放到它们共同的父组件里,通过 props 传下去,这就是状态提升:

```jsx
function App() {
  const [keyword, setKeyword] = useState('')
  const students = [
    { id: 1, name: '小明', score: 90 },
    { id: 2, name: '小红', score: 95 },
    { id: 3, name: '小白', score: 81 },
  ]
  const filtered = students.filter((s) => s.name.includes(keyword))

  return (
    <div>
      <SearchBox keyword={keyword} onKeywordChange={setKeyword} />
      <StudentList students={filtered} />
    </div>
  )
}
```

SearchBox 自己不持有状态,value 和 onChange 都由父组件传进来,变成"受控组件";filtered 是渲染时现算的派生数据,不用存 state。数据流始终单向:状态在 App,改动回调往上走,数据往下传。哪一层持有状态,就以哪一层为界,往下全是 props。

## 小案例:学生成绩筛选器

把这一篇串起来:输入框按姓名过滤,成绩用条件渲染标等级,列表为空显示提示:

```jsx
function App() {
  const [keyword, setKeyword] = useState('')
  const students = [
    { id: 1, name: '小明', score: 90 },
    { id: 2, name: '小红', score: 95 },
    { id: 3, name: '小白', score: 81 },
  ]
  const filtered = students.filter((s) => s.name.includes(keyword))

  return (
    <div>
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="按姓名搜索"
      />
      {filtered.length === 0 ? (
        <p>没有匹配的学生</p>
      ) : (
        <ul>
          {filtered.map((s) => (
            <li key={s.id}>
              {s.name} - {s.score} 分
              {s.score >= 90 && <span> (优秀)</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

输入框一变 keyword 更新,filtered 重算,列表重渲染——整条链路没有任何手动 DOM 操作。这个案例和 Vue 系列第三篇的成绩列表是同一个需求,两个框架的实现对照着看,能清楚感受到"声明式渲染"的共同思路。

> 空状态判断建议放在组件函数体里先算好变量,再在 JSX 里用三元渲染,这样 JSX 不会越嵌套越深。另外注意 && 左边是 filtered.length === 0 这种布尔表达式,不是数组长度本身。

## 小结

这一篇的武器:&& 和三元做条件渲染,map 加稳定 key 渲染列表,value + onChange 做受控表单,共享数据靠状态提升。记住两条纪律:key 用稳定 id 别用下标,&& 左边必须是布尔。下一篇讲 useEffect,处理请求、定时器这些"渲染之外"的事。

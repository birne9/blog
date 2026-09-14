const n=`## interface:描述对象的形状

上一篇讲过,TS 给对象标类型是"描述结构"。当这个结构在多处使用——比如 Student 对象在函数参数、返回值、数组里反复出现——就应该把它抽出来命名,这个命名结构就是 interface:

\`\`\`ts
interface Student {
    id: number
    name: string
    score: number
}

// 标注一个对象
const xiaoming: Student = { id: 1, name: "小明", score: 90 }

// 标注参数和返回值
function findById(id: number): Student {
    return { id, name: "小明", score: 90 }
}

// 标注数组元素
const list: Student[] = [xiaoming]
\`\`\`

interface 只描述形状,不产生任何运行时代码,编译后完全擦除。字段多了少了、类型不对,编译器都会报错——这是接口联调场景里最实用的能力:后端说返回 {"id":1,"name":"小明","score":90},前端把这个结构写成 interface,后端改了字段名,前端编译立刻报错,不用等联调时才发现。

可选字段和只读字段是接口的两个常用修饰:

\`\`\`ts
interface Student {
    readonly id: number      // 只读: 创建后不可修改
    name: string
    score: number
    remark?: string          // 可选: 可以有也可以没有
}

const s: Student = { id: 1, name: "小明", score: 90 }
s.id = 2          // 编译报错: id 是只读属性
s.remark          // string | undefined, 使用时需要判空
\`\`\`

readonly 的语义和 Java 里的 final 一致:初始化后不可变。可选字段本质是"该字段的类型自动变成 string | undefined",所以访问可选字段时 TS 会提醒你判空——这个行为既烦人又救场,烦在每次都要判断,救在判断的过程就是防御 null 崩溃的过程。

前端类比:interface 之于 TS,相当于 Java 的 interface 之于 Java——都是"声明契约,不产生实现"。区别是 Java 的 interface 描述"有哪些方法",TS 的 interface 描述"对象长什么样"。再类比一层:props 的校验规则、后端接口文档里的返回字段说明,本质都是在做同一件事——约定数据结构。interface 是把口头约定写进代码,让编译器替你盯着。

## type 与 interface 的分工

TS 里有两个定义类型的关键字:interface 和 type,大部分场景可以互换,但各有主场。interface 专长是描述对象结构,且支持声明合并(同名的 interface 会合并成一个);type 是"类型别名",任何类型都能起名,联合类型、字面量组合这些 interface 干不了的事都归它:

\`\`\`ts
// type 的强项: 联合类型、字面量、函数类型、交叉类型
type Grade = "A" | "B" | "C" | "D"
type Id = number | string
type Comparator = (a: number, b: number) => number
type Scored = Student & { rank: number }   // 交叉: 两个类型合并

// interface 的强项: 对象结构, 可扩展、可合并
interface BaseEntity {
    id: number
}

interface Student extends BaseEntity {
    name: string
    score: number
}
\`\`\`

extends 表示接口继承:Student 继承 BaseEntity 后,自动拥有 id 字段——这和 Java 的接口继承、类的继承是同一个词、同一个思路。交叉类型 & 则是把两个类型"拼"在一起,Scored 就是 Student 加一个 rank 字段。

日常选型的实用建议:描述对象结构优先 interface(可扩展、报错信息更清晰),定义联合类型、函数类型、工具类型用 type。两者混用完全合法,团队约定统一即可。

## 泛型:让类型也参数化

泛型是 TS 的核心特性,解决的问题一句话:函数或组件要"兼容多种类型",同时"保持类型关系"。看一个没有泛型的例子,从接口取数据的函数:

\`\`\`ts
// 没有泛型: 返回 any, 类型信息全丢了
function request(url: string): any {
    return { data: [] }
}

const result = request("/api/students")
result.data   // any, 拼错字段也不报错
\`\`\`

加了泛型之后,调用方决定返回类型,函数内部保持类型关系:

\`\`\`ts
// 泛型函数: <T> 声明类型参数, 调用时传入具体类型
function request<T>(url: string): { data: T } {
    return { data: [] as unknown as T }
}

interface Student {
    id: number
    name: string
    score: number
}

const result = request<Student[]>("/api/students")
result.data   // Student[], 有完整补全和类型检查
\`\`\`

读法:request 是一个泛型函数,T 是它的类型参数,调用时用 request<Student[]> 把 T 指定成 Student[]。函数签名里的 T 就像函数参数,只不过传的不是值而是类型——所以叫"类型参数"。

泛型用在哪?第一高频场景就是数据请求封装,axios 本身就是这么设计的:

\`\`\`ts
// axios 的泛型用法: 声明返回类型
import axios from "axios"

const student = await axios.get<Student>("/api/students/1")
student.data.score   // number, 类型安全
\`\`\`

第二高频是容器类:一个"分页结果"的结构,每页的数据类型不同,但外壳相同:

\`\`\`ts
interface PageResult<T> {
    total: number
    page: number
    list: T[]
}

const studentPage: PageResult<Student> = {
    total: 100,
    page: 1,
    list: [],
}

const scorePage: PageResult<number> = {
    total: 3,
    page: 1,
    list: [90, 85, 78],
}
\`\`\`

PageResult<T> 是"泛型接口":外壳结构写一次,装什么数据由调用方定。前端类比:这就像 Vue 里的泛型组件——一个列表组件能渲染各种数据,数据不同但分页、加载逻辑相同。Java 后端的同学更熟:和 Java 的 List<T>、Map<K,V> 是同一个概念,换了个语法位置。

泛型还能加约束,用 extends 限定 T 必须满足某个形状:

\`\`\`ts
// 约束 T 必须有 id 字段, 函数体内才能安全使用 value.id
function getById<T extends { id: number }>(list: T[], id: number): T | undefined {
    return list.find((item) => item.id === id)
}
\`\`\`

## 内置工具类型

TS 内置了一批"工具类型",本质都是泛型,用来做类型变换。最常用的三个,语义从名字就能猜:

\`\`\`ts
interface Student {
    id: number
    name: string
    score: number
}

// Partial: 所有字段变可选 —— 表单局部更新场景
type PartialStudent = Partial<Student>
// { id?: number; name?: string; score?: number }

// Pick: 只取指定字段 —— 列表页只展示部分字段
type StudentBrief = Pick<Student, "id" | "name">
// { id: number; name: string }

// Omit: 排除指定字段 —— 新增时去掉后端生成的 id
type StudentInput = Omit<Student, "id">
// { name: string; score: number }
\`\`\`

三个工具类型的实战位置:新增学生的表单提交对象用 Omit<Student, "id">(id 是后端生成,前端不该传);编辑时允许只改部分字段,用 Partial<Student>;列表接口返回的简要信息用 Pick<Student, "id" | "name">。它们都对应真实接口场景,不是语法炫技。

\`\`\`ts
// 新增接口的典型签名
function createStudent(input: Omit<Student, "id">): Promise<Student> {
    return axios.post("/api/students", input).then((res) => res.data)
}

// 调用时少传 id 会报错, 多传 id 也会报错
createStudent({ name: "小刚", score: 88 })        // 合法
createStudent({ id: 1, name: "小刚", score: 88 }) // 报错: id 不在 StudentInput 中
\`\`\`

## 小结

interface 描述对象结构,是前后端之间的数据契约;type 负责联合类型、函数类型等 interface 覆盖不到的场景;泛型让类型参数化,数据请求封装和容器结构是它的主战场,extends 可以给泛型加约束;Partial、Pick、Omit 三个工具类型覆盖了日常增删改查的类型变换。TS 的类型系统到这里已经能应付绝大多数业务开发,下一篇开始,把这些能力放进 Vue 和 React 工程里实战。
`;export{n as default};

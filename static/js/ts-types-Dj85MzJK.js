const n=`## 为什么前端需要类型

JavaScript 是动态类型:变量先声明,类型到运行时才知道。这带来两个经典痛点:一是写代码时编辑器不知道变量是什么类型,没有补全提示,拼错属性名也不报错;二是 bug 全部推迟到运行时爆发,传参传错了类型,页面报错时已经太晚。

\`\`\`js
// JavaScript: 没有任何类型约束
function getScore(student) {
    return student.score + 10
}

getScore({ score: 90 })   // 100, 正常
getScore(undefined)       // 运行时 TypeError: Cannot read properties of undefined
getScore({ score: "90" }) // "9010" —— 字符串拼接, 静默出错
\`\`\`

TypeScript 的解法是给代码加一层静态类型:类型在编译期检查,错误在写代码时就暴露。上面这个函数加上类型标注后:

\`\`\`ts
// TypeScript: 参数类型被明确声明
interface Student {
    name: string
    score: number
}

function getScore(student: Student): number {
    return student.score + 10
}

getScore(undefined)       // 编译报错: 类型不匹配
getScore({ score: "90" }) // 编译报错: score 应为 number
\`\`\`

这里要先纠正一个常见误解:TypeScript 不是新语言,它是 JavaScript 的超集——所有合法的 JS 都是合法的 TS,TS 只是在 JS 之上增加了类型语法。类型只存在于编译期,编译(tsc)之后全部擦除,产物就是纯 JS。前端类比:TS 之于 JS,就像 Java 基础篇里 javac 的编译检查——源码进编译器,类型错误在这一步拦住,而不是等运行时才发现。而类型标注之于前端组件,又像 props 的 PropTypes:提前声明"这里该传什么",传错立刻有提示。

## 基础类型标注

标注语法是统一的:变量名后加冒号和类型。JS 的八大基础类型在 TS 里都有对应,最常用的几个:

\`\`\`ts
// 基础类型
let name: string = "小明"
let age: number = 25
let isPass: boolean = true
let nothing: null = null
let notFound: undefined = undefined

// 数组: 两种写法等价
let scores: number[] = [90, 85, 78]
let students: Array<string> = ["小明", "小红"]

// 对象: 用字面量描述结构
let student: { name: string; score: number } = { name: "小明", score: 90 }

// 联合类型: 可能是几种类型之一
let result: number | string = 90
result = "优秀"

// 字面量类型: 只能是这几个值之一
let grade: "A" | "B" | "C" | "D" = "A"
\`\`\`

每天写得最多的两个:联合类型和字面量类型。联合类型用竖线连接多个类型,表示"或";字面量类型直接把具体值当类型,限定取值范围。两者经常组合:grade: "A" | "B" | "C" | "D" 就是"只能是这四个字符串之一"。

对象的类型标注有一点绕:不是给"对象"这个整体标类型,而是描述它的结构——有哪些字段、每个字段什么类型。这种"结构即类型"的玩法是 TS 区别于 Java 的重要一点,Java 要求先定义类再用,TS 可以直接把结构写在冒号后面,随手一个函数参数都能内联描述结构。

## any 与 unknown

any 是类型系统的逃生舱:标了 any 就等于关掉类型检查,想怎么用都行。它看起来方便,实则是给未来埋雷——用了 any 的地方,拼错属性、传错类型全都不报错,类型安全形同虚设:

\`\`\`ts
let data: any = fetchData()
data.score.name  // 不报错, 运行时才知道炸不炸
\`\`\`

unknown 是 any 的安全替代品:同样是"未知类型",但 unknown 不允许直接使用,必须先用类型收窄确认它是什么,才能操作:

\`\`\`ts
let data: unknown = fetchData()

// 直接使用会编译报错
// data.score           // 报错: data 是 unknown

// 收窄后才能安全使用
if (typeof data === "object" && data !== null && "score" in data) {
    // 这里 data 被收窄了
}
\`\`\`

一句话规则:不确定类型时用 unknown 而不是 any,unknown 逼你在使用前做检查,检查的过程就是在处理边界情况。前端类比:any 相当于表单校验全删了,随便提交;unknown 相当于保留校验但要求你先判断值合不合法。

## 类型推断与类型断言

TS 很聪明的地方在于:大部分时候类型不用你标,它能自己推断出来。初始化的变量,类型从初始值推断;函数返回值,类型从 return 语句推断:

\`\`\`ts
let score = 90          // 推断为 number
let name = "小明"       // 推断为 string
let list = [1, 2, 3]    // 推断为 number[]

function add(a: number, b: number) {
    return a + b        // 返回值推断为 number
}
\`\`\`

推断不出来或者推断错了怎么办?两个工具。一个是类型断言,用 as 告诉编译器"我比你清楚":

\`\`\`ts
// 断言: 明确告诉 TS 这个元素是 HTMLInputElement, 有 value 属性
const input = document.getElementById("name") as HTMLInputElement
input.value  // 没有断言这里会报错: HTMLElement 上没有 value
\`\`\`

另一个是显式标注,适合函数参数和对外暴露的接口——约定俗成:函数参数必须显式标注(参数无法从任何地方推断),返回值可以省略让 TS 推断。经验是"能推断的就不标,标了的一定是有意为之":标注越少,代码越干净,改动类型时也只需要改源头一处。

## 函数与类型

函数的类型标注分参数和返回值两处,返回值在参数列表后加冒号:

\`\`\`ts
// 参数标注 + 返回值标注
function getTotal(scores: number[]): number {
    return scores.reduce((sum, s) => sum + s, 0)
}

// 可选参数: 加问号, 调用时可以省略
function greet(name: string, greeting?: string): string {
    return greeting ? \`\${greeting}, \${name}\` : \`你好, \${name}\`
}

// 默认参数: 与 JS 相同
function createStudent(name: string, score: number = 60) {
    return { name, score }
}
\`\`\`

如果函数类型需要复用或作为参数传递,把函数类型抽出来写:

\`\`\`ts
// 函数类型: (参数) => 返回值
type Comparator = (a: number, b: number) => number

function sortScores(scores: number[], comparator: Comparator): number[] {
    return [...scores].sort(comparator)
}

// 传入满足该签名的函数
sortScores([90, 85, 78], (a, b) => b - a)
\`\`\`

学生成绩系统的第一个实战场景:给"根据分数评等级"的函数加类型。这个例子把本篇的知识点串起来——联合类型、字面量类型、类型推断:

\`\`\`ts
type Grade = "A" | "B" | "C" | "D"

function toGrade(score: number): Grade {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 60) return "C"
    return "D"
}

const grade: Grade = toGrade(95)   // "A"
\`\`\`

return 类型声明成 Grade 之后,编译器会检查每个 return 分支返回的字符串是否在 A/B/C/D 之内——想多返回一个 "E" 或打错成 "a" 都会立刻报错。类型在这里不是负担,是把"约定"变成了"机器强制执行"。

## 小结

TypeScript 在 JS 之上加了一层编译期类型检查,类型标注语法是冒号加类型,JS 所有代码在 TS 里都合法。基础类型、数组、对象结构、联合类型、字面量类型是每天的日常;any 是逃生舱应尽量少用,unknown 更安全;大部分类型靠推断,函数参数必须显式标注,断言用 as。类型系统的价值在编译期:编辑器补全、重构安全、错误前置,这些体验在你回到纯 JS 项目时会格外想念。下一篇进入 TS 的招牌特性:interface 与泛型。
`;export{n as default};

const n=`## 一个最简单的 Java 程序

Java 程序的最小单位是类,入口是 main 方法。正规写法如下:

\`\`\`java
// Hello.java —— 文件名必须与 public 类名完全一致
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
\`\`\`

几个规范要点:public 修饰的类只能有一个,且必须独占一个同名文件;main 方法的签名是固定的——public static void main(String[] args),一个都不能少;类名用大驼峰(Hello),变量和方法名用小驼峰(userName),这是全行业统一的约定。

运行分两步:先 javac Hello.java 编译成 Hello.class 字节码,再 java Hello 运行。IDE 里点运行其实是帮你把这两步连起来了。

> 一条语句以分号结尾;代码块用花括号包裹;Java 区分大小写,类名 Hello 和变量 hello 是两个东西。

通俗解释:整个流程可以类比前端构建。javac 编译相当于 TypeScript 转 JavaScript——都是把源码翻译成另一种格式,并在这一步做类型检查。JVM 运行字节码相当于浏览器/Node 执行 JS——所以 Java 号称"一次编写,到处运行",和前端"一个页面到处打开"是同一个思路:真正跑代码的不是操作系统,而是各平台上的虚拟机。前端类比串起来就是:.java 源文件 ≈ .ts 源码,.class 字节码 ≈ 编译后的 .js,JVM ≈ 浏览器或 Node 运行时,main 方法 ≈ 入口 HTML 里第一个执行的 script。

## 变量与数据类型

Java 是强类型语言:每个变量必须先声明类型,类型一旦确定不能改。这和 JavaScript 的 let x = 1; x = "hello" 完全不同。

### 八种基本类型

\`\`\`java
byte b = 100;               // 1字节, -128 ~ 127
short s = 30000;            // 2字节
int age = 25;               // 4字节, 最常用, 约正负21亿
long big = 9_000_000_000L;  // 8字节, 字面量末尾加 L
float f = 3.14f;            // 4字节, 字面量末尾加 f
double d = 3.14159;         // 8字节, 默认的小数类型
char c = 'A';               // 2字节, 单个字符, 用单引号
boolean flag = true;        // 只有 true / false 两个值
\`\`\`

正规写法:整数默认是 int,小数默认是 double,所以 long 和 float 的字面量要加后缀。数字较长时用下划线分隔只增加可读性,不影响数值。日常开发 90% 的场景用 int、double、boolean 三种就够了。

\`\`\`java
// 局部变量没有默认值, 必须先赋值再使用(编译期强制)
int x;
System.out.println(x);   // 编译报错: 变量 x 可能尚未初始化
\`\`\`

### 类型转换

小范围转大范围自动完成,大范围转小范围必须显式强转,并且可能丢失精度:

\`\`\`java
int a = 100;
long b = a;              // 自动转换, 安全
double c = a;            // 自动转换, 安全

double d = 3.99;
int e = (int) d;         // 强转, 直接截断小数, e = 3
int f = (int) 300L;      // 强转, 300 在 int 范围内, 安全

// 溢出: 超出范围会静默回绕, 不会报错
byte g = (byte) 128;     // 结果是 -128
\`\`\`

### 引用类型 String

\`\`\`java
String name = "Java";
System.out.println(name.length());        // 4
System.out.println(name.toUpperCase());   // JAVA
System.out.println(name + " 学习");        // 字符串拼接
System.out.println(name.equals("Java"));  // true, 内容比较
\`\`\`

String 是引用类型,但可以直接用字面量赋值,这是 Java 给它的特殊待遇。它不可变:任何"修改"操作都返回新字符串,原来的对象不动。比较内容一律用 equals,用 == 比的是内存地址,这是新手最常见的坑。

### 常量和命名

\`\`\`java
final double PI = 3.14159;   // final 修饰的变量是常量, 赋值后不可修改
\`\`\`

常量名习惯全大写、单词间下划线分隔(MAX_SIZE);变量和方法用小驼峰(getName);类名用大驼峰(HelloWorld)。包名全小写。

> 规范的价值在于"见名知义":别人(包括三个月后的你)看到 MAX_SIZE 就知道是常量,看到 setName 就知道是给 name 赋值的方法。

通俗解释:强类型 ≈ TypeScript 的静态类型——都靠编译器在运行前抓类型错误,这正是 Java 比 JS 啰嗦但更稳的原因。区别在于 Java 没有 any,也几乎没有类型推断(Java 10 加的 var 只能用于局部变量,类型仍是编译期固定的)。基本类型 ≈ 前端的 number/boolean 原生值;引用类型 ≈ 对象。Java 的 char 用单引号、String 用双引号,而 JS 里单双引号是同一个东西,这是转过来第一周最容易写错的地方。boolean 只有 true/false,没有 JS 里 0、""、null 的"假值"概念,条件判断必须写布尔表达式。整型溢出 ≈ JS 里 Number.MAX_SAFE_INTEGER 之外的精度丢失——都是"超出表示范围就静默出错",不熟悉机制时非常难排查。

## 运算符

\`\`\`java
int a = 10, b = 3;
System.out.println(a + b);            // 13 加法
System.out.println(a - b);            // 7
System.out.println(a * b);            // 30
System.out.println(a / b);            // 3  整数除法, 直接截断
System.out.println(a % b);            // 1  取余
System.out.println(a > b);            // true 比较
System.out.println(a >= b);           // true
System.out.println(a == b);           // false
System.out.println(a > 5 && b < 5);   // true 逻辑与
System.out.println(a > 5 || b > 5);   // true 逻辑或
System.out.println(!(a > 5));         // false 逻辑非
a++;                                 // 自增, 相当于 a = a + 1
int max = a > b ? a : b;              // 三元运算符
\`\`\`

正规写法:复合赋值运算如 a += 5 等价于 a = a + 5,推荐使用。自增有前缀 ++a 和后缀 a++ 之分,单独写没区别,但放在表达式里,前缀先加后用、后缀先用后加,建议只在单独一行使用,避免歧义。

> 整数除以整数结果还是整数:10 / 3 是 3 而不是 3.33。想要小数,先把其中一个操作数转成 double,比如 10.0 / 3。逻辑运算有短路特性:a > 5 && b < 5 里如果前半段为 false,后半段根本不会执行,利用这一点可以写安全判断:name != null && name.length() > 0。

通俗解释:这些运算符和 JS 几乎一一对应,只有三处差异要留意。第一,Java 的 == 对基本类型比数值,对对象比地址(想比内容用 equals),而 JS 的 == 是宽松相等、=== 才是严格相等,方向刚好反过来,别混着记。第二,Java 的 && 和 || 返回 boolean,而 JS 返回操作数本身(所以 JS 能写 const x = a || b 做默认值,Java 不行)。第三,Java 没有 ===,也不存在隐式布尔转换,0、"0"、null 放进 if 里都是编译错误。

## 流程控制

### if / else

\`\`\`java
int score = 85;
if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}
\`\`\`

正规写法:if 后面必须跟布尔表达式。省掉花括号时只有紧跟的一条语句属于 if,所以规范是任何时候都写花括号,哪怕只有一行。

### switch

\`\`\`java
int day = 3;
switch (day) {
    case 1:
        System.out.println("周一");
        break;
    case 2:
        System.out.println("周二");
        break;
    default:
        System.out.println("其他");
}
\`\`\`

正规写法:switch 的括号里支持 byte、short、char、int、String 和枚举(以及它们的包装类)。每个 case 末尾必须写 break,否则会"穿透"继续执行下一个分支——这几乎永远是 bug。default 不是必须的,但建议写上兜底。

### for / while / do-while

\`\`\`java
// 打印 0 到 4: for 适合循环次数确定的场景
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// while 适合循环次数由条件决定的场景
int j = 0;
while (j < 5) {
    System.out.println(j);
    j++;
}

// do-while 至少执行一次, 先做后判断
int k = 0;
do {
    System.out.println(k);
    k++;
} while (k < 5);
\`\`\`

### break 与 continue

\`\`\`java
for (int i = 0; i < 10; i++) {
    if (i == 3) continue;  // 跳过本次循环, 进入下一轮
    if (i == 8) break;     // 结束整个循环
    System.out.println(i); // 输出 0 1 2 4 5 6 7
}
\`\`\`

通俗解释:流程控制语法和 JS 完全同源(都是 C 语法家族),会 JS 就能直接上手。三个注意点:条件必须严格是 boolean(没有 JS 的真假值转换);switch 会穿透,JS 同样会穿透,但 JS 里很多人没写过 switch,Java 里它是考试和面试常客;Java 没有 for...in(那是给数组遍历加的下标循环,容易踩原型链的坑,Java 用增强 for 更干净,见数组章节)。

## 方法

方法是组织代码的基本单元,把一段逻辑封装起来复用。正规写法:

\`\`\`java
public class Calc {
    // 求两个 int 的最大值
    // 结构: 修饰符 返回值类型 方法名(参数列表) { 方法体 }
    public static int max(int a, int b) {
        return a > b ? a : b;
    }

    public static void main(String[] args) {
        int m = max(10, 20);
        System.out.println(m);   // 20
    }
}
\`\`\`

方法由修饰符、返回值类型、方法名、参数列表、方法体五部分组成。void 表示不返回任何值。方法体里 return 的值必须和声明的返回值类型匹配,这是编译期检查的。

### 方法重载

\`\`\`java
public static int max(int a, int b) { return a > b ? a : b; }
public static double max(double a, double b) { return a > b ? a : b; }
public static int max(int a, int b, int c) { return max(max(a, b), c); }
\`\`\`

方法名相同、参数列表不同(个数、类型或顺序)就叫重载,调用时编译器根据实参类型自动选一个。注意只看参数,与返回值类型无关,两个同名同参不同返回值的方法无法共存。

### 参数传递

\`\`\`java
public static void change(int n, String s) {
    n = 100;        // 改的是副本, 外面不变
    s = "world";    // 改的是引用副本, 外面不变
}

int x = 1;
String str = "hello";
change(x, str);
System.out.println(x);     // 1
System.out.println(str);   // hello
\`\`\`

Java 只有值传递:基本类型传值的副本,引用类型传引用的副本。方法里重新赋值参数不影响调用方,但通过引用修改对象内部是会影响的(比如往传入的 List 里 add 元素)。

### 可变参数

\`\`\`java
public static int sum(int... nums) {
    int total = 0;
    for (int n : nums) {
        total += n;
    }
    return total;
}

sum(1, 2, 3);       // 6
sum(10, 20);        // 30
sum();              // 0
\`\`\`

int... nums 本质是 int[] 数组,可以传零个或多个。规范:可变参数必须放在参数列表最后,一个方法最多一个。

通俗解释:方法 ≈ 前端的函数,重载 ≈ TypeScript 的函数重载(声明多个签名),但机制不同:Java 的重载在编译期由实参类型决定调用哪个,TS 的重载只是多套类型签名的合并,实现只有一个。参数传递和 JS 完全一致:基本类型传值、对象传引用副本,所以"方法里改参数变量不改外面,改对象内部改外面"这条规律可以原样搬过来。可变参数 ≈ JS 的 rest 参数 function f(...args),连"必须放在最后"的规则都一样。

## 数组

数组存放一组同类型数据,长度一旦确定不可改变。正规写法:

\`\`\`java
int[] nums = new int[5];       // 推荐写法: 类型后面跟中括号
nums[0] = 10;
// 默认值: 数值类型都是 0, boolean 是 false, 引用类型是 null

int[] scores = {90, 80, 70};   // 声明时直接初始化
System.out.println(scores.length);   // 3 长度是属性不是方法
System.out.println(scores[0]);       // 90
System.out.println(scores[scores.length - 1]);  // 70 最后一个元素
\`\`\`

另一种写法 int nums[] 语法上合法,但不推荐,规范统一用 int[]。

### 遍历数组

\`\`\`java
int[] scores = {90, 80, 70};
int sum = 0;
for (int i = 0; i < scores.length; i++) {
    sum += scores[i];
}

// 增强 for: 只读遍历, 写法最简洁
for (int s : scores) {
    System.out.println(s);
}
\`\`\`

### 常用工具 Arrays

\`\`\`java
int[] a = {3, 1, 2};

Arrays.sort(a);                          // 排序, 原地修改
System.out.println(Arrays.toString(a));  // [1, 2, 3] 打印数组的标准方式

int[] b = Arrays.copyOf(a, 5);           // 拷贝并扩容, 后两位是 0
int[] c = Arrays.copyOfRange(a, 0, 1);   // 截取 [0, 1)

Arrays.fill(b, -1);                      // 全部填充为 -1

int idx = Arrays.binarySearch(a, 2);     // 二分查找, 数组必须先排序
System.out.println(idx);                 // 1
\`\`\`

> 数组下标从 0 开始,访问越界会抛 ArrayIndexOutOfBoundsException,程序直接中断,这是新手最常见的运行时错误。直接 System.out.println(数组) 打印出来是内存地址,要用 Arrays.toString。

### 二维数组

\`\`\`java
int[][] grid = {{1, 2, 3}, {4, 5, 6}};
System.out.println(grid[1][2]);      // 6
System.out.println(grid.length);     // 2 行数
System.out.println(grid[0].length);  // 3 第一行的列数

for (int[] row : grid) {             // 二维数组的增强 for
    for (int v : row) {
        System.out.print(v + " ");
    }
}
\`\`\`

通俗解释:Java 数组最接近前端的是定长且强类型的版本——不像 JS 数组可以随便 push 和混类型,Java 数组声明时定类型、new 时定长度,之后只能改元素不能增删。要找 JS 的对应物,与其说 Array,不如说更像 typed array 加上了定长约束。增强 for 就是 for...of 的孪生兄弟,只读遍历。越界报错对比 JS 的 arr[99] 返回 undefined 是鲜明差异:一个严格,一个宽容。Arrays.toString 干的就是 JSON.stringify 的活。既然长度固定,想动态增删就用下一篇面向对象里的 ArrayList——它是"可伸缩的数组",对应前端真正的 Array。

## 小结

这一篇覆盖了 Java 语法最核心的部分:类型与变量、运算符、流程控制、方法与数组。正规写法记住五条:类名大驼峰、变量方法小驼峰、常量全大写、if/for 永远写花括号、字符串比较用 equals。机制上记住一件事:Java 的一切严格都在编译期和运行期拦着你犯错,这正是它与 JS 最大的气质差异。下一篇进入面向对象,学习如何组织更复杂的程序。
`;export{n as default};

const n=`## 一个最简单的 Java 程序

Java 程序的最小单位是类,入口是 main 方法。先看一个完整的例子:

\`\`\`java
// Hello.java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
\`\`\`

main 方法是程序执行的起点,写法固定。源文件名必须与 public 类名一致(这里是 Hello.java)。在 IDE(如 IntelliJ IDEA)里直接点运行,或用命令 javac Hello.java 编译、java Hello 运行。

> 一条语句以分号结尾;代码块用花括号包裹;Java 区分大小写。

## 变量与数据类型

Java 是强类型语言,每个变量必须先声明类型再使用。

### 八种基本类型

\`\`\`java
byte b = 100;              // 1字节, -128 ~ 127
short s = 30000;           // 2字节
int age = 25;              // 4字节, 最常用
long big = 9_000_000_000L; // 8字节, 字面量末尾加 L
float f = 3.14f;           // 4字节, 字面量末尾加 f
double d = 3.14159;        // 8字节, 默认小数类型
char c = 'A';              // 2字节, 单个字符, 用单引号
boolean flag = true;       // 只有 true / false 两个值
\`\`\`

整数默认是 int,小数默认是 double,所以 long 和 float 的字面量需要加后缀。数字较长时可以用下划线分隔,方便阅读。

### 引用类型 String

\`\`\`java
String name = "Java";
System.out.println(name.length());       // 4
System.out.println(name.toUpperCase());  // JAVA
System.out.println(name + " 学习");       // 字符串拼接
\`\`\`

String 是引用类型,但可以直接用字面量赋值。它不可变:任何"修改"操作都会产生新的字符串对象。

### 常量和命名

\`\`\`java
final double PI = 3.14159;
\`\`\`

final 修饰的变量是常量,赋值后不可修改。常量名习惯全大写、单词间用下划线;变量和方法名用驼峰式(userName、getAge),类名首字母大写(Hello)。

## 运算符

\`\`\`java
int a = 10, b = 3;
System.out.println(a + b);            // 13 加法
System.out.println(a / b);            // 3  整数除法, 直接截断
System.out.println(a % b);            // 1  取余
System.out.println(a > b);            // true 比较
System.out.println(a > 5 && b < 5);   // true 逻辑与
System.out.println(a > 5 || b > 5);   // true 逻辑或
System.out.println(!(a > 5));         // false 逻辑非
a++;                                  // 自增, 相当于 a = a + 1
int max = a > b ? a : b;              // 三元运算符
\`\`\`

> 整数除以整数结果还是整数:10 / 3 是 3 而不是 3.33。想要小数,先把其中一个操作数转成 double,比如 10.0 / 3。

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

> case 分支末尾要写 break,否则会"穿透"继续执行下一个分支,这通常是 bug 的来源。

### for / while / do-while

\`\`\`java
// 打印 0 到 4
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

int j = 0;
while (j < 5) {
    System.out.println(j);
    j++;
}

// do-while 至少执行一次
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

## 方法

方法是组织代码的基本单元,把一段逻辑封装起来复用。

\`\`\`java
public class Calc {
    // 求两个 int 的最大值
    public static int max(int a, int b) {
        return a > b ? a : b;
    }

    public static void main(String[] args) {
        int m = max(10, 20);
        System.out.println(m);   // 20
    }
}
\`\`\`

方法由修饰符、返回值类型、方法名、参数列表、方法体组成。void 表示不返回任何值。

### 方法重载

\`\`\`java
public static int max(int a, int b) { return a > b ? a : b; }
public static double max(double a, double b) { return a > b ? a : b; }
\`\`\`

方法名相同、参数列表不同(个数、类型或顺序)就叫重载。注意只看参数,与返回值类型无关。

## 数组

数组用于存放一组同类型的数据,长度一旦确定不可改变。

\`\`\`java
int[] nums = new int[5];     // 长度为 5, 默认都是 0
nums[0] = 10;

int[] scores = {90, 80, 70}; // 声明时直接初始化
System.out.println(scores.length);  // 3 数组长度
System.out.println(scores[0]);      // 90
\`\`\`

### 遍历数组

\`\`\`java
int[] scores = {90, 80, 70};
int sum = 0;
for (int i = 0; i < scores.length; i++) {
    sum += scores[i];
}

// 增强 for, 写法更简洁
for (int s : scores) {
    System.out.println(s);
}
\`\`\`

> 数组下标从 0 开始,访问越界会抛 ArrayIndexOutOfBoundsException,这是新手最常见的错误之一。

### 二维数组

\`\`\`java
int[][] grid = {{1, 2, 3}, {4, 5, 6}};
System.out.println(grid[1][2]);   // 6
\`\`\`

## 小结

这一篇覆盖了 Java 语法最核心的部分:类型与变量、运算符、流程控制、方法与数组。掌握这些就能写出基本逻辑了,下一篇进入面向对象,学习如何组织更复杂的程序。
`;export{n as default};

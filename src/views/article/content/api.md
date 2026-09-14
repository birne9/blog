## String 与 StringBuilder

String 是最常用的类,正规写法先过一遍常用方法:

```java
String s = "Hello,Java";
System.out.println(s.length());            // 10
System.out.println(s.charAt(0));           // H
System.out.println(s.substring(0, 5));     // Hello 左闭右开
System.out.println(s.contains("Java"));    // true
System.out.println(s.indexOf("Java"));     // 5 找不到返回 -1

String[] parts = s.split(",");             // ["Hello", "Java"]
String upper = s.toUpperCase();            // HELLO,JAVA
String lower = s.toLowerCase();
String replaced = s.replace("Java", "World");  // Hello,World
String trimmed = "  abc  ".trim();         // abc
boolean blank = s.isEmpty();               // false
System.out.println("a".equalsIgnoreCase("A")); // true
```

字符串比较一律 equals;判断空字符串用 isEmpty;拼接少量字符串直接 +,Java 编译器会自动优化。

String 不可变,每次"修改"都产生新对象。循环里频繁拼接要用 StringBuilder:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i).append(",");
}
String result = sb.toString();
```

正规写法:知道最终长度时可以 new StringBuilder(容量) 预分配空间,避免反复扩容;单线程用 StringBuilder,多线程的古老替代品是 StringBuffer(几乎用不到);拼接固定多个片段时,Java 8 的 String.join 和 Java 11 的 String.repeat 比手写循环更简洁。

> 为什么循环拼接要换 StringBuilder:String 不可变,循环里 a = a + i 每轮都创建新对象,1000 轮创建 1000 个中间对象,时间和内存都浪费。StringBuilder 内部是可变的字符数组,append 只往里塞,最后 toString 一次成型。

通俗解释:JS 的字符串也是不可变的,所以 substr/replace 返回新串的规则一样;JS 里用数组 push 再 join 优化大量拼接,Java 的 StringBuilder 就是这个思路的官方实现,append ≈ push,toString ≈ join。字符串 + 拼接两端语法相同。

## 包装类与自动装箱

每种基本类型都有对应的包装类:int 对应 Integer,double 对应 Double,char 对应 Character,boolean 对应 Boolean,其余首字母大写(byte 对应 Byte,long 对应 Long)。包装类是引用类型,可以放进集合、可以调用方法。

```java
Integer n = 100;          // 自动装箱: int 转 Integer
int m = n;                // 自动拆箱: Integer 转 int

int parsed = Integer.parseInt("123");     // 字符串转整数
double d = Double.parseDouble("3.14");    // 字符串转小数
String text = String.valueOf(456);        // 数字转字符串
```

正规写法:字符串和数值互转用 parseXxx 和 String.valueOf,这是标准做法;装箱拆箱由编译器自动完成,性能敏感的循环里避免无意义装箱。

> 包装类对象比较要用 equals,不要用 ==,因为 == 比较的是引用地址。经典坑:Integer a = 128; Integer b = 128; 此时 a == b 是 false。反过来 Integer c = 100; Integer d = 100; c == d 却是 true——因为 JVM 缓存了 -128 到 127 的 Integer 对象,超出范围就新建对象。结论:永远用 equals,别去记缓存范围。

### BigDecimal 精确计算

```java
System.out.println(0.1 + 0.2);   // 0.30000000000000004 浮点数精度丢失

BigDecimal a = new BigDecimal("0.1");   // 必须用字符串构造
BigDecimal b = new BigDecimal("0.2");
System.out.println(a.add(b));           // 0.3 精确

BigDecimal price = new BigDecimal("19.9");
BigDecimal total = price.multiply(new BigDecimal("3"));
// 除法除不尽必须指定精度和舍入模式, 否则抛异常
BigDecimal per = total.divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);
```

正规写法:金额、利率等对精度有要求的场景必须用 BigDecimal;构造必须用字符串(用 double 构造会把误差一起带进来);除不尽时指定保留位数和舍入模式。

通俗解释:0.1 + 0.2 不等于 0.3 是前端的著名梗,Java 一模一样——两端用的都是 IEEE 754 浮点标准。BigDecimal ≈ 前端的 decimal.js/big.js 这类精确计算库,都是"用字符串精确表示小数"的思路。自动装箱 ≈ JS 里的自动包装:str.length 背后 JS 也会把基本字符串临时包成 String 对象再调方法,机制相同。

## 集合框架

集合是 Java 最常用的 API,核心三类:List(有序可重复)、Set(无序不可重复)、Map(键值对)。正规写法是面向接口编程:左边写接口,右边写实现。

### ArrayList

```java
List<String> list = new ArrayList<>();   // 左边接口 List, 右边实现 ArrayList
list.add("苹果");
list.add("香蕉");
list.add("橙子");
System.out.println(list.size());          // 3
System.out.println(list.get(1));          // 香蕉 按下标取值
list.add(1, "梨");                        // 在下标 1 插入
list.remove(0);                           // 删除第一个元素
list.set(0, "桃");                        // 修改下标 0 的元素
System.out.println(list.contains("橙子")); // true

for (String fruit : list) {               // 遍历
    System.out.println(fruit);
}
```

ArrayList 底层是动态数组:按下标查询快,中间插入删除慢(要移动后面元素);LinkedList 是链表,中间插入删除快、查询慢。日常开发 90% 用 ArrayList。

正规写法:Java 9 起可以用 List.of 创建不可变集合:

```java
List<String> colors = List.of("红", "绿", "蓝");
colors.add("黄");   // 抛 UnsupportedOperationException, 不可变
```

排序用 Collections.sort 或 List.sort,配合 lambda 可以一行写完:

```java
List<String> names = new ArrayList<>(List.of("tom", "jerry", "ann"));
names.sort((a, b) -> a.length() - b.length());   // 按长度排序
```

### HashMap

```java
Map<String, Integer> map = new HashMap<>();
map.put("apple", 3);
map.put("banana", 5);
System.out.println(map.get("apple"));            // 3
System.out.println(map.getOrDefault("pear", 0)); // 0 不存在时返回默认值
System.out.println(map.containsKey("apple"));    // true

for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}
// Java 8+ 更简洁的遍历
map.forEach((k, v) -> System.out.println(k + " = " + v));
```

HashMap 按键取值速度极快,但遍历顺序不保证。需要有序时用 TreeMap(按键排序)或 LinkedHashMap(按插入顺序)。

> 自定义对象做 HashMap 的 key 时,必须重写 equals 和 hashCode(第二篇提过):HashMap 先用 hashCode 定位桶,再用 equals 精确比对,两个规则不一致时会出现"存进去取不出来"的诡异 bug。

### HashSet

```java
Set<Integer> set = new HashSet<>();
set.add(1);
set.add(2);
set.add(2);               // 重复元素不会重复添加
System.out.println(set.size());      // 2
System.out.println(set.contains(1)); // true
```

HashSet 用于去重和快速判断"是否存在",没有下标概念。需要排序的集合用 TreeSet。

### 集合与数组互转

```java
List<String> list = List.of("a", "b", "c");
String[] arr = list.toArray(new String[0]);   // 集合转数组, 正规写法传新数组
List<String> back = Arrays.asList(arr);       // 数组转集合(长度固定)
List<String> full = new ArrayList<>(Arrays.asList(arr));  // 可增删的拷贝
```

通俗解释:这三类集合和前端的对应物非常工整——ArrayList ≈ 前端的 Array,HashMap ≈ 前端的 Map,HashSet ≈ 前端的 Set,连 add/get/remove 这类方法名都高度相似。差异在于 Java 需要显式声明元素类型(泛型,第四篇讲),JS 数组随便混类型。List.of 的不可变集合 ≈ Object.freeze 过的数组,加元素直接报错而不是悄悄失败。for (String fruit : list) ≈ for...of,map.forEach((k, v) -> ...) ≈ map.forEach((v, k) => ...)(注意 JS 的回调参数顺序是 value, key,和 Java 相反,别写反)。

## 异常处理

程序出问题分两种:编译期能拦住的错误(语法、类型)和运行期才会出现的异常(除以零、空指针、文件不存在)。异常的正规处理:

```java
try {
    int r = 10 / 0;                  // 抛出 ArithmeticException
} catch (ArithmeticException e) {
    System.out.println("除数不能为 0");
} finally {
    System.out.println("无论是否异常都会执行");
}
```

异常体系:Throwable 是根,下面分 Error(严重的系统级错误,程序无力处理,不用管)和 Exception;Exception 又分受检异常(编译期强制处理,如 IOException,方法要么 try-catch 要么 throws 声明)和非受检异常(运行时异常,如 NullPointerException、IndexOutOfBoundsException,规范要求靠代码避免而不是捕获)。

throws 声明方法可能抛出的受检异常,自定义异常继承 Exception 或 RuntimeException:

```java
public class AgeException extends Exception {
    public AgeException(String msg) { super(msg); }
}

public static void check(int age) throws AgeException {
    if (age < 0) {
        throw new AgeException("年龄不能为负");
    }
}

// 调用方: try-catch 接住, 或者继续 throws 往上抛
try {
    check(-1);
} catch (AgeException e) {
    System.out.println(e.getMessage());   // 年龄不能为负
}
```

正规写法:catch 里写具体的异常类型,多个 catch 时子类在前父类在后(反过来子类永远匹配不到,编译器会报错);finally 常用于释放资源,但 Java 7 的 try-with-resources 更规范(见下节);业务校验用自定义异常,让异常类型自己表达错误语义。

> 抛出异常会中断当前流程,沿着调用栈往上冒泡,直到被 catch 或者到达 main 导致程序终止。规范是"该抛的抛,该接的接",不要 catch 了之后什么都不做把异常吞掉,那会让 bug 变得无迹可寻。

通俗解释:try/catch/finally、throw 的语法和 JS 完全一致,这部分可以无缝迁移。真正的新概念是"受检异常":Java 把一部分异常(如 IO)设计成编译期强制处理,不处理连编译都过不了,这是 JS 没有的机制——最接近的类比是 TS 的严格空值检查:不处理可能为 null 的值,编译就报错,逼你在写代码时就考虑失败分支。非受检异常(NPE 之类)≈ JS 的运行时 TypeError,靠代码质量避免。Error ≈ 前端进程级崩溃,代码里不处理。

## 文件 IO

IO 分字节流(InputStream/OutputStream)和字符流(Reader/Writer),处理文本用字符流并显式指定 UTF-8 编码。正规写法是 try-with-resources,资源用完自动关闭:

```java
import java.io.*;
import java.nio.charset.StandardCharsets;

// 写文件
try (BufferedWriter writer = new BufferedWriter(
        new OutputStreamWriter(new FileOutputStream("test.txt"), StandardCharsets.UTF_8))) {
    writer.write("第一行");
    writer.newLine();
    writer.write("第二行");
}   // 括号里的资源在块结束时自动 close, 不用手动调, 也不怕中途异常

// 读文件
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(new FileInputStream("test.txt"), StandardCharsets.UTF_8))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
```

逐行读写的经典模式就是上面这个 while ((line = readLine()) != null) 循环,框架和工具代码里到处都是。

### 现代写法 Files 与 Path

Java 7 引入的 NIO 风格更简洁,日常小文件读写优先用这个:

```java
import java.nio.file.*;
import java.util.List;

Path path = Paths.get("test.txt");

List<String> lines = Files.readAllLines(path);           // 一次读全部行
Files.write(path, List.of("第一行", "第二行"));           // 一次写全部行

Files.createDirectories(Paths.get("data/sub"));          // 创建多级目录
boolean exists = Files.exists(path);                     // 是否存在
long size = Files.size(path);                            // 字节大小
```

正规写法:处理文本永远显式传 StandardCharsets.UTF_8(Windows 上默认编码是 GBK,不指定就是乱码之源);大文件才用流式逐行处理,小文件直接 readAllLines;Paths/Files 组合替代老的 File 类是现在的推荐做法。

通俗解释:字符流和字节流的关系 ≈ Node.js 里 stream 与 Buffer 的关系——底层都是字节,字符流帮你做了编码解码。readLine 逐行读 ≈ 前端的 readline 逐行读文件。try-with-resources ≈ JS 里 try/finally 手动 close 的模式,只是 Java 把"用完必须关"这件事从"靠自觉"变成了"语法保证",理念类似 async/await 把回调的错误处理从手工变成内建。Files.readAllLines ≈ fs.readFileSync,Files.write ≈ fs.writeFileSync,连"小文件用同步 API、大文件用流"的取舍都一致。

## 多线程基础

线程是程序内部并行执行的单元。Java 里创建线程的正规写法是实现 Runnable 接口:

```java
// 方式一: 继承 Thread(不推荐, Java 单继承, 占用了宝贵的继承名额)
public class MyThread extends Thread {
    @Override public void run() {
        System.out.println(getName() + " 运行中");
    }
}
new MyThread().start();

// 方式二: 实现 Runnable(推荐), Java 8 起可以用 Lambda
Runnable task = () -> {
    System.out.println(Thread.currentThread().getName() + " 运行中");
};
new Thread(task, "线程B").start();
```

正规写法:启动线程调用 start() 而不是直接调用 run()——直接调 run() 就是普通方法调用,没有新线程;线程任务只放 run() 里。main 方法结束时 JVM 会等所有非守护线程执行完才退出。

### 线程安全与 synchronized

```java
public class Counter {
    private int count = 0;

    // synchronized 保证同一时刻只有一个线程执行此方法
    public synchronized void add() {
        count++;
    }

    public int get() { return count; }
}
```

多个线程同时读写共享数据会出现竞态条件:count++ 读改写分三步,两个线程同时读会把一次加一弄丢。synchronized 给方法或代码块加锁,保证互斥。更复杂的并发控制(锁、原子类、线程池、并发集合)都在 java.util.concurrent(JUC)包里,是进阶内容。

```java
// 正规写法: 线程池代替手动 new Thread
import java.util.concurrent.*;

ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> System.out.println("任务1"));
pool.submit(() -> System.out.println("任务2"));
pool.shutdown();   // 不再接收新任务, 已提交的执行完
```

> 竞态的根源是"读-改-写"不是原子操作。验证方法:不写 synchronized,让 10 个线程各加 10000 次,最终结果几乎必然小于 100000;加上 synchronized 后才是 100000。

通俗解释:这是前端转 Java 最需要辨析的一节。JS 是单线程 + 事件循环,一个时刻只有一段代码在跑,所以前端天然没有"两个函数同时改同一个变量"的竞态问题(异步是排队交替,不是并行)。Java 的线程是真正的操作系统级并行,同一时刻真的有两个执行流在改同一个 count,所以才有 synchronized 这把"互斥锁"。前端能找到的最接近场景是 Web Worker:worker 之间不共享普通变量,一旦共享(SharedArrayBuffer)就同样要处理同步问题。而 Promise/async 的"异步"在 Java 里对应的是 CompletableFuture,和多线程是两个维度,别把"异步"当"并行"。

## 小结

到这里 Java 基础的主干就串起来了:String、集合、异常、IO、多线程是日常开发打交道最多的部分。正规写法记住五条:字符串比较用 equals、金额用 BigDecimal、集合声明用接口、IO 用 try-with-resources 并指定 UTF-8、线程用 Runnable 和线程池。第四篇进入泛型、Lambda 与 Stream、注解和反射,把这套基础升成真正的生产力。

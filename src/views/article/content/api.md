## String 与 StringBuilder

String 是最常用的类,先看常用方法:

```java
String s = "Hello,Java";
System.out.println(s.length());          // 10
System.out.println(s.charAt(0));         // H
System.out.println(s.substring(0, 5));   // Hello
System.out.println(s.contains("Java"));  // true
System.out.println(s.indexOf("Java"));   // 5

String[] parts = s.split(",");           // ["Hello", "Java"]
String upper = s.toUpperCase();          // HELLO,JAVA
String replaced = s.replace("Java", "World");  // Hello,World
String trimmed = "  abc  ".trim();       // abc
```

String 不可变,每次拼接都会产生新对象。循环里频繁拼接要用 StringBuilder:

```java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 1000; i++) {
    sb.append(i).append(",");
}
String result = sb.toString();
```

## 包装类与自动装箱

每种基本类型都有对应的包装类:int 对应 Integer,double 对应 Double,char 对应 Character,boolean 对应 Boolean。

```java
Integer n = 100;          // 自动装箱: int 转 Integer
int m = n;                // 自动拆箱: Integer 转 int

int parsed = Integer.parseInt("123");    // 字符串转整数
double d = Double.parseDouble("3.14");   // 字符串转小数
String text = String.valueOf(456);       // 数字转字符串
```

> 包装类对象比较要用 equals,不要用 ==,因为 == 比较的是引用地址。经典坑:Integer a = 128; Integer b = 128; 此时 a == b 是 false。

## 集合框架

### ArrayList

```java
List<String> list = new ArrayList<>();
list.add("苹果");
list.add("香蕉");
list.add("橙子");
System.out.println(list.size());          // 3
System.out.println(list.get(1));          // 香蕉
list.remove(0);                           // 删除第一个元素
list.set(0, "梨");                        // 修改下标 0 的元素
System.out.println(list.contains("橙子")); // true

for (String fruit : list) {               // 遍历
    System.out.println(fruit);
}
```

ArrayList 底层是动态数组,按下标查询快;需要频繁在中间插入删除时可以用 LinkedList。

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
```

HashMap 按键取值速度极快,但遍历顺序不保证。需要有序时用 TreeMap(按键排序)或 LinkedHashMap(按插入顺序)。

### HashSet

```java
Set<Integer> set = new HashSet<>();
set.add(1);
set.add(2);
set.add(2);               // 重复元素不会重复添加
System.out.println(set.size());   // 2
System.out.println(set.contains(1)); // true
```

HashSet 用于去重和快速判断"是否存在",没有下标概念。

## 异常处理

```java
try {
    int r = 10 / 0;                  // 抛出 ArithmeticException
} catch (ArithmeticException e) {
    System.out.println("除数不能为 0");
} finally {
    System.out.println("无论是否异常都会执行");
}
```

throws 声明方法可能抛出的受检异常,自定义异常继承 Exception:

```java
public class AgeException extends Exception {
    public AgeException(String msg) { super(msg); }
}

public static void check(int age) throws AgeException {
    if (age < 0) {
        throw new AgeException("年龄不能为负");
    }
}
```

> catch 里写具体的异常类型,不要图省事 catch (Exception) 一锅端;finally 常用于释放资源。抛出异常会中断当前流程,调用方要么捕获要么继续向上声明。

## 文件 IO

IO 分字节流(InputStream/OutputStream)和字符流(Reader/Writer),处理文本用字符流更方便:

```java
import java.io.*;
import java.nio.charset.StandardCharsets;

// 写文件
try (BufferedWriter writer = new BufferedWriter(
        new OutputStreamWriter(new FileOutputStream("test.txt"), StandardCharsets.UTF_8))) {
    writer.write("第一行");
    writer.newLine();
    writer.write("第二行");
}

// 读文件
try (BufferedReader reader = new BufferedReader(
        new InputStreamReader(new FileInputStream("test.txt"), StandardCharsets.UTF_8))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
```

try-with-resources(在 try 后面的括号里声明资源)会在结束时自动关闭流,不用手动调 close。

### 文件操作

```java
File dir = new File("data");
dir.mkdirs();                        // 创建目录(多级)
File f = new File(dir, "a.txt");
System.out.println(f.exists());      // 是否存在
System.out.println(f.length());      // 字节大小
System.out.println(f.getAbsolutePath());
```

## 多线程基础

```java
// 方式一: 继承 Thread
public class MyThread extends Thread {
    @Override public void run() {
        for (int i = 0; i < 5; i++) {
            System.out.println(getName() + ": " + i);
        }
    }
}
new MyThread().start();

// 方式二: 实现 Runnable(推荐, 更灵活)
Runnable task = () -> {
    for (int i = 0; i < 5; i++) {
        System.out.println(Thread.currentThread().getName() + ": " + i);
    }
};
new Thread(task, "线程B").start();
```

启动线程调用 start() 而不是直接调用 run()。两个线程交替输出,顺序不确定。

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

多个线程同时读写共享数据会出现竞态条件(比如 count++ 不是原子操作)。synchronized 给方法或代码块加锁;更复杂的并发控制可以学习 JUC(java.util.concurrent)包。

## 小结

到这里 Java 基础的主干就串起来了:String、集合、异常、IO、多线程是日常开发打交道最多的部分。后续建议的方向:泛型、Lambda 与 Stream、反射、JDBC 数据库访问,以及用一个小项目(比如控制台学生管理系统或图书管理)把这些知识串起来练一遍。

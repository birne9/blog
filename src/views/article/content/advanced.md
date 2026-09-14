## 泛型

泛型让类、接口、方法在定义时不写死类型,使用时再指定,编译期保证类型安全。

### 泛型类

```java
// 定义: 类名后面加 <T>, T 是类型参数(占位符)
public class Box<T> {
    private T value;

    public void set(T value) { this.value = value; }
    public T get() { return value; }
}

// 使用: 指定具体类型
Box<String> strBox = new Box<>();
strBox.set("hello");
String s = strBox.get();     // 取出时直接是 String, 不用强转

Box<Integer> intBox = new Box<>();
intBox.set(100);
```

没有泛型之前,Box 只能存 Object,取出来要强转,类型写错编译期发现不了、运行期才炸。泛型把错误从运行期提前到了编译期。

### 泛型方法

```java
public static <T> T first(List<T> list) {
    return list.get(0);
}

// 调用时编译器自动推断, 不用显式写类型
String s = first(List.of("a", "b"));
Integer n = first(List.of(1, 2));
```

### 类型参数约定与边界

```java
// 命名约定: E 元素, K/V 键值, T 类型, R 返回类型
public interface List<E> { ... }
public interface Map<K, V> { ... }

// 边界: extends 限定类型参数必须是 Number 或其子类
public static <T extends Number> double doubleValue(T n) {
    return n.doubleValue();
}
```

正规写法:类型参数用单个大写字母,常见的是 E/K/V/T;限定边界用 extends(接口也用 extends,不用 implements);集合声明永远带泛型,裸类型 List 只出现在老代码里。

### 通配符

```java
// 方法参数想接收任意类型的集合时, 用通配符 ?
public static void printAll(List<?> list) {
    for (Object o : list) {
        System.out.println(o);
    }
}

// ? extends T: 读场景, 可以放 T 及其子类
public static double sum(List<? extends Number> nums) { ... }

// ? super T: 写场景, 可以放 T 及其父类
public static void addAll(List<? super Integer> list) { list.add(1); }
```

正规写法:生产(读)用 ? extends,消费(写)用 ? super,两者都要时用具体类型参数。这条 PECS 原则(Producer Extends, Consumer Super)记不住也没关系,业务代码里通配符主要出现在工具方法和框架 API 中,自己写集合时用具体类型就行。

### 类型擦除

泛型是编译期的:编译后 T 被擦除,变成 Object(或边界类型)加运行时强转。所以 List<String> 和 List<Integer> 运行时是同一个类,泛型参数不能是基本类型(只能写 Integer 不能写 int),也不能用 instanceof 判断泛型类型。

通俗解释:泛型几乎可以逐行翻译成 TS 泛型——Box<T> ≈ class Box<T>,List<E> ≈ Array<E>,extends 约束 ≈ TS 的 extends 约束,连"编译器推断类型参数"都一致。更巧的是两边都是编译期擦除:TS 编译成 JS 后泛型消失,Java 编译成字节码后泛型同样消失,运行时都靠编译器提前插入的检查保证安全。要说差异,TS 的结构类型允许"长得像就行",Java 的泛型是严格的名义类型。对前端来说泛型不用怕,你已经会了。

## Lambda 与函数式接口

Lambda 是 Java 8 引入的语法,本质是"只实现一个方法的匿名类"的简写。

```java
// 匿名内部类写法(老)
Runnable r1 = new Runnable() {
    @Override public void run() { System.out.println("运行"); }
};

// Lambda 等价写法: (参数) -> { 方法体 }
Runnable r2 = () -> System.out.println("运行");

// 带参数、多行、带返回值
Comparator<String> byLength = (a, b) -> {
    int diff = a.length() - b.length();
    return diff;
};

// 方法引用: 已有方法直接指过去
Comparator<String> byLength2 = Comparator.comparingInt(String::length);
```

正规写法:参数类型可以省略(编译器推断);单参数可以省括号;单行方法体可以省花括号和 return;方法引用 String::length 等价于 s -> s.length(),类名::静态方法、对象::实例方法、类名::实例方法三种形式都合法。

Lambda 只能赋给函数式接口——只有一个抽象方法的接口:

```java
@FunctionalInterface   // 注解保证接口里只有一个抽象方法
public interface Converter {
    String convert(int n);
}

Converter c = n -> "数字: " + n;
System.out.println(c.convert(5));   // 数字: 5
```

常用内置函数式接口(都在 java.util.function 包):

```java
Predicate<String> isLong = s -> s.length() > 3;   // 断言, test 返回 boolean
Function<String, Integer> len = s -> s.length();  // 转换, apply
Consumer<String> print = s -> System.out.println(s); // 消费, accept 无返回
Supplier<Double> random = () -> Math.random();    // 生产, get 无参数
```

通俗解释:Lambda ≈ 箭头函数,方法引用 ≈ 直接把函数名传过去(类似 JS 里 btn.onclick = handler 传引用而不是 btn.onclick = () => handler())。函数式接口 ≈ TS 里的函数类型 (n: number) => string——规定"一个接口的职责就是描述一个函数签名"。@FunctionalInterface ≈ TS 里给函数类型起别名时的类型检查。理解透一句话就行:Java 8 之后的接口,如果只描述"一件事怎么干",它就可以被 Lambda 直接实现。

## Stream

Stream 是 Java 8 提供的函数式数据处理流水线,和 SQL 查询、Linux 管道同一种思路:声明"做什么"而不是"怎么做"。

```java
List<String> names = List.of("tom", "jerry", "ann", "bob");

// 中间操作 + 终结操作
List<String> result = names.stream()
    .filter(n -> n.length() >= 3)   // 过滤, 中间操作
    .map(String::toUpperCase)       // 转换, 中间操作
    .sorted()                       // 排序, 中间操作
    .collect(Collectors.toList());  // 收集, 终结操作
System.out.println(result);         // [ANN, BOB, JERRY, TOM]
```

正规写法:中间操作返回新的 Stream,可以一直链下去;终结操作触发整条流水线执行,一个 Stream 只能被消费一次。常用操作清单:

```java
List<Integer> nums = List.of(3, 1, 4, 1, 5, 9, 2, 6);

long count = nums.stream().count();                    // 计数
long distinct = nums.stream().distinct().count();      // 去重计数
List<Integer> limited = nums.stream().limit(3).collect(Collectors.toList()); // 前3个
boolean any = nums.stream().anyMatch(n -> n > 8);      // 是否存在
int sum = nums.stream().mapToInt(Integer::intValue).sum();  // 求和(先转数值流)

// 聚合: 用归约器
int total = nums.stream().reduce(0, (a, b) -> a + b);  // 累加, 初始值 0

// 按条件收集成 Map
Map<Integer, List<String>> byLen = names.stream()
    .collect(Collectors.groupingBy(String::length));   // 按长度分组

// 统计
IntSummaryStatistics stats = nums.stream().mapToInt(i -> i).summaryStatistics();
System.out.println(stats.getMax() + ", " + stats.getAverage());
```

> 惰性求值:中间操作只是搭管道,终结操作才真正遍历数据。所以忘写终结操作(比如只写了 filter 没写 collect)时,整个流水线一行都不会执行,没有任何报错——这是 Stream 最常见的"静默无效"坑,写完一定要检查结尾有没有终结操作。

### 典型场景:对象列表统计

```java
public class Student {
    private String name;
    private int score;
    // 构造方法、getter 省略
}

List<Student> students = List.of(
    new Student("小明", 95), new Student("小红", 82),
    new Student("小刚", 88), new Student("小丽", 90));

List<String> top = students.stream()
    .filter(s -> s.getScore() >= 90)
    .map(Student::getName)
    .sorted()
    .collect(Collectors.toList());
System.out.println(top);   // [小明, 小丽]
```

通俗解释:Stream 就是 JS 数组的 map/filter/reduce 链式操作,语法神似:filter 同名同义,map 同名同义,reduce 同名同义,collect 相当于最后再来一步(JS 里常是 reduce 或 join)。差异有二:Java 的 Stream 是惰性的,不终结不执行,JS 的 map/filter 是立即执行(所以 JS 大数组链式会有中间数组,Java 没有);Java 的 Stream 一次性的,消费完就不能再用,JS 数组可以反复 map。如果你写过 JS 的 arr.filter(...).map(...).reduce(...),Stream 只需要补"惰性"和"一次性"两个心智点。

## 注解

注解是给代码贴的"标签",本身不干活,由编译器或框架读取后采取行动。

```java
@Override                    // 编译期: 检查是否真的重写了父类方法
@Deprecated                  // 提示: 该方法已过时, 调用处会有删除线警告
@SuppressWarnings("unchecked") // 压制指定的编译警告

@FunctionalInterface         // 编译期: 检查接口是否只有一个抽象方法
public interface Converter { String convert(int n); }
```

### 自定义注解

```java
import java.lang.annotation.*;

// 定义: @interface 关键字
@Target(ElementType.METHOD)      // 元注解: 能贴在方法上
@Retention(RetentionPolicy.RUNTIME)  // 元注解: 保留到运行期(反射能读到)
public @interface Log {
    String value() default "";   // 注解的"属性", 有默认值
}

// 使用
public class OrderService {
    @Log("创建订单")
    public void create() { ... }
}
```

正规写法:元注解决定注解的适用范围和生命周期;属性用"无参方法"声明,有默认值的属性使用时可以省略;单属性且名为 value 时可以省略属性名直接写 @Log("创建订单")。

### 框架如何读取注解

```java
// 拿到方法上的 @Log 注解并读属性
Method m = OrderService.class.getMethod("create");
if (m.isAnnotationPresent(Log.class)) {
    Log log = m.getAnnotation(Log.class);
    System.out.println(log.value());   // 创建订单
}
```

注解加反射,就是 Spring、MyBatis、JUnit 这类框架的底层原理:框架扫描你的类,读到注解,然后替你执行切面、事务、SQL 映射等逻辑。

通俗解释:注解和 TS 装饰器是同一个物种——都是"给代码加元数据,由框架消费"。@Override ≈ TS 的 override 关键字检查,自定义 @Log ≈ @log("创建订单") 装饰器,Spring 的 @Service ≈ 前端的 @Component 装饰器(Angular 里尤其像)。元注解 @Target/@Retention ≈ 装饰器签名里限制"只能装饰方法还是类"。对前端来说,理解注解的最好路径就是:把你在 Angular/Nest 里用装饰器干的事,想象成 Java 框架用注解干的事,一码事。

## 反射

反射让程序在运行期检查类结构、创建对象、调用方法——正常代码"正着写",反射"反着查",所以叫反射。

```java
import java.lang.reflect.*;

public class Person {
    private String name = "小明";

    public void sayHello() {
        System.out.println("你好, " + name);
    }
}

// 三种方式拿到 Class 对象(类的"身份证")
Class<?> c1 = Person.class;                    // 编译期已知类名
Class<?> c2 = new Person().getClass();         // 从对象拿
Class<?> c3 = Class.forName("Person");         // 从字符串加载, 包名要写全

// 运行期创建对象并调用方法
Object obj = c1.getDeclaredConstructor().newInstance();
Method say = c1.getMethod("sayHello");
say.invoke(obj);   // 你好, 小明

// 访问字段(包括私有)
Field name = c1.getDeclaredField("name");
name.setAccessible(true);          // 私有字段要先开权限
System.out.println(name.get(obj)); // 小明

// 查看类的全部公开方法
for (Method m : c1.getMethods()) {
    System.out.println(m.getName());
}
```

正规写法:getMethod 只返回公开方法(含继承的),getDeclaredMethod 返回本类声明的(含私有);访问私有成员必须 setAccessible(true),这是刻意设计的"破门"动作;Class.forName 需要全限定类名(带包名)。

> 反射为什么重要:框架不知道你未来会写什么类,但它需要给你写的类注入依赖、生成 SQL、序列化 JSON——这些全靠反射在运行期"看懂"你的类。你日常写的业务代码很少直接用反射,但你每天用的框架底层都是它。

通俗解释:反射 ≈ JS 与生俱来的动态能力——obj[key]、动态 new、运行期拿属性,JS 天天干的事 Java 要绕一圈反射才能干。区别在于代价:JS 是解释型动态语言,动态访问零成本;Java 是编译型静态语言,反射要绕过编译期检查,所以慢、而且类型错误会从编译期推迟到运行期。Class.forName ≈ require(动态加载模块),getMethod().invoke() ≈ obj[method](),setAccessible(true) ≈ 强行访问私有字段(JS 里 #私有字段做不到,Java 反射可以,所以"私有"在 Java 里是"礼貌的私有")。

## 小结

第四篇把 Java 从"能写业务"推到了"看懂框架":泛型给类型安全,Lambda 和 Stream 给表达力,注解和反射给了框架理解你代码的能力——Spring 全家桶、MyBatis、Jackson 全是这套机制搭起来的。至此 Java 基础四篇收尾,下一步建议:用一个小项目(控制台图书管理系统即可)把这四篇串起来写一遍,然后带着问题去看 JDBC 和真实框架源码,概念全部能在前四篇找到原点。

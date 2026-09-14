const n=`## 类与对象

面向对象有三大特征:封装、继承、多态。类是模板,对象是类的实例——正规写法先看一个完整的类:

\`\`\`java
public class Student {
    // 成员变量(属性)
    private String name;
    private int age;

    // 构造方法: 名字与类相同, 没有返回值, 连 void 都不能写
    public Student(String name, int age) {
        this.name = name;   // this 指当前对象
        this.age = age;
    }

    // 成员方法(行为)
    public void introduce() {
        System.out.println("我叫" + name + ", 今年" + age + "岁");
    }
}
\`\`\`

\`\`\`java
public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("小明", 18);
        Student s2 = new Student("小红", 17);
        s1.introduce();   // 我叫小明, 今年18岁
        s2.introduce();   // 我叫小红, 今年17岁
    }
}
\`\`\`

规范要点:new 会调用构造方法创建对象;没有写任何构造方法时,编译器会补一个无参构造,一旦自己写了带参构造,无参构造就不存在了(需要时自己显式补上)。成员变量规范用 private,通过方法暴露,这就是封装的雏形。每个对象的成员变量相互独立。

通俗解释:类和对象的关系就是前端的 class 和 new 出来的实例,构造方法就是 constructor,this 就是 JS 的 this——但有个重要区别:Java 的 this 永远指向当前实例,不会被 call、apply、箭头函数改变指向,可以放心用。成员变量 ≈ 对象属性,成员方法 ≈ 对象方法,这套心智模型可以原封不动搬过来。

## 封装

封装就是把属性私有化(private),对外只提供公开的方法(getter/setter),这样可以在方法里做校验,防止数据被改坏。

\`\`\`java
public class Student {
    private String name;
    private int age;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) {
        if (age < 0 || age > 150) {
            System.out.println("年龄不合法");
            return;
        }
        this.age = age;
    }
}
\`\`\`

正规写法:getter 命名是 get 加属性名,setter 是 set 加属性名,这套命名是约定俗成的行业规范,很多框架(后面讲反射时会明白)就是靠 getXxx/setXxx 这个名字模式自动工作的,不能随意起名。布尔属性的 getter 习惯叫 isXxx。IDEA 里用快捷键可以直接生成。

### 访问修饰符

四个级别,权限从大到小:

\`\`\`java
public class Demo {
    public int a;       // 任何类都能访问
    protected int b;    // 同包 + 跨包子类
    int c;              // 什么都不写(default), 仅同包
    private int d;      // 仅本类
}
\`\`\`

正规写法:成员变量一律 private,工具方法用 public,只有子类会用到的成员用 protected,default 一般不用(团队协作时"同包可见"容易踩坑)。

### static 静态成员

\`\`\`java
public class Counter {
    public static int count = 0;   // 属于类, 所有对象共享
    public Counter() { count++; }
}

Counter c1 = new Counter();
Counter c2 = new Counter();
System.out.println(Counter.count);   // 2 直接通过类名访问, 不需要 new
\`\`\`

static 成员属于类本身而不是某个对象,静态方法里不能直接访问非静态成员(因为不知道指哪个对象)。main 方法就是 static 的,因为程序启动时还没有任何对象。

> 封装的好处:外部不能随意改坏数据;以后修改内部实现时,只要保持方法签名不变,调用方代码不用动——这就是"面向接口编程"的雏形。

通俗解释:private ≈ TS 的 private 或 JS 的 # 私有字段,getter/setter ≈ JS 对象的 getter/setter 访问器。static ≈ JS 的 static 成员,也可以类比成模块级的共享变量:不依赖实例、全局一份。访问修饰符是 JS 没有的概念(TS 有),刚开始会不习惯,记住一条就够:字段私有、方法按需公开。

## 继承

extends 表示 is-a 关系:子类拥有父类的成员,并可以扩展自己的成员。

\`\`\`java
public class Animal {
    protected String name;

    public Animal(String name) { this.name = name; }

    public void eat() { System.out.println(name + "在吃东西"); }
}

public class Dog extends Animal {
    public Dog(String name) { super(name); }  // super 调用父类构造方法

    @Override
    public void eat() {                       // 重写父类方法
        System.out.println(name + "在吃骨头");
    }

    public void bark() { System.out.println("汪汪"); }
}
\`\`\`

正规写法:子类构造方法的第一行必须(显式或隐式)调用父类构造,用 super(参数) 显式调用;@Override 注解标注方法重写,编译器会帮你检查签名是否写对,这个注解永远要写。Java 只能单继承:一个类只有一个直接父类,但可以多层继承。没有显式写 extends 的类都默认继承 Object。

### final 关键字

\`\`\`java
public final class String { ... }       // final 类: 不能被继承

public class Animal {
    public final void eat() { ... }     // final 方法: 子类不能重写
}

final int X = 10;                       // final 变量: 赋值后不可修改
\`\`\`

final 的三重含义:变量不可改、方法不可重写、类不可继承。正规用法是"不该被改的东西都声明 final",比如常量。

### 所有类的父类 Object

\`\`\`java
Student s = new Student("小明", 18);
System.out.println(s.toString());   // 默认是 类名@内存地址
System.out.println(s.equals(s));    // 默认等价于 ==
System.out.println(s.hashCode());   // 哈希码
\`\`\`

正规写法:toString、equals、hashCode 是 Object 提供的三个根基方法,做实体类时规范要求重写 toString(打印友好)和 equals/hashCode(业务相等)。IDEA 可以自动生成,但机制要懂:equals 判断相等,hashCode 必须与 equals 保持一致——两个 equals 相等的对象,hashCode 必须相同,否则放进 HashMap 会出诡异 bug,下一篇会再讲到。

通俗解释:继承和 JS 的 class extends 几乎一样,super 的用法也一致,连"都是单继承"都相同(JS 的 class 也是单继承,多继承需求两端都靠组合或接口解决)。@Override ≈ TS 里给重写方法加 override 关键字(TS 4.3+)——都是让编译器帮你检查是不是真的重写了父类方法,防止拼错方法名悄悄变成新方法。Object 是所有类的祖先 ≈ 原型链顶端的 Object.prototype。final ≈ const 的精神,但作用域从"变量"扩展到"方法和类"。

## 多态

\`\`\`java
Animal a = new Dog("旺财");   // 父类引用指向子类对象(向上转型)
a.eat();                      // 旺财在吃骨头 —— 运行期动态绑定, 调的是子类重写的方法
\`\`\`

多态就是同一引用类型,指向不同子类对象时表现出不同行为。正规写法是面向父类编程,让代码对扩展开放:

\`\`\`java
Animal[] animals = { new Dog("旺财"), new Cat("咪咪") };
for (Animal a : animals) {
    a.eat();   // 分别调用 Dog 和 Cat 各自重写的 eat
}
// 以后新增 Bird, 只要 extends Animal 重写 eat, 这段代码一行不用改
\`\`\`

通俗地说:编译看左边(Animal),运行看右边(Dog)。编译器按 Animal 的类型检查方法是否存在,真正运行时按对象的实际类型找重写后的方法,这叫动态绑定。

### instanceof 类型判断

\`\`\`java
if (a instanceof Dog) {
    Dog d = (Dog) a;   // 向下转型, 转回具体类型才能调用子类特有方法
    d.bark();
}
\`\`\`

正规写法:向下转型前必须用 instanceof 判断,否则类型不匹配会抛 ClassCastException。先判断再转型是标准模式,不要用"先转型再 catch 异常"的写法。

通俗解释:动态绑定在 JS 里是天生默认的——同一方法名,不同对象各自实现,调用时按对象实际类型分发,JS 不用继承也能这样(鸭子类型),Java 则是通过继承层次 + 编译期类型检查实现的。一句话记住差异:JS 是"长得像鸭子就是鸭子"(运行时看有没有方法),Java 是"必须登记在鸭子家族里"(编译期看类型,运行期看实现)。向上转型 ≈ 把子类实例赋给父类类型,在 JS 里根本不用写,因为 JS 变量没有静态类型。

## 抽象类与接口

抽象类不能被实例化,用来定义"不完整"的模板;接口定义行为规范。

\`\`\`java
public abstract class Shape {
    public abstract double area();   // 抽象方法没有方法体, 子类必须实现

    public void print() {            // 抽象类里可以有普通方法(模板方法)
        System.out.println("面积: " + area());
    }
}
\`\`\`

\`\`\`java
public interface Flyable {
    // 接口里的字段自动是 public static final(常量)
    int MAX_SPEED = 100;

    void fly();                 // 方法自动是 public abstract
    default void land() {       // default 方法可以有实现, 实现类可覆盖
        System.out.println("降落");
    }
    static void check() {       // 静态方法, 只能通过接口名调用
        System.out.println("检查飞行许可");
    }
}
\`\`\`

\`\`\`java
public class Bird extends Shape implements Flyable {
    @Override public double area() { return 0; }

    @Override public void fly() { System.out.println("小鸟飞"); }
}
\`\`\`

正规写法:一个类可以实现多个接口(implements A, B),弥补单继承的不足;接口之间还可以互相继承(interface A extends B, C)。抽象类里的抽象方法必须由非抽象子类全部实现。接口方法默认 public,写不写都一样,规范上不写。

> 什么时候用谁:接口用来定义"能做什么"(规范),抽象类用来提取多个子类的共性代码(模板)。能说清楚"xxx 是一种 yyy"时用继承,否则优先考虑接口。判断标准是:接口描述能力(Flyable、Comparable),抽象类描述类别(Shape、Animal)。

通俗解释:interface ≈ TS 的 interface,abstract class ≈ TS 的 abstract class,两个概念几乎一一对应,连"实现类必须实现全部抽象成员"的规则都一样。接口的 default 方法 ≈ 给接口提供一个默认实现,可以类比 JS 原型链上的默认方法,实现类不覆盖就用默认的。接口常量 ≈ 挂在接口上的常量,类似 TS 里 enum 或常量对象。一句话:interface 是"合同",签了就必须履约;abstract class 是"半成品模板",子类补全剩下的部分。

## 内部类简介

\`\`\`java
public class Outer {
    private int x = 10;

    // 成员内部类: 可以直接访问外部类的私有成员
    class Inner {
        void show() { System.out.println(x); }
    }

    public void use() {
        new Inner().show();   // 10
    }
}
\`\`\`

内部类有四种:成员内部类(上面这种)、静态嵌套类(用 static 修饰,不依赖外部类实例)、局部内部类(定义在方法里)、匿名内部类。匿名内部类常用于"一次性"实现接口,比如事件监听和线程:

\`\`\`java
Runnable r = new Runnable() {
    @Override public void run() { System.out.println("运行"); }
};
new Thread(r).start();
\`\`\`

> 匿名内部类的正规用法在 Java 8 之后大部分被 Lambda 替代(第四篇会讲),但看懂它很重要,因为大量老代码和历史框架源码里都是这种写法。

通俗解释:内部类 ≈ 定义在另一个类/函数内部的类,JS 里没有直接对应物(最近似的场景是把回调函数写在调用处)。匿名内部类 = 只写一次的"一次性实现类" ≈ JS 里传入匿名回调函数——new Runnable() { run() {...} } 的本质就是把"一个实现了接口的对象"当参数传,和 JS 把 function 当参数传是同一件事的两种写法,Java 需要套一层类的壳,Lambda 出现后这层壳也能省掉了。

## 小结

类与对象、封装、继承、多态是 Java 面向对象的骨架,加上抽象类和接口,就是组织复杂程序的主要手段。正规写法记住五条:字段一律 private、重写必须写 @Override、转型前先 instanceof、equals 重写时 hashCode 同步重写、优先接口后考虑继承。下一篇进入常用 API 与进阶:字符串、集合、异常、IO 和多线程入门。
`;export{n as default};

const n=`## 类与对象

面向对象有三大特征:封装、继承、多态。类是模板,对象是类的实例。

\`\`\`java
public class Student {
    // 成员变量(属性)
    String name;
    int age;

    // 构造方法: 名字与类相同, 没有返回值
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

new 会调用构造方法创建对象。每个对象的成员变量相互独立,互不影响。

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

> 封装的好处:外部不能随意改坏数据;以后修改内部实现时,只要保持方法签名不变,调用方代码不用动。

### static 静态成员

\`\`\`java
public class Counter {
    public static int count = 0;   // 属于类, 所有对象共享
    public Counter() { count++; }
}
// 直接通过类名访问, 不需要 new
System.out.println(Counter.count);
\`\`\`

static 成员属于类本身而不是某个对象;静态方法里不能直接访问非静态成员。

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

super 指父类。@Override 标注方法重写,编译器会帮你检查签名是否写对。Java 只能单继承:一个类只有一个直接父类。

## 多态

\`\`\`java
Animal a = new Dog("旺财");   // 父类引用指向子类对象(向上转型)
a.eat();                      // 旺财在吃骨头 —— 运行期动态绑定, 调的是子类重写的方法
\`\`\`

多态就是同一引用类型,指向不同子类对象时表现出不同行为。通俗地说:编译看左边(Animal),运行看右边(Dog)。

\`\`\`java
Animal[] animals = { new Dog("旺财"), new Cat("咪咪") };
for (Animal a : animals) {
    a.eat();   // 分别调用 Dog 和 Cat 各自重写的 eat
}
\`\`\`

### instanceof 类型判断

\`\`\`java
if (a instanceof Dog) {
    Dog d = (Dog) a;   // 向下转型, 转回具体类型
    d.bark();
}
\`\`\`

## 抽象类与接口

抽象类不能被实例化,用来定义"不完整"的模板;接口定义行为规范。

\`\`\`java
public abstract class Shape {
    public abstract double area();   // 抽象方法没有方法体, 子类必须实现

    public void print() {
        System.out.println("面积: " + area());
    }
}

public interface Flyable {
    void fly();                 // 接口方法默认 public abstract
    default void land() {       // default 方法可以有实现
        System.out.println("降落");
    }
}

public class Bird extends Shape implements Flyable {
    @Override public double area() { return 0; }

    @Override public void fly() { System.out.println("小鸟飞"); }
}
\`\`\`

一个类可以实现多个接口(implements A, B),弥补单继承的不足。

> 什么时候用谁:接口用来定义"能做什么"(规范),抽象类用来提取多个子类的共性代码(模板)。能说清楚"xxx 是一种 yyy"时用继承,否则优先考虑接口。

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

匿名内部类常用于"一次性"实现接口,比如事件监听和线程:

\`\`\`java
Runnable r = new Runnable() {
    @Override public void run() { System.out.println("运行"); }
};
new Thread(r).start();
\`\`\`

## 小结

类与对象、封装、继承、多态是 Java 面向对象的骨架,加上抽象类和接口,就是组织复杂程序的主要手段。下一篇进入常用 API 与进阶:字符串、集合、异常、IO 和多线程入门。
`;export{n as default};

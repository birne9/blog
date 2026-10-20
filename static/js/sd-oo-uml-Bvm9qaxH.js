const n=`## 面向对象基本概念

对象(Object)三要素:**状态**(属性值)、**行为**(能执行的操作)、**标识**(唯一身份,用来区别属性值完全相同的另一个对象)。**类**(Class)是对一组相似对象的抽象描述,**对象是类的实例**(Instance)——类是模具,对象是产品,一个类可以造出无数对象。对象之间通过**消息**(Message)协作:发消息就是请求对方执行某个操作,**方法**(Method)是响应该请求的具体实现,**消息是"请求",方法是"应答"**。

四大特征逐个讲透。**封装**(Encapsulation):把数据和操作数据的方法包在一起,**对外隐藏内部细节**,只暴露受控接口,属性私有化加公开方法是最常见的形态。**继承**(Inheritance):子类自动获得父类的属性和方法,并可扩展或改写,形成 **is-a 关系**,目的是复用。**多态**(Polymorphism):同一消息发给不同对象产生不同行为,**父类引用指向子类对象**,调方法时**按对象的实际类型执行**。**抽象**(Abstraction):只暴露必要特征、隐藏无关细节,抽象类和接口是它的工具。

多态的两种实现必须分清:**编译期多态是重载**(Overload)——同一个类里方法名相同、**参数列表不同**(个数、类型或顺序不同),调用哪个在编译时就能确定,注意**仅返回值不同不构成重载**;**运行期多态是覆盖**(Override)——子类重新定义父类中**签名完全相同**的方法,调用哪个要到运行时看对象实际类型,这叫**动态绑定**。

\`\`\`java
class Animal {
    public void speak() { System.out.println("动物叫"); }
}
class Dog extends Animal {
    @Override
    public void speak() { System.out.println("汪汪"); }   // 覆盖: 运行期多态
    public void speak(int times) {                        // 重载: 编译期多态
        for (int i = 0; i < times; i++) System.out.println("汪");
    }
}
public class Main {
    public static void main(String[] args) {
        Animal a = new Dog();   // 父类引用指向子类对象
        a.speak();              // 输出"汪汪", 运行时按实际类型绑定
    }
}
\`\`\`

通俗解释:类和对象前端天天写,class User 和 new User() 就是同一个概念。多态在前端的对应:TypeScript 里一个变量声明为接口类型,实际可以赋任何实现了该接口的对象,调方法时行为由实际实现决定——这和 Java 的"父类引用指向子类对象"一模一样。重载在 TS 里有函数重载声明,覆盖就是子类里重写父类方法。区别在于 Java 的多态是真动态绑定,而 JS 的 this 指向会被调用方式搅乱,Java 不会。

## 类之间的关系

类之间六种关系,从弱到强记:**依赖 < 关联 < 聚合 < 组合**,另有**泛化**和**实现**两种纵向关系。这一节是上午和下午的双料高频考点,每种关系都要做到:给 UML 图能认,给 Java 代码能对。

**依赖**(Dependency,use-a):一个类的方法里用到了另一个类——作方法参数、局部变量或调用它的静态方法,但**成员里没有它**,关系最弱、最临时。UML 画法:**虚线箭头,从使用方指向被使用方**。

**关联**(Association,has-a):一个类把另一个类**作为成员变量长期持有**,比如订单持有顾客。UML 画法:**实线箭头**,可单向可双向,线上可标注多重性(**1**、**0..1**、* 等)。

**聚合**(Aggregation):关联的特例,表示整体-部分的**弱拥有**——**部分可以脱离整体单独存在**,比如班级和学生,班级解散学生还在。UML 画法:**空心菱形**加实线,**菱形挨着整体一方**。

**组合**(Composition):关联的更强特例,表示**同生共死的强拥有**——**部分不能脱离整体存在**,整体销毁部分跟着销毁,比如订单和订单项。UML 画法:**实心菱形**加实线,菱形同样挨着整体一方。

**泛化**(Generalization,is-a):就是继承,子类指向父类。UML 画法:**实线加空心三角箭头,三角指向父类**。**实现**(Realization):类实现接口。UML 画法:**虚线加空心三角箭头,三角指向接口**。

\`\`\`java
// 依赖: 方法参数里临时用一下 Report
class Printer {
    void print(Report r) { r.show(); }
}
// 关联: 成员变量长期持有 Customer
class Order {
    private Customer customer;
}
// 聚合: Team 解散, Student 还在(空心菱形, 部分由外部传入)
class Team {
    private List<Student> members;
    Team(List<Student> members) { this.members = members; }
}
// 组合: Order 销毁, OrderItem 跟着没(实心菱形, 部分自己创建)
class OrderV2 {
    private List<OrderItem> items = new ArrayList<>();
}
// 泛化: class Dog extends Animal     (实线空心三角指向父类)
// 实现: class UserServiceImpl implements UserService (虚线空心三角指向接口)
\`\`\`

> 上午陷阱:聚合与组合的区分是送分也是送命题——判断标准是"**部分能否脱离整体独立存在**",**能则聚合(空心菱形),不能则组合(实心菱形)**;**菱形永远画在整体那一侧**。泛化和实现的箭头都指向被继承、被实现的一方,**泛化实线、实现虚线**,给图问关系时先看线型再看箭头。

## UML 概览

**统一建模语言**(Unified Modeling Language,UML)是一种标准化的图形建模语言,注意它**是语言不是方法**——它只规定怎么画图表达,不规定开发流程怎么走,所以 UML 既能搭配瀑布也能搭配 RUP。UML 的构造块分三类:**事物**(Things,图里的名词,如类、接口、用例、结点)、**关系**(Relationships,图里的动词,如关联、依赖、泛化)、**图**(Diagrams,事物和关系的组织方式)。

图按视角分两大家族:**静态结构图**描述系统长什么样,包括**类图、对象图、构件图、部署图、包图**;**动态行为图**描述系统怎么动,包括**用例图、顺序图、协作图、状态图、活动图**。用例图稍特殊:它画的是静态结构,表达的却是用户与系统交互的功能场景,教材一般把它放在需求与行为视图里,考试按教材口径记忆即可。

## 用例图

**用例图**(Use Case Diagram)三要素:**参与者**(Actor,画小人,系统之外的交互角色,可以是人也可以是外部系统)、**用例**(Use Case,画椭圆,系统提供的一项功能)、**系统边界**(画矩形框,框内是用例,框外是参与者)。

用例之间三种关系。**包含**(include):基用例执行时**必然执行**被包含用例,比如"借书"必然包含"验证读者身份";箭头方向:**虚线箭头从基用例指向被包含的用例**。**扩展**(extend):扩展用例**在特定条件下才执行**,基用例本身完整、可独立执行,比如"借书"时若库存已空才执行"预约登记";箭头方向:**虚线箭头从扩展用例指向基用例**——**和 include 恰好相反**,这是考试最爱设的陷阱。**泛化**:参与者之间或用例之间的继承,比如"读者"泛化出"学生"和"教师",实线空心三角指向父。

完整示例——图书馆借阅用例图:系统边界框内有六个用例:查询图书、办理借阅、归还图书、验证身份、缴纳超期罚款、预约登记;框外两个参与者:读者、图书管理员。关系这样连:办理借阅和归还图书都 include 验证身份,箭头各自指向验证身份;归还图书被缴纳超期罚款 extend,罚款只在超期时发生,箭头从缴纳罚款指向归还图书;办理借阅被预约登记 extend,无库存时才预约,箭头从预约登记指向办理借阅;读者关联查询图书、办理借阅、归还图书;管理员参与全部用例。

> 方向陷阱再强调一遍:**include 是基用例指向被包含用例**,**extend 是扩展用例指向基用例**。记法:谁离不开谁,箭头就指向离不开的那个——基用例离不开被包含用例;扩展用例离开基用例就没有存在意义。判断用 include 还是 extend:**必然发生用 include,条件发生用 extend**。

## 类图与对象图

**类图**(Class Diagram)里一个类画成**三栏矩形**:第一栏**类名**,**抽象类用斜体**;第二栏**属性**,写法为 可见性 属性名:类型 = 默认值;第三栏**方法**,写法为 可见性 方法名(参数列表):返回类型。可见性符号四个:**+ 表示 public**,**- 表示 private**,**# 表示 protected**,**~ 表示包可见**(default)。

\`\`\`text
+-------------------------+
|         Student         |
+-------------------------+
| - name: String          |
| - age: int = 18         |
+-------------------------+
| + getName(): String     |
| + setAge(age: int): void|
+-------------------------+
\`\`\`

**对象图**(Object Diagram)是类图在**某一时刻的快照**:画的是具体对象,**对象名带下划线**,写成 对象名:类名,属性栏填具体值。类图回答"系统有哪些类、什么关系",对象图回答"某一刻系统里躺着哪些对象、值是多少"。

上午常给符号选可见性:**+ 公共、- 私有、# 保护**。**对象名带下划线是对象图的识别标志**;UML 属性写法是 **名:类型**,与 Java 代码 **类型 名** 的顺序相反,别读串。

## 顺序图

**顺序图**(Sequence Diagram,时序图)按**时间轴从上到下**展示对象之间的消息传递。构成:对象画在顶部横排,每个对象向下拖一条虚线叫**生命线**(Lifeline);生命线上的窄长矩形叫**激活条**(Activation),表示对象正在执行操作。消息三种:**同步消息**(Synchronous Message)用**实心箭头**,发送方发完就**阻塞等返回**,对应普通方法调用;**返回消息**(Return Message)用**虚线箭头**,回到发送方;**异步消息**(Asynchronous Message)用**开放箭头**,**发完不等**,继续干自己的。消息从一个对象的生命线折返回自己,叫**自调用**(Self-Message),箭头发向自己的新激活条。

**协作图**(Collaboration Diagram,也叫**通信图** Communication Diagram)与顺序图**语义等价**:同样的对象和消息,只是按对象布局排列,消息上标**编号**(1、1.1、1.2、2)体现**先后顺序和嵌套层次**,**两者可以互相转换**。顺序图强在**时间顺序**一目了然,协作图强在**对象间的结构关系**。

> 上午考法:"**顺序图与协作图语义相同、可以互换**"这句话本身就是判断题答案;问"哪种图强调消息的时间顺序"选**顺序图**;**实心箭头是同步调用,虚线箭头是返回消息**,编号体现顺序是协作图的特征。

## 状态图与活动图

**状态图**(State Diagram,状态机图)描述**单个对象在其生命周期内响应事件的状态变迁**。元素:**初态用实心黑圆**,**终态用牛眼**(圆圈内套实心圆),中间状态用圆角矩形;**转换**(Transition)是带箭头的线,标注格式为 **事件[监护条件]/动作**——**事件发生且监护条件为真时,执行动作并迁移到新状态**,监护条件可省略。典型场景:订单对象的 待支付 → 已支付 → 已发货 → 已完成,每一步由事件触发。

**活动图**(Activity Diagram)描述**业务流程或算法的步骤流转**,本质是**流程图的增强版**。元素:动作节点(圆角矩形)、初态终态(画法同状态图)、分支用菱形(决策)、**分叉与汇合**用粗横线(Fork/Join,表示**并发**:分叉后多条流并行推进,汇合处**等所有并行流都到达才继续**)、**泳道**(Swimlane)把活动按职责分区,一眼看出每件事归谁干。典型场景:请假审批流——员工提交、主管审批、菱形判断金额,超阈值走总经理,否则直接归档。

两者区别是高频考点:**状态图的主角是一个对象**,描述它对外部事件的响应,**节点是状态,边是事件**;**活动图的主角是一个流程**,描述动作的先后与并发,**节点是动作**,转换一般在动作完成后自动发生。判断口诀:描述**对象生命周期**用**状态图**,描述**业务流程与工作流**(尤其涉及并发、泳道)用**活动图**。

类比前端:状态图 ≈ XState 这类有限状态机库——订单组件就是待支付、已支付、已发货几个状态,点击支付是事件,支付金额校验是监护条件,迁移时发的请求是动作。活动图 ≈ 审批流的流程设计器,泳道 ≈ 按角色分栏的看板;分叉汇合 ≈ Promise.all——多个异步任务齐头并进,全部 resolve 才往下走。

> 上午必考辨析:给"订单从待支付到已完成的变化"选**状态图**;给"报销审批流程,涉及多部门并行会签"选**活动图**。题干出现"**并发**""**泳道**"几乎锁定活动图;出现"**对象生命周期**""**事件驱动**"锁定状态图。

## 构件图与部署图

**构件图**(Component Diagram)描述系统的**物理模块划分**:**构件**(Component)是**可替换的物理单元**,比如一个 jar 包、一个微服务、一个动态库,构件之间通过接口交互。**供接口**(Provided Interface)画成**小圆圈**,俗称棒棒糖,表示构件对外提供的能力;**需接口**(Required Interface)画成**半圆**,俗称插座,表示构件需要别人提供的能力;一个构件的半圆扣上另一个构件的圆圈,就表示两者在这个接口上对接。

**部署图**(Deployment Diagram)描述**软件跑在什么硬件上**:**结点**(Node)画成**立方体**,代表处理器或设备,比如应用服务器、数据库机、手机;结点里放**制品**(Artifact,部署单元如 war 包);结点之间用实线表示**通信路径**,线上可标注协议如 HTTP。它回答的问题是"**哪个构件部署在哪台机器、机器之间怎么连**",是运维视角的图。

## 设计原则

六大原则,每条一句话定义加一个前端例子。**单一职责原则**(Single Responsibility Principle,SRP):一个类只负责一项职责,**只有一个引起它变化的原因**——前端里一个组件只干一件事,又渲染列表又发请求又管权限的组件就该拆。**开闭原则**(Open-Closed Principle,OCP):**对扩展开放、对修改关闭**,加新功能靠新增代码而不是改老代码——前端的插件机制、中间件机制就是为 OCP 而生,加功能挂个新插件,核心代码不动。**里氏替换原则**(Liskov Substitution Principle,LSP):**凡是能使用父类的地方,换成子类必须照样工作**,子类不能削弱父类的行为契约——前端封装加强版基础组件时,相同 props 传入不能渲染出完全不同的交互。**依赖倒置原则**(Dependency Inversion Principle,DIP):**高层模块依赖抽象而非具体实现**——前端 ≈ 业务代码依赖 axios 封装出来的 request 层这个抽象,而不是到处裸写 fetch 这个具体实现,换底层库只改一处。**接口隔离原则**(Interface Segregation Principle,ISP):**接口要小而专**,别强迫实现方依赖用不到的方法——前端 ≈ 组件的 props 类型只声明真正用到的字段,不把一个巨型 DTO 整个传进去。**迪米特法则**(Law of Demeter,LoD,**最少知识原则**):一个对象对其他对象知道得越少越好,**只和直接朋友说话**——前端 ≈ 组件只操作自己的 props 和注入的 store,不隔着三层去摸别的组件的内部的内部。

> 上午考法:给一句话定义选原则,抓关键词——"**对扩展开放**"选开闭;"**父类出现处子类可替**"选里氏替换;"**依赖抽象不依赖具体**"选依赖倒置;"**接口臃肿**"选接口隔离;"**最少知识、只和朋友说话**"选迪米特;"**一个引起变化的原因**"选单一职责。

## 设计模式·创建型

创建型模式管"对象怎么 new 出来"。单例(Singleton):**保证一个类只有一个实例并提供全局访问点**,做法是**私有构造方法加静态实例加静态获取方法**。类比前端:ES Module 的模块缓存天然就是单例,import 多少次拿到的都是同一个模块实例。

\`\`\`java
public class Singleton {
    private static Singleton instance = new Singleton();  // 饿汉式: 类加载即创建
    private Singleton() {}                                 // 私有构造, 外部 new 不了
    public static Singleton getInstance() {
        return instance;
    }
}
\`\`\`

工厂方法(Factory Method):定义一个创建对象的接口,**让子类决定实例化哪个类**,把 new 推迟到子类。抽象工厂(Abstract Factory):**提供一个创建一族相关对象的接口**,比如一套皮肤要同时产出按钮和输入框,换肤就是换整个工厂。两者区别:**工厂方法一个厂造一种产品,抽象工厂一个厂造一族配套产品**。建造者(Builder):**把复杂对象的构建拆成一步一步**,指挥者按步骤装配,适合构造参数巨多或构造过程有顺序要求的对象。原型(Prototype):**通过克隆已有对象创建新对象**,免去昂贵的重复初始化。

\`\`\`java
// 工厂方法: 子类决定造谁
interface Logger { void log(String msg); }
class FileLogger implements Logger { public void log(String m) {} }
interface LoggerFactory { Logger createLogger(); }
class FileLoggerFactory implements LoggerFactory {
    public Logger createLogger() { return new FileLogger(); }
}
// 建造者: 链式分步装配
class Request {
    static class Builder {
        private String url; private String method = "GET";
        Builder url(String u) { this.url = u; return this; }
        Builder method(String m) { this.method = m; return this; }
        Request build() { return new Request(this); }
    }
    private Request(Builder b) { /* 赋值 */ }
}
\`\`\`

## 设计模式·结构型

结构型模式管"类和对象怎么组装"。适配器(Adapter):**把一个类的接口转换成客户期望的另一个接口**,让原本接口不兼容的类一起工作。类比前端:各家后端返回的数据结构千奇百怪,在响应拦截器里统一适配成前端约定格式,这层拦截器就是适配器。

\`\`\`java
interface Target { void request(); }        // 目标接口
class Adaptee {                              // 被适配者: 接口不兼容
    public void specificRequest() {}
}
class Adapter implements Target {            // 适配器: 持有被适配者
    private Adaptee adaptee;
    Adapter(Adaptee a) { this.adaptee = a; }
    public void request() { adaptee.specificRequest(); }
}
\`\`\`

装饰(Decorator):**不改变原接口,动态地给对象叠加职责**,层层包裹。类比前端:React 的**高阶组件**(Higher-Order Component,HOC)——withLoading(withAuth(Component)),每包一层加一个能力,原组件不动。

\`\`\`java
interface Coffee { double cost(); }
class SimpleCoffee implements Coffee { public double cost() { return 10; } }
abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    CoffeeDecorator(Coffee c) { this.coffee = c; }
}
class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee c) { super(c); }
    public double cost() { return coffee.cost() + 3; }   // 加奶加 3 块
}
\`\`\`

代理(Proxy):给原对象加一个代理人,**控制对原对象的访问**,比如延迟加载、权限校验、记日志,客户端无感。类比前端:ES6 的 Proxy 同名同思路;**图片懒加载**先用占位图代理真实图片,滚进视口再加载真图。

\`\`\`java
interface Image { void display(); }
class RealImage implements Image {
    private String file;
    RealImage(String f) { this.file = f; loadFromDisk(); }
    private void loadFromDisk() {}                       // 昂贵操作
    public void display() {}
}
class ProxyImage implements Image {
    private RealImage real; private String file;
    ProxyImage(String f) { this.file = f; }
    public void display() {
        if (real == null) real = new RealImage(file);    // 用时才加载
        real.display();
    }
}
\`\`\`

外观(Facade):**给复杂子系统提供一个统一的高层入口**,客户端只跟外观打交道。类比前端:把五六个 store 方法和接口调用包成一个自定义 hook,页面只调这个 hook。桥接(Bridge):**把抽象部分和实现部分分离,使两个维度可以独立变化**,比如形状和颜色各变各的,避免类爆炸。组合(Composite):**把对象组织成树形结构表示整体-部分层次**,客户端对单个对象和对象组一视同仁,文件系统的文件与文件夹是教科书例子。享元(Flyweight):**共享细粒度对象以节省内存**,把不变的**内蕴状态**抽出来共享,变化的**外蕴状态**由外部传入,比如编辑器里同一个字符的字形对象只存一份。

## 设计模式·行为型

行为型模式管"对象之间怎么通信协作"。观察者(Observer):**一对多依赖,被观察者状态一变,所有观察者自动收到通知**。类比前端:EventBus、addEventListener、响应式框架的依赖通知,全是观察者。

\`\`\`java
import java.util.*;
interface Observer { void update(String msg); }
class Subject {
    private List<Observer> observers = new ArrayList<>();
    public void attach(Observer o) { observers.add(o); }
    public void notifyAll(String msg) {
        for (Observer o : observers) o.update(msg);      // 状态变了逐个通知
    }
}
class UserView implements Observer {
    public void update(String msg) { System.out.println("收到: " + msg); }
}
\`\`\`

策略(Strategy):**把一族算法各自封装成可互换的策略类,运行时按需切换**,消灭一堆 if-else。类比前端:**表驱动**——用一张 strategyMap 按 type 查出函数再调用,替代 if-else 链。

\`\`\`java
interface PayStrategy { void pay(int amount); }
class AliPay implements PayStrategy { public void pay(int a) {} }
class WeChatPay implements PayStrategy { public void pay(int a) {} }
class PayContext {
    private PayStrategy strategy;
    void setStrategy(PayStrategy s) { this.strategy = s; }  // 运行时切换
    void checkout(int amount) { strategy.pay(amount); }
}
\`\`\`

模板方法(Template Method):**父类定义算法骨架,把某些步骤留给子类重写**,骨架不变、步骤可变。类比前端:封装好的列表页组件,请求地址和列配置留给业务方传入,加载、分页、错误处理的流程骨架固定。

\`\`\`java
abstract class DataParser {
    public final void parse() {          // 模板方法: 骨架固定
        readData(); parseData(); writeData();
    }
    protected void readData() { System.out.println("读文件"); }
    protected abstract void parseData();                  // 留给子类
    protected void writeData() { System.out.println("写库"); }
}
class CsvParser extends DataParser {
    protected void parseData() { System.out.println("解析 CSV"); }
}
\`\`\`

责任链(Chain of Responsibility):**把处理者串成链,请求沿链传递,直到有人处理为止**,发送者和处理者解耦。类比前端:中间件的**洋葱模型**,请求一层层穿过,每层可处理也可放行。

\`\`\`java
abstract class Handler {
    protected Handler next;
    public void setNext(Handler h) { this.next = h; }
    public abstract void handle(int level);
}
class Leader extends Handler {
    public void handle(int level) {
        if (level <= 2) System.out.println("组长批");
        else if (next != null) next.handle(level);       // 批不了传给上级
    }
}
\`\`\`

命令(Command):**把请求封装成对象**,请求的发起者和执行者解耦,天然支持排队、记日志和**撤销**——undo 就是命令对象的反向执行。状态(State):**把状态相关的行为封装成状态类,对象状态改变时行为跟着变**,外观上看像对象换了类;它和策略长得像,区别在于**状态模式里状态自己知道下一个状态是谁,会驱动状态迁移**。其余五个一句话带过:迭代器(Iterator)**提供统一方式遍历集合而不暴露内部结构**;中介者(Mediator)**用一个中介对象封装多对象间的网状交互**,同事对象只跟中介说话;备忘录(Memento)**在不破坏封装的前提下捕获并保存对象内部状态**,支持回滚;访问者(Visitor)**把作用于元素的操作从元素类中抽出来**,加新操作不用改元素;解释器(Interpreter)**为一门语言定义文法表示并实现解释器**,考试基本只考归类。

> 模式归类是上午送分题:**创建型 5 个**——单例、工厂方法、抽象工厂、建造者、原型;**结构型 7 个**——适配器、装饰、代理、外观、桥接、组合、享元;**行为型 11 个**——观察者、策略、模板方法、责任链、命令、状态、迭代器、中介者、备忘录、访问者、解释器。给场景选模式记关键词:"**动态加职责不改接口**"选装饰,"**控制访问**"选代理,"**接口不兼容**"选适配器,"**算法可互换**"选策略,"**骨架固定步骤可变**"选模板方法。

## 下午题衔接

下午试题第五题(Java 方向)常年从设计模式里出代码填空:**策略、观察者、工厂方法、适配器、装饰、模板方法是出镜率最高的六个**。备考策略:本篇的 Java 骨架要达到**默写级别**——看到类图能认出模式,看到空缺能补出关键字。填空高频点:1. 单例的 **private 构造方法和 static 实例**;2. 工厂方法的**返回类型写接口**;3. 观察者里 **attach 和 notify 的循环调用**;4. 适配器里**持有被适配者的成员变量**;5. 装饰器里**构造方法接收被装饰对象并委托调用**;6. 模板方法里 **abstract 步骤和 final 骨架**。答题时先通读全文判断是哪种模式,再按该模式的标准结构去套,空基本都在结构的关键节点上。

## 例题精练

> 说明:本节例题按官方教材考点与历年真题风格编写,用于自测与查漏补缺,**非原书题目**。建议先遮住解析独立作答,再对答案。

### 例题 1(聚合与组合)

UML 类图中,"汽车"与"轮胎"可以独立存在,二者关系应建模为( )。

A. 组合  B. 聚合  C. 泛化  D. 依赖

> 答案:**B**。解析:整体-部分且**部分可脱离整体独立存在 → 聚合**(空心菱形);部分**随整体同生共死 → 组合**(实心菱形),如"人"与"心脏"。泛化是**继承**(空心三角实线),依赖是**用一下**(虚线箭头)。真题套路:给一句场景描述,让你选关系或选图符。

### 例题 2(设计模式归类)

下列设计模式中,属于创建型模式的是( )。

A. 适配器  B. 代理  C. 工厂方法  D. 观察者

> 答案:**C**。解析:**创建型 5 个**:单例、工厂方法、抽象工厂、建造者、原型——都管"**怎么 new 对象**";适配器、代理属结构型,观察者属行为型。计数法记忆:**5-7-11**(创建 5、结构 7、行为 11)。

### 例题 3(多态的实现条件)

面向对象语言中,运行时多态的实现不依赖于( )。

A. 继承  B. 方法重写  C. 父类引用指向子类对象  D. 全局变量

> 答案:**D**。解析:运行时多态三要素——**有继承、有重写、父类引用指向子类对象**,具体调哪个方法**运行时才绑定**(动态绑定)。全局变量与多态无关,纯粹干扰项。

### 例题 4(用例关系)

用例"提交订单"执行前必须先完成"验证用户身份",二者之间应建立( )关系。

A. include(包含)  B. extend(扩展)  C. 泛化  D. 关联

> 答案:**A**。解析:**每次必走的是 include**(被包含用例是主用例的必备环节);**特定条件下才触发的是 extend**(如"超额时领导审批"是对"提交订单"的扩展)。箭头方向也爱考:**include 指向被包含者,extend 从扩展用例指向基础用例**,记反就丢分。
`;export{n as default};

## 什么是 IoC

写 Java 后端,第一道思想关是 IoC(控制反转)。传统写法是"谁要用谁 new":Service 里要用 Mapper,就自己 new 一个出来:

```java
// 传统写法: 自己创建依赖对象
public class StudentService {
    // 自己 new, 自己负责它的生命周期
    private StudentMapper mapper = new StudentMapperImpl();

    public Student findById(Long id) {
        return mapper.selectById(id);
    }
}
```

这种写法的毛病很明显:StudentService 和具体实现类 StudentMapperImpl 死死绑在一起,想换实现要改代码;测试时想塞个假 Mapper 进去也无从下手;每个对象都要手动管理创建和销毁,对象多了就是灾难。

IoC 的思路是反转控制权:对象不由你 new,而由框架的"容器"统一创建、统一管理。你需要哪个对象,伸手向容器要,容器递给你——这个过程叫注入(DI,依赖注入)。改写后长这样:

```java
@Service
public class StudentService {

    // 构造器注入: 依赖由框架通过构造器传进来
    private final StudentMapper mapper;

    public StudentService(StudentMapper mapper) {
        this.mapper = mapper;
    }

    public Student findById(Long id) {
        return mapper.selectById(id);
    }
}
```

注意差别:StudentService 不再 new 任何东西,它只声明"我需要一个 StudentMapper",框架启动时自动把 Mapper 实例通过构造器塞进来。控制权从"我自己创建"反转到"框架给我",这就是控制反转。创建对象的控制权反转了,依赖的获取方式也从主动 new 变成了被动接收——所以叫依赖注入。

前端类比:全局状态管理就是一次小型 IoC。早年每个组件各自维护自己的数据,组件间通信靠层层传 props,一改动牵一发动全身;后来把状态提升到 Pinia 的 store 里统一管理,组件不再自己"持有"共享数据,而是从 store 里"取"——数据由中心统一提供,组件只管消费。Spring 容器就是那个全局 store,Bean 就是存在里面的数据,注入就是组件里的 useXxxStore()。

## 容器与 Bean

容器是 IoC 的载体,它的正式名字是 ApplicationContext。启动时容器做三件事:找到所有需要管理的类,创建它们的实例,把相互之间的依赖关系装配好。被容器管理的对象统称 Bean,容器持有的这个 Bean 池就是"Bean 容器"。

怎么让容器找到你的类?在类上标注组件注解,组件扫描(上一篇讲过 @ComponentScan)会自动注册。四个注解功能完全一样,只是语义分级,让人一眼看出类的职责:

```java
@Component  // 通用组件: 不好归类的工具类
@Service    // 业务逻辑层
@Repository // 数据访问层 (Mapper 也属于这类)
@Controller // 表现层, 处理请求
```

从代码里拿 Bean 的方式叫注入,一共有三种写法,推荐程度从左到右递减:

```java
// 方式一: 构造器注入 (官方推荐)
// 依赖由构造器传入, 字段可用 final 保证不可变, 测试时手动 new 传参即可
@Service
public class StudentService {
    private final StudentMapper mapper;

    public StudentService(StudentMapper mapper) {
        this.mapper = mapper;
    }
}
```

```java
// 方式二: setter 注入
// 依赖可变, 适合可选依赖场景, 日常用得少
@Service
public class StudentService {
    private StudentMapper mapper;

    @Autowired
    public void setMapper(StudentMapper mapper) {
        this.mapper = mapper;
    }
}
```

```java
// 方式三: 字段注入 (最不推荐)
// 写法最省事, 但依赖被 @Autowired 藏起来了, 类外部不可见
@Service
public class StudentService {
    @Autowired
    private StudentMapper mapper;
}
```

为什么推荐构造器注入?三个理由:依赖显式可见(看构造器就知道这个类依赖什么);字段可以 final,对象创建后依赖不可变,更安全;测试友好,单元测试时直接 new StudentService(fakeMapper) 就能把假实现塞进去,而字段注入靠反射,不好替换。前端类比:构造器注入就像组件的 props——依赖在入口处一次性传入、不可变、一目了然;字段注入则像组件内部偷偷 import 一个全局变量,能用但耦合藏在了暗处。

> 新人常见报错:启动时报 No qualifying bean of type 'StudentMapper' 或者 NoSuchBeanDefinitionException。翻译过来就是"容器里没有你要的东西",排查顺序:这个类标注组件注解了吗?它在启动类的包扫描范围内吗?如果是第三方类,是不是忘了用 @Bean 或 @Configuration 注册?

## 从配置读取值

配置文件里的值怎么进代码?最常用的是 @Value,直接注入单个键:

```yml
# application.yml
student:
  default-score: 60
```

```java
@Service
public class StudentService {

    // 从配置文件注入单个值, 冒号后是默认值
    @Value("${student.default-score:60}")
    private int defaultScore;
}
```

@Value 适合零散的单值注入;要注入的配置多了,更好的做法是用 @ConfigurationProperties 把一组前缀相同的配置映射成一个对象,代码里注入这个对象:

```java
@Component
@ConfigurationProperties(prefix = "student")
public class StudentProperties {
    private int defaultScore;
    private String schoolName;
    // getter / setter 省略
}

@Service
public class StudentService {
    private final StudentProperties props;

    public StudentService(StudentProperties props) {
        this.props = props;
    }
}
```

两组写法对应前端里的两种取配置方式:@Value 相当于在代码里 import 一个常量文件里的某个导出;@ConfigurationProperties 相当于把 .env 环境变量集中映射成一个配置对象,类型安全、可复用。

## Bean 的作用域

容器默认是单例的:一个 Bean 类型全应用只有一个实例,所有人注入到的都是同一个对象。这对无状态的 Service、Mapper 完全够用,也是性能最好的选择。少数场景需要"每次注入都是新实例",可以改作用域:

```java
@Service
@Scope("prototype")
public class TempCounter {
    private int count = 0;
}
```

singleton(默认)与 prototype 的区别:前者容器只创建一次,全局共享;后者每次注入都创建一个新实例,生命周期由使用者管理。什么时候用 prototype?当 Bean 带状态且状态不能被共享时——比如给每次请求一个独立的计数器对象。但实际上这类需求很少,而且有状态的对象往往有更好的处理方式,所以日常开发 99% 都是默认单例,prototype 知道有这个东西、遇到时能认出来就行。

前端类比:Pinia 的 store 就是单例模式,全应用共享一份;而组件里的 ref 状态是"每实例一份"。Bean 作用域的切换,就是决定这个对象是"全局一份"还是"各用各的"。

## 小结

IoC 就是创建对象的控制权从代码手里反转给容器,DI 就是容器把依赖注入进来。让容器管理对象:类上标组件注解被扫描注册,构造器注入声明依赖,配置文件的值用 @Value 或 @ConfigurationProperties 读取。容器默认单例,无状态组件共享一份。理解 IoC 是理解 Spring 一切机制的地基:后面要学的自动配置、AOP、事务,全是容器在背后做文章。

const n=`## 为什么需要 Spring Boot

Java 后端开发绕不开 Spring,但传统 Spring 项目上手很痛苦:要写一堆 XML 配置,要手动管理每个组件的依赖关系,搭一个能跑的 Web 项目往往要折腾半天。Spring Boot 的使命就是解决这个问题——它把"能用"的默认配置全部内置,你只需按约定写代码,框架自动把东西装配好,这就是它最核心的设计理念:约定优于配置。

这个理念前端同学非常熟悉:用 Vite 建项目,零配置就能跑起来,dev server、热更新、打包全部开箱即用;而早年手动配 webpack 的时代,光是 loader 和 plugin 就能配一天。Spring Boot 之于传统 Spring,就是 Vite 之于手写 webpack。它做的事可以概括为三件:自动配置(帮你配好一切)、起步依赖(starter,一次性引入成套依赖)、内嵌服务器(自带 Tomcat,不需要单独装)。

## 最小工程长什么样

一个能跑的 Spring Boot 项目,最少只需要三样东西。先看依赖清单,Spring Boot 项目用 Maven 或 Gradle 管理依赖,主流是 Maven,pom.xml 相当于前端的 package.json:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>student-service</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <!-- 起步依赖: 一个 starter 带进来整套 Web 开发所需依赖 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
\`\`\`

要点:parent 统一了版本管理,你写依赖时不需要写版本号;spring-boot-starter-web 这一个依赖会传递引入 Spring MVC、内嵌 Tomcat、Jackson 等一堆东西。这和前端 npm install axios 后 axios 又带进 form-data、follow-redirects 是同一个道理——传递依赖。starter 就是把一组相关依赖打包成"全家桶"的机制,类似的还有 spring-boot-starter-test(测试)、spring-boot-starter-data-jpa(数据访问)等。

然后是启动类。整个应用从这一个 main 方法开始:

\`\`\`java
// Application.java —— 整个应用唯一的入口
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

main 方法里调用 SpringApplication.run,做的事情就一句话:创建容器、扫描组件、启动内嵌 Tomcat。类比前端,这就是 vite 命令做的事——启动开发服务器并把整个工程加载起来。前端项目有入口 index.html 和 main.ts,Spring Boot 项目的入口就是被 @SpringBootApplication 标注的这个类。

最后是配置文件。Spring Boot 默认读取 classpath 下的 application.yml(或 application.properties),所有自动配置的行为都可以在这里改:

\`\`\`yml
server:
  port: 8080          # 服务端口, 默认就是 8080
  servlet:
    context-path: /   # 上下文路径, 默认根路径

spring:
  application:
    name: student-service   # 应用名, 微服务里就是服务标识
\`\`\`

配置文件就是"约定优先"里的那个"可覆盖口子":默认值全有,想改就在 yml 里改一项。yaml 用缩进表示层级,和 JSON 是等价的表达,前端同学写 yaml 基本零门槛。

> 内嵌服务器意味着打成 jar 包后直接 java -jar 就能跑,不需要像传统项目那样先装一个 Tomcat 再把 war 包丢进去。前端类比:Vite 项目 npm run build 后产出纯静态文件,随便一个静态服务器就能托管,而不用像老项目那样依赖特定的容器环境。

## @SpringBootApplication 拆开看

启动类上那个注解其实是一个"三合一",拆开是三个注解的组合:

\`\`\`java
@SpringBootConfiguration   // 标记这是配置类, 本身是个 @Configuration
@EnableAutoConfiguration   // 核心: 开启自动配置
@ComponentScan             // 开启组件扫描: 扫描当前包及子包下的 @Component 等注解
public @interface SpringBootApplication {
}
\`\`\`

三个注解各管一件事。@ComponentScan 负责"找到你写的类"——它从启动类所在包开始往下扫描,凡是标了 @Component、@Service、@Controller 的类都会被注册进容器(下一篇 IoC 会细讲)。@EnableAutoConfiguration 负责"配好你没写的部分"——它根据 classpath 里有什么依赖,自动创建对应的配置。比如你引入了 spring-boot-starter-web,它发现 classpath 里有 Tomcat 的类,就自动帮你把 Tomcat 配好。

为什么扫描要"从启动类所在包开始"?因为约定:启动类必须放在所有代码的根包下,这样子包里的组件才扫得到。如果启动类放错位置,就会出现接口 404 但项目正常启动的诡异现象——这是新人第一大坑,本质是组件没被扫描注册。

## 自动配置是怎么工作的

自动配置听起来玄,原理其实朴素:条件装配。Spring Boot 内置了一百多个自动配置类,每个类上都挂着条件注解,条件满足才生效。核心的几个条件注解:

\`\`\`java
// 伪代码示意自动配置类的写法
@Configuration
@ConditionalOnClass(Tomcat.class)      // classpath 里有 Tomcat 才生效
@ConditionalOnMissingBean(WebServerFactory.class)  // 用户没自己定义才生效
public class TomcatAutoConfiguration {
}
\`\`\`

@ConditionalOnClass 是"有才配":引入 starter-web 后 classpath 里有 Tomcat 的类,条件成立,自动配置激活。@ConditionalOnMissingBean 是"你没写我才配":如果你自己定义了一个同类型组件,自动配置就退让,尊重你的自定义。这套"默认给你、写了算你的"的优先级逻辑,前端类比就是:Vite 提供了默认配置,但只要你放了 vite.config.ts,就以你的为准。

每个 starter 都自带一个 META-INF/spring.factories(新版是 AutoConfiguration.imports)文件,里面列着这个 starter 要加载的自动配置类。启动时 Spring Boot 读取这些清单,逐个评估条件注解,条件成立的才实例化。所以"开箱即用"不是魔法,是"扫描依赖 + 条件判断 + 默认装配"这套机制在工作。

> 排查"为什么某个功能没生效"的通用思路:先看依赖引入了没(条件注解的前提),再看配置文件覆盖了没(你改的键名对不对),最后看自己是不是手写了同类组件把自动配置顶掉了。三个方向排查完,九成问题都能定位。

## 实际跑起来看

一个最小可运行的例子,启动后浏览器访问 localhost:8080 能返回内容:

\`\`\`java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}
\`\`\`

这几行代码里 @RestController、@GetMapping 后面 REST 篇会展开讲,这里先感受一下流程:启动类 main 一跑,内嵌 Tomcat 起在 8080 端口,组件扫描找到 HelloController 注册进容器,请求 /hello 时框架把方法返回值转成响应体返回。整个过程没有一行配置,全部按约定完成——这就是 Spring Boot 的"快"。

从零建一个真实项目,官方推荐 start.spring.io 在线生成器:勾选需要的 starter,生成器直接打包一个完整工程 zip,下载解压就能跑。这和前端的 create-vue、create-react-app 脚手架是同一类工具,starter 勾选相当于脚手架里的功能选项。

## 小结

Spring Boot 的核心是约定优于配置,三件事让开发变快:自动配置省掉了手工装配,starter 起步依赖解决了依赖成套管理,内嵌服务器免去了部署环境准备。@SpringBootApplication 是三合一注解,组件扫描找到你的代码,条件装配补上默认配置。配置文件 application.yml 是所有约定的可覆盖口子。理解这套机制后,后面学 IoC、学 REST 接口、学 MyBatis,都是在往这个骨架里填东西。
`;export{n as default};

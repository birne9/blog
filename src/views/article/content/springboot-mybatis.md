## 数据访问层的位置

前几篇的接口都是空转:数据存在内存里,服务一重启就没了。真实项目必须把数据存进数据库,这一层的正式名字叫持久层。回顾分层结构:Controller 收请求,Service 写业务,真正和数据库打交道的代码放在 Mapper(数据访问层)——上一篇 IoC 里反复出现的 StudentMapper 就是它,现在把它落到实处。

Java 生态里操作 MySQL 的主流方案是 MyBatis:一个半自动化的持久层框架。说"半自动"是因为 SQL 还是你自己写,MyBatis 只负责两件脏活累活:把 Java 对象和 SQL 参数拼起来,把查询结果的行列映射回 Java 对象。它不替你生成 SQL,这让 SQL 完全可控——SQL 基础篇学的那些查询、JOIN、索引知识,在这里全部直接派上用场。

前端类比:MyBatis 之于后端,类似 axios 之于前端。axios 不替你决定发什么请求,它负责把参数拼进 URL、把响应解析成 JSON 对象交给你;MyBatis 不替你决定查什么,它负责把参数拼进 SQL、把结果集映射成 Java 对象。

## 接入依赖与数据源配置

第一步引入两个依赖:MySQL 驱动负责和数据库通信,mybatis-spring-boot-starter 负责把 MyBatis 接进 Spring Boot 的自动配置体系:

```xml
<dependencies>
    <!-- MySQL 驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    <!-- MyBatis 起步依赖 -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.3.2</version>
    </dependency>
</dependencies>
```

第二步在 application.yml 里配数据源。数据源就是"数据库连接池",MyBatis 执行 SQL 时从池里借连接,用完归还,不用每次现连:

```yml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/student_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: 123456
```

几个要点:url 的格式是 jdbc:mysql://主机:端口/库名,后面挂的参数解决中文乱码(characterEncoding)和时区(serverTimezone)问题——这两个参数是联调期的高频坑,建议直接照抄;student_db 数据库要先用 SQL 基础篇的方式建好。连接池不用你配,自动配置已经内置了 HikariCP,默认参数对开发期足够。

## Mapper 接口与注解 SQL

Mapper 的写法非常反直觉:你只写一个接口,不写实现类,MyBatis 运行期用动态代理替你生成实现。这是 MyBatis 与 Spring 容器配合的精髓:

```java
@Mapper
public interface StudentMapper {

    @Select("SELECT id, name, score FROM student WHERE id = #{id}")
    Student selectById(Long id);

    @Select("SELECT id, name, score FROM student WHERE name LIKE CONCAT('%', #{keyword}, '%')")
    List<Student> selectByKeyword(String keyword);

    @Insert("INSERT INTO student(name, score) VALUES(#{name}, #{score})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Student student);

    @Update("UPDATE student SET name = #{name}, score = #{score} WHERE id = #{id}")
    int update(Student student);

    @Delete("DELETE FROM student WHERE id = #{id}")
    int deleteById(Long id);
}
```

@Mapper 注解告诉 Spring Boot:这是个 Mapper 接口,请注册并生成实现。方法上挂 @Select/@Insert/@Update/@Delete 四个注解,内容是 SQL 语句。方法参数自动代入 SQL:单个参数时 #{id} 直接匹配参数名;多个参数时建议传对象,#{name}、#{score} 会去对象上找同名的 getter 取值——这就是为什么 Student 类的字段和 getter 必须齐整,MyBatis 靠 getter 拿值。

再看返回值的映射:查询结果集的行会自动映射成 Student 对象,规则是"数据库列名与 Java 字段名一一对应"(name 对 name,score 对 score)。如果列名是下划线风格(create_time)而字段是驼峰(createTime),在配置里开一行驼峰映射即可,不用逐字段手写:

```yml
mybatis:
  configuration:
    map-underscore-to-camel-case: true
```

@Insert 上的 @Options(useGeneratedKeys = true, keyProperty = "id") 值得一提:意思是"把数据库自增生成的主键回填到参数对象的 id 字段"。新增学生后前端要拿到新 id,靠的就是这一步,没有它 insert 成功后 id 还是 null。

## #{} 与 ${} 的区别

这是 MyBatis 最高频的考点和事故点。#{} 是预编译占位符,MyBatis 会把 SQL 里带 #{} 的部分换成 ?,参数值单独交给数据库,由数据库做类型处理和转义——SQL 注入对它无效。${} 是字符串直接拼接,参数值原封不动拼进 SQL,如果参数来自用户输入,恶意内容就能拼出危险的 SQL:

```java
// 正确: #{id} 预编译, 参数值不会当作 SQL 的一部分执行
@Select("SELECT * FROM student WHERE id = #{id}")
Student selectById(Long id);

// 危险: ${id} 直接拼接, id = "1 OR 1=1" 时会查出全表
// 仅用于无法预编译的场景, 如表名、列名、ORDER BY 排序字段
@Select("SELECT * FROM student WHERE id = ${id}")
Student selectByIdDanger(Long id);
```

一句话规则:凡是参数值,一律 #{};只有表名、列名、排序字段这类"SQL 结构的一部分"才用 ${},并且必须做白名单校验。前端类比:${} 相当于把用户输入直接拼进 innerHTML,#{} 相当于先转义再插入,前者是对注入攻击敞开大门。

## XML 方式写 SQL

注解写简单 SQL 很方便,但遇到动态条件就捉襟见肘:列表查询要"关键字非空才加 LIKE 条件,分数非空才加范围条件",这种拼装逻辑注解写不了,要用 XML。XML 文件和 Mapper 接口同名同包,放在 resources 下:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.example.mapper.StudentMapper">

    <!-- 动态 SQL: 条件非空才拼接, 前端类比 v-if -->
    <select id="findPage" resultType="com.example.entity.Student">
        SELECT id, name, score FROM student
        <where>
            <if test="keyword != null and keyword != ''">
                AND name LIKE CONCAT('%', #{keyword}, '%')
            </if>
            <if test="minScore != null">
                AND score &gt;= #{minScore}
            </if>
        </where>
        ORDER BY score DESC
        LIMIT #{offset}, #{size}
    </select>

</mapper>
```

namespace 指向对应接口,select 的 id 与接口方法名一致,resultType 声明映射的目标类型——接口里方法签名配 XML 里这段配置,MyBatis 就把它们拼成一个可执行的数据操作。动态标签的语义非常好懂:<if> 是条件拼接,<where> 自动处理开头的 AND/OR,前端类比就是 v-if 控制模板片段。经验规则:注解适合固定 SQL,XML 适合动态 SQL,真实项目的列表查询几乎都在 XML 里。

> XML 里特殊符号要转义:< 写成 &lt;,> 写成 &gt;,& 写成 &amp;。更省事的做法是用 CDATA 包裹:<![CDATA[ ... ]]>。

## 关联查询落到 Java 对象

SQL 基础篇的 JOIN 在这里有新的用武之地。学生表关联班级表,查学生时带出班级名,SQL 是 LEFT JOIN,但查询结果怎么映射?两种做法。简单做法是定义一个带冗余字段的 VO(视图对象),把 JOIN 结果直接映射上去:

```java
// 专门承接查询结果的对象, 比实体多一个 className 字段
public class StudentVO {
    private Long id;
    private String name;
    private Integer score;
    private String className;
}
```

```xml
<select id="findPage" resultType="com.example.entity.StudentVO">
    SELECT s.id, s.name, s.score, c.name AS class_name
    FROM student s
    LEFT JOIN classes c ON s.class_id = c.id
    WHERE s.name LIKE CONCAT('%', #{keyword}, '%')
</select>
```

列别名 class_name 配合驼峰映射规则,自动落进 className 字段。这种做法简单直接,覆盖了绝大多数场景。复杂做法是用 resultMap 配置嵌套映射,适合一对多(一个班级下多个学生)这种层级结构,入门阶段知道有这个东西、需要时再查文档即可。

到这里整条链路完整了:Controller 收请求 → Service 写业务 → Mapper 执行 SQL → MySQL 存取数据 → 结果一路映射回 Java 对象 → Jackson 序列化成 JSON 返回前端。数据持久层的最后一块拼图就此拼上。

## 小结

MyBatis 是半自动持久层框架:SQL 自己写,框架负责参数绑定与结果映射。接入三件事:加驱动和 starter 依赖、配数据源、@Mapper 接口配注解 SQL 或 XML SQL。参数一律用 #{} 预编译防注入,${} 只用于表名列名等结构片段;动态条件用 XML 的 <if>/<where> 标签;关联查询用 VO 承接 JOIN 结果。Mapper 接口不用写实现类,动态代理是它背后的机制——这和前端 axios 拦截器自动解析响应是同一个"框架替你干脏活"的思路。

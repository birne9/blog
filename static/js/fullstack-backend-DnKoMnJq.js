const n=`## 工程骨架与依赖

上一篇的设计落地的第一步:搭 Spring Boot 工程。按设计篇的目录树,后端需要 web、validation 两个 starter 加 MyBatis、MySQL 驱动,完整 pom.xml:

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<project>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.18</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>backend</artifactId>
    <version>1.0.0</version>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.mybatis.spring.boot</groupId>
            <artifactId>mybatis-spring-boot-starter</artifactId>
            <version>2.3.2</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
\`\`\`

四个依赖分别对应四件事:web 提供 MVC 和内嵌 Tomcat,validation 提供参数校验注解,MyBatis starter 接管持久层,MySQL 驱动负责数据库通信。最后那个 spring-boot-maven-plugin 是打包插件,部署篇打包时会用到它。

配置文件和启动类,Spring Boot 第一篇讲过,直接给出:

\`\`\`yml
server:
  port: 8080

spring:
  application:
    name: backend
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/student_db?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: 123456

mybatis:
  configuration:
    map-underscore-to-camel-case: true
\`\`\`

\`\`\`java
// Application.java —— 启动类放根包, 保证扫描到所有子包
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
\`\`\`

## 实体与数据访问层

先写实体,字段与表结构一一对应:

\`\`\`java
// entity/Student.java —— 与数据表 student 对应
public class Student {
    private Long id;
    private String name;
    private Integer score;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    // getter / setter 省略
}
\`\`\`

再写 Mapper,五个方法对应设计篇的五个接口,用注解 SQL(MyBatis 篇的写法,搜索用 LIKE):

\`\`\`java
// mapper/StudentMapper.java
@Mapper
public interface StudentMapper {

    @Select("SELECT * FROM student WHERE name LIKE CONCAT('%', #{keyword}, '%') ORDER BY score DESC")
    List<Student> selectByKeyword(String keyword);

    @Select("SELECT * FROM student WHERE id = #{id}")
    Student selectById(Long id);

    @Insert("INSERT INTO student(name, score) VALUES(#{name}, #{score})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Student student);

    @Update("UPDATE student SET name = #{name}, score = #{score} WHERE id = #{id}")
    int update(Student student);

    @Delete("DELETE FROM student WHERE id = #{id}")
    int deleteById(Long id);
}
\`\`\`

搜索查询按分数降序排,顺手把"成绩排名"这个隐含需求实现了。列表页展示时不用前端排序,SQL 里 ORDER BY 一次到位——这是"数据的问题尽量在数据层解决"的思路,前端拿到什么渲染什么。

## 业务层

业务层承接 Controller 与 Mapper 之间,写业务规则。这个项目业务简单,重点是把"查无此人"这类规则集中在这里,Controller 保持干净:

\`\`\`java
// service/StudentService.java
@Service
public class StudentService {

    private final StudentMapper mapper;

    public StudentService(StudentMapper mapper) {
        this.mapper = mapper;
    }

    public List<Student> list(String keyword) {
        return mapper.selectByKeyword(keyword == null ? "" : keyword);
    }

    public Student findById(Long id) {
        Student student = mapper.selectById(id);
        if (student == null) {
            throw new BizException(404, "学生不存在");
        }
        return student;
    }

    public Student create(Student student) {
        mapper.insert(student);
        return student;   // id 已由 @Options 回填
    }

    public Student update(Long id, Student student) {
        findById(id);     // 不存在则抛 404
        student.setId(id);
        mapper.update(student);
        return student;
    }

    public void delete(Long id) {
        findById(id);     // 不存在则抛 404
        mapper.deleteById(id);
    }
}
\`\`\`

几个值得注意的写法:update 和 delete 先调 findById 做存在性检查,检查失败抛业务异常,全局异常处理器会转成 404 返回——"先查后改"是防误操作的标准姿势;create 直接返回参数对象,因为 @Options 已经把自增 id 回填进对象,返回给前端就能拿到新 id;keyword 为 null 时转空串,让 SQL 的 LIKE 逻辑统一。

BizException 是自定义业务异常,带 code 和 message:

\`\`\`java
// common/BizException.java
public class BizException extends RuntimeException {
    private final int code;

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}
\`\`\`

## 接口层与统一返回

Controller 层完全按设计篇的接口清单实现,统一返回用 Spring Boot 第五篇的 Result 外壳:

\`\`\`java
// controller/StudentController.java
@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public Result<List<Student>> list(@RequestParam(required = false) String keyword) {
        return Result.ok(studentService.list(keyword));
    }

    @GetMapping("/{id}")
    public Result<Student> getById(@PathVariable Long id) {
        return Result.ok(studentService.findById(id));
    }

    @PostMapping
    public Result<Student> create(@Valid @RequestBody Student student) {
        return Result.ok(studentService.create(student));
    }

    @PutMapping("/{id}")
    public Result<Student> update(@PathVariable Long id, @Valid @RequestBody Student student) {
        return Result.ok(studentService.update(id, student));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        studentService.delete(id);
        return Result.ok(null);
    }
}
\`\`\`

Result 是上一篇设计里定下的信封结构,这里给出实现(Spring Boot 第五篇讲过):

\`\`\`java
// common/Result.java
public class Result<T> {
    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> ok(T data) {
        Result<T> r = new Result<>();
        r.code = 200;
        r.message = "success";
        r.data = data;
        return r;
    }

    public static <T> Result<T> fail(Integer code, String message) {
        Result<T> r = new Result<>();
        r.code = code;
        r.message = message;
        return r;
    }
    // getter / setter 省略
}
\`\`\`

## 参数校验与全局异常

create/update 上的 @Valid 需要实体配合校验注解,再加全局异常处理器收尾:

\`\`\`java
// entity/Student.java 中给业务字段加校验
public class Student {
    private Long id;

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotNull(message = "分数不能为空")
    @Min(value = 0, message = "分数不能小于0")
    @Max(value = 100, message = "分数不能大于100")
    private Integer score;
    // 其余字段与 getter / setter 省略
}
\`\`\`

\`\`\`java
// common/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e) {
        return Result.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("参数错误");
        return Result.fail(400, msg);
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleOther(Exception e) {
        return Result.fail(500, "服务器开小差了");
    }
}
\`\`\`

异常路径全部汇聚于此:业务异常转对应 code,校验异常转 400,未知异常兜底 500。三个处理器覆盖了全部错误出口,Controller 里没有任何 try-catch。

## 启动自测

IDEA 里跑起 Application,后端就绪。开发期自测不用等前端,curl 直接打接口:

\`\`\`bash
# 新增学生
curl -X POST http://localhost:8080/api/students \\
     -H "Content-Type: application/json" \\
     -d '{"name":"小刚","score":88}'

# 搜索列表
curl "http://localhost:8080/api/students?keyword=小"

# 校验失败示例: score 超范围, 应返回 400
curl -X POST http://localhost:8080/api/students \\
     -H "Content-Type: application/json" \\
     -d '{"name":"小刚","score":999}'
\`\`\`

预期返回:新增返回 {"code":200,"message":"success","data":{"id":1,"name":"小刚","score":88}};搜索返回 data 数组;越界分数返回 {"code":400,"message":"分数不能大于100","data":null}。三条命令把正常路径、查询路径、异常路径全验证一遍,后端就交付了。下一篇写前端,照着同一份接口约定来。

## 小结

后端实现是 Spring Boot 系列五篇的总装:分层结构(第一篇)、IoC 注入(第二篇)、REST 映射(第三篇)、MyBatis 持久化(第四篇)、统一返回与全局异常加校验(第五篇),一个不落。代码量不大,但每层各司其职,异常路径全覆盖。至此设计篇的接口约定全部兑现,后端可以独立交付——这正是分层和接口设计的回报:前后端可以并行开发,靠契约对接。
`;export{n as default};

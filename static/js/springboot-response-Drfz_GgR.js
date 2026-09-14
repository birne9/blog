const n=`## 为什么需要统一返回

前几篇的接口直接返回数据本身:查列表返回数组,查详情返回对象,报错返回 Spring 默认的错误页。前端拿到的东西结构五花八门,每次都要判断"这次返回的到底是什么",联调起来非常痛苦。

业界通行的做法:所有接口统一返回一个固定外壳,业务数据放在固定字段里。外壳一般叫 Result,三个字段打天下:

\`\`\`java
public class Result<T> {
    private Integer code;    // 状态码: 200 成功, 500 失败, 401 未登录...
    private String message;  // 提示信息: 成功时的说明或失败原因
    private T data;          // 业务数据: 泛型, 什么类型都可能

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
}
\`\`\`

Controller 的返回值全部改成 Result 包装:

\`\`\`java
@RestController
@RequestMapping("/api/students")
public class StudentController {

    @GetMapping("/{id}")
    public Result<Student> getById(@PathVariable Long id) {
        return Result.ok(studentService.findById(id));
    }

    @PostMapping
    public Result<Student> create(@RequestBody Student student) {
        return Result.ok(studentService.save(student));
    }
}
\`\`\`

前端拿到的响应从 {"id":1,"name":"小明","score":90} 变成 {"code":200,"message":"success","data":{"id":1,"name":"小明","score":90}}。结构固定之后,前端就可以写一份统一的响应处理逻辑:code 200 取 data 渲染,401 跳登录,500 弹错误提示。这套处理逻辑放在 axios 的响应拦截器里,只写一次,全项目生效——这就是 HTTP 联调篇里说的"统一请求封装"的落地方式:

\`\`\`js
axios.interceptors.response.use(
    (response) => {
        const { code, message, data } = response.data
        if (code === 200) return data      // 成功: 直接给业务数据
        if (code === 401) { /* 跳登录页 */ }
        return Promise.reject(new Error(message))
    },
    (error) => Promise.reject(error)
)
\`\`\`

前端类比:Result 外壳就是前后端之间的"信封",信封格式统一,收信人(拦截器)才能自动化处理。没有信封时每封信都要人肉拆,有信封后机器按规则拆。

## 全局异常处理

统一返回解决了成功场景,失败场景还差一半:业务代码里写 if 判断抛异常时,如果不处理,Spring 会把异常栈直接返回给前端,格式又破了。做法是写一个全局异常处理器,拦截所有异常,统一转成 Result 返回:

\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 业务异常: 自己抛的, 带明确提示信息
    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e) {
        return Result.fail(e.getCode(), e.getMessage());
    }

    // 兜底异常: 预料之外的, 提示模糊化, 细节记日志
    @ExceptionHandler(Exception.class)
    public Result<Void> handleOther(Exception e) {
        log.error("系统异常", e);
        return Result.fail(500, "服务器开小差了");
    }
}
\`\`\`

@RestControllerAdvice 声明这是一个全局异常拦截器,对所有 Controller 生效。@ExceptionHandler 声明"处理哪类异常",方法把异常对象转换成 Result 返回。机制是 AOP:Controller 抛出的异常在返回给前端之前,先经过这里的拦截——前端类比就是 Vue 的全局错误处理 errorHandler,或者 axios 响应拦截器里 catch 分支的统一处理。

业务代码里怎么用?写一个 BizException 继承 RuntimeException,带 code 和 message;Service 里遇到业务规则不满足,直接抛:

\`\`\`java
@Service
public class StudentService {
    public Student findById(Long id) {
        Student s = mapper.selectById(id);
        if (s == null) {
            // 抛出业务异常, 全局处理器会转成 Result.fail(404, "学生不存在")
            throw new BizException(404, "学生不存在");
        }
        return s;
    }
}
\`\`\`

Controller 层不再出现 try-catch,每个异常路径都汇聚到全局处理器,返回结构永远统一。开发期调接口看到 {"code":500,"message":"服务器开小差了"} 时,去后端日志里找堆栈,排查完再改代码——这就是这套机制约定的排障流程。

## 参数校验

接口的第三个收尾问题是参数校验:前端传进来的 name 为空、score 传 -5 或 999,这些非法数据要挡在业务逻辑外面。第一步引入校验依赖:

\`\`\`xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
\`\`\`

第二步在实体字段上标注校验规则,全部是语义自明的注解:

\`\`\`java
public class Student {
    private Long id;

    @NotBlank(message = "姓名不能为空")
    private String name;

    @NotNull(message = "分数不能为空")
    @Min(value = 0, message = "分数不能小于0")
    @Max(value = 100, message = "分数不能大于100")
    private Integer score;
}
\`\`\`

第三步在 Controller 参数前加 @Valid 开启校验,校验失败会抛 MethodArgumentNotValidException,在全局异常处理器里接住它,把校验信息转成 Result 返回:

\`\`\`java
@PostMapping
public Result<Student> create(@Valid @RequestBody Student student) {
    return Result.ok(studentService.save(student));
}
\`\`\`

\`\`\`java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        // 取出第一条校验失败信息
        String msg = e.getBindingResult().getFieldErrors()
                .stream()
                .map(err -> err.getDefaultMessage())
                .findFirst()
                .orElse("参数错误");
        return Result.fail(400, msg);
    }
}
\`\`\`

常用校验注解清单:@NotBlank 字符串非空非空白,@NotNull 对象非 null,@Min/@Max 数值范围,@Size 字符串或集合长度,@Email 邮箱格式,@Pattern 正则。前端类比:这套注解就是后端的表单校验规则,类似表单里 name 输入框的 required 和 maxlength 属性——注意它只做规则检查,业务校验(比如"班级人数是否已满")还是在 Service 里写。

> 校验注解与 @Valid 配合才算生效:只有 Controller 参数上加了 @Valid,实体上的注解才会被执行。只写实体注解不加 @Valid,校验静默失效,这是新人高频坑。

## 一条完整链路走查

把全系列串起来,前端提交一个新增学生的请求,后端经历的完整路径:

\`\`\`http
POST /api/students HTTP/1.1
Content-Type: application/json

{"name": "小刚", "score": 88}
\`\`\`

第一步,Controller 的 @PostMapping 匹配到 create 方法,@RequestBody 把 JSON 反序列化成 Student 对象。第二步,@Valid 执行参数校验,score 传 999 就直接抛校验异常,全局处理器返回 {"code":400,"message":"分数不能大于100"},链路到此为止。第三步,校验通过进入 Service,业务规则检查(比如重名判断),不满足抛 BizException,全局处理器转成 Result。第四步,业务通过调 Mapper,MyBatis 执行 INSERT 把数据落库,自增 id 回填。第五步,一路返回到 Controller,Result.ok(student) 包上信封,Jackson 序列化,响应返回前端。第六步,前端 axios 拦截器拆信封,code 200 取 data,页面渲染新学生。

六步里每一层只做自己该做的事,异常路径全部汇聚到全局处理器——这就是一个"能用"的接口的完整形态。全栈实战系列会把这套后端和前端页面真正接起来跑通。

## 小结

统一返回 Result 让响应结构固定,前端用 axios 拦截器集中处理;全局异常处理器 @RestControllerAdvice 拦截所有异常,业务抛 BizException、框架抛校验异常,全部转成统一格式返回;参数校验用 @Valid 加字段注解,把非法数据挡在业务之外。这三件事是一个接口从"能返回数据"到"可交付"的收尾工程,也是前后端联调顺畅的前提。
`;export{n as default};

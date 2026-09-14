## 从请求到方法的映射

HTTP 联调篇讲过 REST 的核心约定:资源名词定路径,请求方法定动作。Spring Boot 提供了一套注解,把 HTTP 请求直接映射到 Java 方法上,写接口就是"声明一个方法 + 挂一个注解":

```java
@RestController                    // 声明这是 REST 接口类, 方法返回值自动转 JSON
@RequestMapping("/api/students")   // 类级别的路径前缀
public class StudentController {

    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return studentService.findById(id);
    }
}
```

拆开看四个要素。@RestController 相当于 @Controller + @ResponseBody,意思是"方法返回的对象不要走视图,直接序列化成 JSON 写进响应体"——这决定了它是 JSON 接口而不是页面。@RequestMapping 定路径,标在类上作公共前缀,标在方法上作具体路径,两者拼接成完整路径 /api/students/{id}。@GetMapping 是 @RequestMapping(method = GET) 的简写,还有 @PostMapping、@PutMapping、@DeleteMapping 对应另外三种方法。@PathVariable 把路径里的 {id} 抓出来,转成 Long 类型塞进参数。

这套"路径模板 + 参数抓取"的映射,前端类比就是 Vue Router 的动态路由:/user/:id 定义路径模板,route.params.id 取值,@PathVariable 就是后端版的 params 取值。

## 参数的三条来路

HTTP 请求里,参数可以出现在三个位置:路径上、问号后、请求体里。后端对应三种注解:

```java
@RestController
@RequestMapping("/api/students")
public class StudentController {

    // 路径参数: GET /api/students/1
    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return studentService.findById(id);
    }

    // 查询参数: GET /api/students?keyword=小明&page=1
    @GetMapping
    public List<Student> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page) {
        return studentService.findPage(keyword, page);
    }

    // 请求体参数: POST /api/students, body 是 JSON 对象
    @PostMapping
    public Student create(@RequestBody Student student) {
        return studentService.save(student);
    }
}
```

@PathVariable 拿路径段,天然和资源标识绑定;@RequestParam 拿查询串,适合过滤、分页这类可选条件,required = false 表示可缺省,defaultValue 给缺省值;@RequestBody 拿请求体,前端把 JSON 对象放在 body 里发过来,Jackson 库自动把 JSON 反序列化成 Student 对象——这步前端类比就是 JSON.parse,只不过 parse 结果是 Java 对象而不是 JS 对象。

路径参数和查询参数怎么选?REST 约定:定位"哪一个资源"用路径参数(第几个学生),描述"怎么筛选这批资源"用查询参数(按什么关键字、第几页)。像 /api/students/1 是"1 号学生",/api/students?keyword=小明 是"名字带小明的学生列表"。

## 学生成绩 CRUD 完整案例

贯穿本系列的示例:学生成绩管理接口。一套完整的增删改查长这样:

```java
@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    // 构造器注入 (IoC 篇讲过)
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // 查: 全部或按关键字筛选
    @GetMapping
    public List<Student> list(@RequestParam(required = false) String keyword) {
        return studentService.findList(keyword);
    }

    // 查: 单个详情
    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return studentService.findById(id);
    }

    // 增: 新增学生, 返回带 id 的新对象
    @PostMapping
    public Student create(@RequestBody Student student) {
        return studentService.save(student);
    }

    // 改: 整体更新
    @PutMapping("/{id}")
    public Student update(@PathVariable Long id, @RequestBody Student student) {
        student.setId(id);
        return studentService.update(student);
    }

    // 删: 删除, 返回 204 无内容
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        studentService.delete(id);
    }
}
```

返回给前端的 Student 对象长这样:

```java
// 一个普通的 Java 类, Jackson 自动把它序列化成 JSON
public class Student {
    private Long id;
    private String name;
    private Integer score;
    // getter / setter 省略
}
```

Java 对象序列化成 JSON 是 Jackson 自动完成的,不需要任何配置。返回 Student 对象,前端收到的就是 {"id":1,"name":"小明","score":90};反过来 @RequestBody 收 JSON,Jackson 自动反序列化成 Student 对象。序列化规则默认用 getter 方法名生成字段,所以 Java 里 getter/setter 是刚需,不写的话前端拿到的字段就是空的。

Controller 只负责收发,业务逻辑放在 Service 层,这是分层约定:Controller 解析参数、调 Service、返回结果,Service 里写业务规则。前端类比:组件里只调 store 的方法、不直接操作数据,store 里才写业务逻辑。分层不是形式主义,是让每个类只做一件事,测试和改动都只动一层。

## 前端怎么调这些接口

后端接口就绪,前端用 axios 调用,一一对应上面五个方法:

```js
import axios from 'axios'

// 查列表
axios.get('/api/students', { params: { keyword: '小明' } })

// 查详情
axios.get('/api/students/1')

// 增
axios.post('/api/students', { name: '小刚', score: 88 })

// 改
axios.put('/api/students/1', { name: '小明', score: 95 })

// 删
axios.delete('/api/students/1')
```

对照一下就能看出 REST 的好处:前端 axios 的方法名和后端 @GetMapping 等注解一一对应,路径规则两边共用同一套。联调时接口报错,先别急着怀疑代码,按 HTTP 联调篇的思路走:路径拼对了吗?方法一致吗?参数在正确的位置(路径/查询串/请求体)吗?状态码说什么?九成的联调问题,答案都在这四问里。

> 开发期前端跑在 5173、后端跑在 8080,会有跨域问题。解决方式在 HTTP 联调篇讲过:开发期用 Vite 代理,把 /api 开头的请求转发到 8080。后端不用改任何代码,跨域是浏览器限制,代理是开发期的标准解法。

## 小结

Spring Boot 写 REST 接口就是"注解拼积木":@RestController 定 JSON 接口,@RequestMapping 系路径,@GetMapping/@PostMapping/@PutMapping/@DeleteMapping 定方法,@PathVariable/@RequestParam/@RequestBody 三个注解对应参数的三个来路。Controller 收参数调 Service,Jackson 自动做对象与 JSON 的互转。这套注解体系覆盖了日常 90% 的接口开发,剩下的收尾工作——统一返回结构、全局异常处理、参数校验——下一篇继续。

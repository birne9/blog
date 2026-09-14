const n=`## 一次请求发生了什么

前端和后端是怎么对上话的?前端页面在浏览器里,后端接口在服务器上,两边隔着网络,唯一的沟通方式就是 HTTP 协议。

在浏览器输入地址敲回车,到页面出现内容,中间大致五步:浏览器根据域名找到服务器(建立 TCP 连接)→ 发出一条 HTTP 请求报文 → 服务器收到后交给对应的处理程序 → 返回一条 HTTP 响应报文 → 浏览器拿到内容渲染。前端代码里的 fetch 和 axios,本质都是替你把请求报文发出去、把响应报文读回来;后端框架(Spring Boot 等)则是帮你收报文、返回报文。所以无论做前端还是后端,HTTP 都是绕不过去的公共课。

## 请求与响应报文

HTTP 报文是纯文本,长得像这样。请求报文分四部分:请求行(方法 + 路径 + 协议版本)、请求头(键值对)、空行、请求体:

\`\`\`http
GET /api/students/1 HTTP/1.1
Host: localhost:8080
Accept: application/json
\`\`\`

响应报文也是四部分:状态行(协议版本 + 状态码 + 原因短语)、响应头、空行、响应体:

\`\`\`http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 47

{"id": 1, "name": "小明", "score": 90}
\`\`\`

GET 这类"取数据"的请求通常没有请求体;POST/PUT 提交数据时,数据放在请求体里,并用 Content-Type 头说明格式(application/json 最常见)。响应体就是服务器给的数据,同样用 Content-Type 声明格式。日常开发不用手写报文,浏览器 DevTools 的 Network 面板会把每个请求的报文整理成界面,但报文结构心里要有数——排查接口问题时,你看到的那些"请求头、请求体、状态码"就是它。

## 请求方法与状态码

请求方法表示"想对资源做什么"。最常用的五个:GET 查询(如 GET /api/students 拿列表),POST 新增(如 POST /api/students 新增学生),PUT 整体修改(如 PUT /api/students/1 覆盖修改),DELETE 删除(如 DELETE /api/students/1 删除学生),PATCH 部分修改(如 PATCH /api/students/1 只改分数)。

状态码是服务器对请求的答复,三位数字,第一位代表大类:2xx 成功(200 OK、201 Created),3xx 重定向(301 永久、302 临时),4xx 客户端的问题(400 参数错、401 未登录、403 没权限、404 找不到),5xx 服务器的问题(500 内部错误、502 网关错)。

前端按状态码分流处理:200 正常渲染数据,401 跳登录页,404 提示资源不存在,500 提示"服务器开小差了"。这个判断逻辑要写进统一的请求封装里,后面全栈实战系列会做这件事。

## REST 风格设计接口

同一批数据,接口可以设计得很乱,也可以很规整。REST 是目前的主流约定,核心两条:用资源名词而不是动词,用请求方法表示动作。以学生为例:

\`\`\`http
GET    /api/students      # 学生列表
GET    /api/students/1    # 单个学生
POST   /api/students      # 新增学生
PUT    /api/students/1    # 修改 1 号学生
DELETE /api/students/1    # 删除 1 号学生
\`\`\`

对比"动词接口"的风格:getStudentById、deleteStudentByName,每加一个查询就发明一个新动词,接口越堆越多。REST 把动作收敛到方法上,路径只表达资源,资源名统一复数、层级关系用路径表达(如 /api/students/1/courses 表示 1 号学生的课程)。这套约定不强制,但团队内统一后,前端拼 URL 和看接口文档都省心。

我们的学生成绩管理系统会用到这些接口:GET /api/students(列表,支持 name 关键字)、POST /api/students(新增)、PUT /api/students/:id(改成绩)、DELETE /api/students/:id(删除)。Spring Boot 系列会逐个实现它们。

## JSON:前后端的共同语言

响应体用什么格式?JSON,没有悬念。它简单、可读,JavaScript 直接解析,Java 有现成库转换:

\`\`\`json
{
  "code": 0,
  "msg": "ok",
  "data": [
    { "id": 1, "name": "小明", "score": 90 },
    { "id": 2, "name": "小红", "score": 95 }
  ]
}
\`\`\`

实际项目里,响应体通常包一层统一外壳:code 表示业务结果(0 成功,非 0 是错误码),msg 给人看的提示,data 才是真正的数据。前端封装里先看 code,成功取 data,失败弹 msg——整个前端的错误处理只写一遍。字段命名统一小驼峰(name、createTime),别中英混搭、别一会 score 一会 Score。

> 排错小技巧:接口不通时按链路排查——先看状态码(4xx 找前端,5xx 找后端),再看请求头对不对(Content-Type 是不是 application/json),然后看请求体(字段名是不是和后端约定的一致),最后看响应体(后端有没有返回错误信息)。八成的问题出在字段名不一致和请求头写错上。

## 小结

这一篇是前后端的"共同语言课":请求与响应报文是载体,方法和状态码是规矩,REST 是接口设计的约定,JSON 是数据格式,code/msg/data 是统一外壳。下一篇讲两个前后端联调最常踩的坑:跨域和登录态。
`;export{n as default};

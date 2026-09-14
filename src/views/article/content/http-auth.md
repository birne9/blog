## 跨域:同源策略与 CORS

前端项目跑在 localhost:5173,后端接口跑在 localhost:8080,联调时浏览器控制台经常报一行红字:CORS 错误。这是前后端联调的第一大坑,必须搞清楚。

浏览器有个安全规则叫同源策略:协议、域名、端口三者完全相同才算同源,不同源的网页之间不能随意读写数据。localhost:5173 的页面去请求 localhost:8080 的接口,端口不同,就是跨域,浏览器会把响应拦下来。注意:请求其实发出去了,后端也处理了,是浏览器拿到响应后不给前端代码——这是浏览器的限制,不是服务器的限制。用 curl 直接调接口永远成功,因为 curl 不遵守同源策略。

解决的官方通道是 CORS:后端在响应头里声明"允许哪些来源访问"。最关键的响应头:

```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

Spring Boot 里加一个跨域配置类就能统一输出这些头,全栈实战系列会用到。开发阶段的另一个常用方案是前端代理:Vite 配置 server.proxy,把 /api 开头的请求转发到 8080。浏览器眼里请求是发给 5173 自己的,同源,不触发跨域;代理是开发服务器转发的,没有浏览器限制:

```js
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
}
```

两种方案的分工:前端代理适合开发阶段,零后端改动;CORS 是正式方案,生产环境(前后端不同域名)必须靠它。生产上还有第三种:用 Nginx 反向代理,前端页面和接口挂在同一域名下,物理上就不跨域了。

## 登录态:HTTP 是无状态的

HTTP 协议本身不记得你上一秒干过什么——每次请求都是独立的。但业务需要记住"这个人登录过",于是有了登录态机制。

最经典的方案是 Cookie + Session:登录成功后,服务器生成一个 Session 存起来(记下用户是谁),把 Session 的编号通过 Set-Cookie 响应头发给浏览器;浏览器之后每次请求自动带上这个 Cookie,服务器查编号就知道是谁了:

```http
HTTP/1.1 200 OK
Set-Cookie: JSESSIONID=abc123; Path=/; HttpOnly
```

Cookie 是浏览器存的小纸条,Session 是服务器端的账本。这套方案成熟可靠,缺点是 Session 存在服务器内存里,服务器一重启登录态全丢,多台服务器还要共享 Session,分布式场景下很麻烦。

## JWT:无状态的令牌

现在更流行的是 JWT(JSON Web Token):登录成功后,服务器把用户信息签成一个令牌发给前端,前端自己保存,以后每次请求带上,服务器验签即可,不用存任何东西。

JWT 是一串用点号分隔的字符串,分三段:header.payload.signature。前两段只是 base64 编码(能解码,不是加密),存放声明信息;第三段是签名,用服务器密钥算出来,防篡改——任何人改了 payload,签名就对不上:

```json
// payload 部分解码后长这样
{
  "userId": 1,
  "name": "小明",
  "exp": 1753000000
}
```

前端拿到令牌后存起来,请求时放在 Authorization 请求头里:

```http
GET /api/students HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjF9.sig
```

后端从请求头取出令牌、验签、读用户信息,接口里就知道是谁在操作。JWT 无状态、天然适合前后端分离和多服务器部署,代价是"签发了就收不回"——令牌在有效期内一直有效,除非配合黑名单,所以过期时间要设短(比如 2 小时),并做好刷新机制。

一个贴切的类比:Session 像存包处,凭证只是号码牌,东西都在柜子里;JWT 像演唱会门票,信息都印在票面上,验票员只看票真不真,不需要查后台。

> 前端存 JWT 的位置有讲究:存 localStorage 方便但有 XSS 风险,存 httpOnly Cookie 更安全但不能被 JS 读、要防 CSRF。入门阶段先放 localStorage,知道有这回事即可;生产环境按团队规范来。

## 一条完整的前后端链路

把前一篇和这一篇串起来,看一次完整的学生列表请求:前端页面 fetch('/api/students') → 开发阶段经 Vite 代理转发(生产经 Nginx 或 CORS)→ 到达 Spring Boot 的 Controller → 校验登录令牌 → Service 处理业务 → MyBatis 查 MySQL → 数据包成 code/msg/data 的 JSON 返回 → 前端按 code 分流,成功渲染列表,401 跳登录。这条链路里,HTTP 报文是路,CORS 是路口放行,令牌是通行证,JSON 是货物,缺一环都不通。后面 Spring Boot 系列实现链路的后半段,全栈实战系列把整条链路跑通。

## 联调工具:curl 与 DevTools

接口联调最常用的两个工具,一个命令行一个图形界面。curl 直接发请求,不经过浏览器,是排查"到底是不是跨域问题"的利器:

```bash
curl http://localhost:8080/api/students

curl -X POST http://localhost:8080/api/students \
  -H "Content-Type: application/json" \
  -d '{"name": "小明", "score": 90}'
```

浏览器 DevTools 的 Network 面板更直观:点开任意请求,Headers 看请求头和响应头,Preview 看格式化后的 JSON,看状态码一眼定位 4xx 还是 5xx。Postman、Apifox 这类工具适合调试 POST 传参和管理接口文档。工作流通常是:后端写完接口先用 curl/Postman 自测,前端再按文档对接,出问题两边各自拿工具抓请求对比。

## 小结

这一篇的两个大坑:跨域是浏览器的同源策略造成的,开发用代理、生产用 CORS 或 Nginx;登录态解决 HTTP 无状态的问题,Session 有状态、JWT 无状态,前后端分离项目里 JWT 是主流。加上前一篇文章,你已经有了一张完整的地图:报文、方法、状态码、REST、JSON、跨域、登录态——接下来 Spring Boot 系列会把这些概念落到后端代码上。

## 部署全景图

开发期的前后端是分离的:前端 5173,后端 8080,靠 Vite 代理和跨域配置对接。上线时这套开发设施全部换掉,生产环境的拓扑是:前端构建产物是纯静态文件,交给 Nginx 托管;后端打成 jar 包,作为一个独立进程运行;Nginx 同时充当反向代理,把 /api 开头的请求转发给后端——浏览器全程只访问一个域名,同域部署从根源上消灭跨域问题。

```text
浏览器
   │  https://your-domain.com
   ▼
Nginx (80/443 端口)
   ├── /            → 前端静态文件 (dist 目录)
   └── /api/...     → 反向代理 → 后端 jar (localhost:8080)
```

这张拓扑图要记住,它几乎是所有前后端分离项目的标准部署形态。Nginx 一肩挑两职:静态资源服务器 + 反向代理。前端类比:开发期的 Vite dev server 兼任了这两个角色(托管页面 + 转发 /api),Nginx 是它的生产环境替身。

## 后端打包与运行

Spring Boot 的交付物是一个可执行 jar,spring-boot-maven-plugin(后端篇 pom 里配过)负责把它打出来:

```bash
# 在 backend 目录下执行: 打包(跳过测试)
mvn clean package -DskipTests

# 产物在 target/ 下, 直接运行
java -jar target/backend-1.0.0.jar
```

jar 内嵌了 Tomcat,启动后监听 8080 端口。生产环境两个补充动作:用 nohup 让进程在后台常驻、断开终端也不退出;多环境配置用启动参数或环境变量覆盖(比如数据库密码不写死在 yml 里):

```bash
# 后台运行, 日志写文件
nohup java -jar target/backend-1.0.0.jar > app.log 2>&1 &

# 用命令行参数覆盖配置
java -jar target/backend-1.0.0.jar --spring.datasource.password=生产密码

# 更正规的托管: 交给 systemd, 开机自启、崩溃自动拉起
```

开发期"IDEA 点运行"对应生产期的"java -jar + 进程托管",本质是同一个 jar,只是运行环境不同。

## 前端构建

前端的交付物是 dist 目录里的静态文件,构建命令和本博客一样:

```bash
# 在 frontend 目录下执行
npm run build

# 产物: dist/index.html + dist/static 下的 js/css
```

构建产物是纯静态的 HTML/CSS/JS,不含任何开发期设施(Vite 代理、热更新都只存在于 dev server)。dist 目录整个拷到服务器上交给 Nginx 托管即可。注意构建时接口地址写的是相对路径 /api——这在前端篇接口层里就埋好了伏笔:代码里从不写 http://localhost:8080 这种绝对地址,所以产物拿到生产环境不用改一行代码,同域请求自然打到 Nginx,再由 Nginx 转发给后端。

## Nginx 部署

服务器装好 Nginx 后,一个配置文件完成部署。以 Ubuntu 为例,在 /etc/nginx/ 下新建站点配置:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/student-system;   # dist 目录内容拷到这里
        index index.html;
        try_files $uri $uri/ /index.html;   # 前端路由刷新 404 的关键
    }

    # 反向代理: /api 转发给后端
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

配置逐段解释。location / 托管前端:root 指向静态文件目录,index 指定默认页,try_files 那行是前端部署的头号大坑——前端路由(如 /article/xxx)在服务器上没有对应文件,直接访问会 404,try_files 让它回退到 index.html,由前端路由接管,否则用户刷新非首页路径就是白屏或 404。location /api/ 是反向代理:所有 /api 开头的请求转发到本机 8080 的 jar 进程,proxy_set_header 把原始请求头带过去,后端拿到正确的 Host 和来源 IP。

改完配置,重载生效:

```bash
# 检查配置语法
sudo nginx -t

# 重载配置(不停机)
sudo nginx -s reload
```

部署完成后的验证清单:浏览器打开域名能看到列表页;搜索、新增、删除全流程走通;直接访问一条前端路由地址刷新不 404;curl 域名下的 /api/students 能返回数据(验证反向代理);后端日志能看到请求进来。

## 部署常见坑

跨域又出现了:上线后如果前端控制台还报 CORS,九成是请求打到了绝对地址(比如接口层写了 http://localhost:8080),改成相对路径 /api 走 Nginx 转发即可,同域部署下根本不存在跨域。刷新 404:try_files 没配或配错,这是前端路由部署的第一坑。502 Bad Gateway:Nginx 能启动但后端没起来(jar 挂了或端口不对),检查后端进程和 8080 端口。403 Forbidden:静态文件目录权限问题,Nginx 用户读不到文件。404 但静态页面能开:/api 代理路径拼错,location 与后端 context 对不上。

排查顺序建议固定下来:先浏览器控制台看请求的完整 URL(打到了哪里)→ 再 curl 同一 URL 验证(绕过浏览器)→ 看 Nginx 错误日志(/var/log/nginx/error.log)→ 看后端日志。四步走下来,部署问题基本都能定位。全栈能力的第二层含义就在这里:问题可能出在浏览器、Nginx、后端进程、数据库任何一环,而你知道每一环的日志在哪、怎么读。

## 小结

生产部署的标准形态:Nginx 托管前端静态文件并反向代理 /api 到后端 jar,同域部署消灭跨域。后端交付物是内嵌 Tomcat 的可执行 jar,前端交付物是 dist 静态文件,开发期的 Vite 代理由 Nginx 取代。try_files 保前端路由、相对路径保接口、nginx -t 保配置正确。至此全栈系列闭环:需求 → 设计 → 后端 → 前端(双框架)→ 部署,学生成绩管理系统从想法变成了可访问的线上系统,每一环都对应本博客其他系列的知识,可以随时回去查。

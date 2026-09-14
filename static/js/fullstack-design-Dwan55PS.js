const n=`## 全栈项目的起点:需求

前面的系列把前后端拆开学,这一篇开始把它们拼起来:从零做一个学生成绩管理系统,贯穿"需求 → 设计 → 后端 → 前端 → 部署"完整链路。项目虽然小,流程和真实项目一模一样。

需求是起点,先用一句话定边界:老师可以查看学生列表、按名字搜索、新增学生、修改成绩、删除学生。一句话拆成功能清单就是五条:列表展示(含分页或至少全量列表)、关键字搜索、新增、编辑、删除。功能清单是需求的骨架,后面的接口设计、页面设计全部围绕它展开——这是全栈视角和单端视角最大的区别:先想清楚"数据从哪来、到哪去",再动手写代码。

## 数据表设计

数据是系统的中心。学生信息就一张表,DDL 直接给出(SQL 基础篇学过的基础知识):

\`\`\`sql
CREATE TABLE student (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
    name        VARCHAR(50)  NOT NULL COMMENT '姓名',
    score       INT          NOT NULL COMMENT '分数',
    create_time DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT '学生表';
\`\`\`

设计说明:主键用 BIGINT 自增,这是 Spring Boot 篇 @Options(useGeneratedKeys) 依赖的机制;name 和 score 是业务字段,NOT NULL 保证数据完整;create_time/update_time 由数据库维护,省去业务代码。表设计的原则是"字段名即契约"——数据库列名定了,后面实体、接口、前端界面全部跟着它走,中途改名会牵一发动全身。

## 接口设计

数据表定了,接口就是"外部能对这张表做什么"。按 REST 约定(HTTP 联调篇)设计,一个资源五个接口:

\`\`\`http
GET    /api/students              查询列表(支持 ?keyword= 搜索)
GET    /api/students/{id}         查询单个
POST   /api/students              新增(请求体: {name, score})
PUT    /api/students/{id}         修改(请求体: {name, score})
DELETE /api/students/{id}         删除
\`\`\`

接口设计阶段要写清楚三件事:路径与方法、请求参数(放哪、什么类型)、响应结构。以新增接口为例,请求是 POST /api/students,请求体 {"name":"小刚","score":88},响应是统一返回结构包着新学生对象:

\`\`\`json
{
    "code": 200,
    "message": "success",
    "data": { "id": 3, "name": "小刚", "score": 88 }
}
\`\`\`

统一返回结构(Spring Boot 第五篇的 Result)要在接口设计阶段就定死,因为它是前后端联调的公共约定:code 200 成功、400 参数错、404 不存在、500 服务器错,前端拦截器按 code 分流。错误响应也统一:

\`\`\`json
{
    "code": 404,
    "message": "学生不存在",
    "data": null
}
\`\`\`

接口设计的产出就是一份接口文档:五条接口,每条三要素。文档不用花哨,团队内一个共享文档或代码里的注释都行,关键是"先对齐再开发"——前端照着文档写代码,后端照着文档实现,联调时对照文档排查,这是全栈项目少返工的第一条铁律。

## 项目结构设计

动手前的最后一步:定两个工程的结构。后端是标准的 Spring Boot 分层结构,前端是标准的 Vue/React 工程,目录树就是团队协作的地图:

\`\`\`text
student-system/                    # 仓库根目录
├── backend/                       # 后端工程 (Spring Boot)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/example/student/
│       │   ├── Application.java         # 启动类
│       │   ├── controller/StudentController.java
│       │   ├── service/StudentService.java
│       │   ├── mapper/StudentMapper.java
│       │   ├── entity/Student.java
│       │   ├── common/Result.java
│       │   ├── common/BizException.java
│       │   └── common/GlobalExceptionHandler.java
│       └── resources/application.yml
└── frontend/                      # 前端工程 (Vite)
    ├── vite.config.ts
    └── src/
        ├── api/student.ts         # 接口层
        ├── App.vue                # 根组件
        └── components/            # 列表/表单等组件
\`\`\`

结构设计的三个要点:前后端分离为两个独立工程(独立开发、独立部署,通过 HTTP 对接);后端按 controller/service/mapper 分层(Spring Boot 第三篇的分层约定);前端接口调用集中到 api/ 目录(TS 篇的接口层模式,组件不直接碰 axios)。目录树和接口文档一样,是"开工前的约定",定了就少走弯路。

## 小结

全栈开发的顺序是需求 → 数据 → 接口 → 结构 → 代码,前四步是纯设计工作,不写代码,但决定了后面所有代码的形状。本篇的产出物:五条功能清单、一张表、五个接口的约定、两个工程的结构。下一篇开始把这些设计变成 Spring Boot 的真实代码。
`;export{n as default};

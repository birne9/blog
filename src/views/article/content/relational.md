## 什么是关系数据库

数据要存起来,最早可以写在文件里,但文件不方便查询和管理,于是有了数据库。数据库分很多种,本系列讲的是最主流的一种:关系型数据库(Relational Database)。

关系型数据库把数据组织成一张张表(table),表里每一行(row)代表一条记录,每一列(column)代表一个字段。比如一个学生表,有 id、class_id、name、gender、score 五列:

```sql
INSERT INTO students (id, class_id, name, gender, score) VALUES
(1, 1, '小明', 'M', 90),
(2, 1, '小红', 'F', 95),
(3, 2, '小白', 'F', 81);
```

每一行是一条学生记录。查询、插入、修改、删除都是围绕表来操作的,这门操作语言叫 SQL(Structured Query Language,结构化查询语言)。

> 前端类比:一张表就像一个 JSON 数组,每一行是一个对象,列名就是对象的字段名。区别在于关系型数据库要求每一列的类型是固定的(强类型),不能像 JSON 那样同一列一会儿是数字一会儿是字符串。

## 安装与启动 MySQL

关系型数据库有很多产品:MySQL、PostgreSQL、Oracle、SQL Server 等,语法大同小异。本系列以 MySQL 为例,这也是工作中用得最多的免费数据库。

macOS 下用 Homebrew 安装并启动:

```bash
brew install mysql
brew services start mysql
```

或者用 Docker 跑一个,避免本机环境污染:

```bash
docker run --name mysql-learn -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 -d mysql:8
```

装好后用命令行客户端连接,输入密码即可进入交互界面:

```sql
mysql -u root -p
```

进入后先看几个管理命令:SHOW DATABASES 列出所有数据库,CREATE DATABASE 新建一个,USE 切换到某个数据库,SHOW TABLES 列出该库的所有表,DESC 表名 查看表结构。

```sql
SHOW DATABASES;
CREATE DATABASE test;
USE test;
SHOW TABLES;
```

> 前端类比:mysql 客户端就像浏览器开发者工具里的 Console,SHOW DATABASES 相当于 ls 看目录,USE test 相当于 cd 进某个目录。SQL 语句以分号结尾,一条语句写完回车不会执行,要输入分号再回车,这点和 Java 一样。

## 主键

每张表通常要有一列能唯一标识每一行,这叫主键(Primary Key)。主键有两个硬性要求:不能重复、不能为空。最常见的做法是用自增整数:

```sql
CREATE TABLE students (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    gender CHAR(1) NOT NULL,
    score INT NOT NULL,
    PRIMARY KEY (id)
);
```

BIGINT 是 8 字节整数,NOT NULL 表示不允许为空,AUTO_INCREMENT 表示插入时不用指定这列,数据库自动 +1 生成。也可以建联合主键:PRIMARY KEY (id, name) 表示两列合起来唯一。

主键一般用数据库自增 ID,不用身份证号、学号这类"业务字段",因为业务字段可能变化,一旦变了所有引用它的地方都要跟着改。

> 前端类比:主键就是数组元素的唯一 id。前端渲染列表要 :key 就是同一个道理,没有稳定唯一的 key,增删改时框架无法精确追踪哪一行变了。自增 ID 相当于程序里自增计数器生成 id,而不是拿用户名这种可变字段当 key。

## 外键

表和表之间要建立关联,靠的是外键(Foreign Key)。比如学生属于某个班级,students 表里存 class_id,它引用 classes 表的主键:

```sql
CREATE TABLE classes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE students (
    id BIGINT NOT NULL AUTO_INCREMENT,
    class_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender CHAR(1) NOT NULL,
    score INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (class_id) REFERENCES classes(id)
);
```

一个班级有多个学生,叫一对多关系:在"多"的那张表(students)加一列存"一"的主键。学生和老师是多对多关系,一个学生有多个老师,一个老师教多个学生,这时需要一张中间表:

```sql
CREATE TABLE student_teacher (
    student_id BIGINT NOT NULL,
    teacher_id BIGINT NOT NULL,
    PRIMARY KEY (student_id, teacher_id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
```

中间表只存两列外键,联合主键保证同一个学生和老师的关系不重复。注意外键约束会要求被引用的数据必须存在,插入一个不存在的 class_id 会直接报错,这也是数据一致性的一道保险。

> 前端类比:外键就是"对象里存另一个对象的 id"。班级数据一个数组,学生数据一个数组,学生对象里加个 classId 字段指向班级,和数据库的做法完全一样。多对多的中间表,就像前端做"我的关注"功能时单独存一张关注关系表,而不是把关注列表塞进用户对象里。

## 索引

表大了以后查询会变慢,索引(Index)就是加速查询的结构。比如经常按 class_id 查学生,给这列建个索引:

```sql
ALTER TABLE students ADD INDEX idx_class_id (class_id);
```

建了索引之后,WHERE class_id = 1 这条查询不需要把整张表扫一遍,而是直接定位到对应位置。主键会自动建索引,所以按 id 查询天生就快。如果某列的值必须唯一,用唯一索引:

```sql
ALTER TABLE students ADD UNIQUE INDEX uni_name (name);
```

索引的代价是:每次插入、更新数据都要同步维护索引,所以索引不是越多越好,只给经常出现在 WHERE 条件里的列建。

> 前端类比:没索引的查询就像在数组里用 for 循环线性查找,挨个比对,数据越多越慢;建了索引就像把数据放进 Map,直接用 key 取值,几乎不随数据量变慢。唯一索引相当于 Map 里 key 不能重复,重复插入直接报错,帮你挡掉脏数据。

## 小结

这一篇把关系型数据库的地基打好了:数据存在表里,主键唯一标识一行,外键关联表与表,索引加速查询。建表的原则是先想清楚实体(班级、学生、老师)和它们之间的关系(一对多、多对多),再动手写 CREATE TABLE。下一篇进入日常使用频率最高的部分:SELECT 查询。

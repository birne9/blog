const n=`## 多表查询

一个查询可以同时查多张表。SELECT 的 FROM 子句里写多个表名,逗号分隔,比如同时查班级表和学生表:

\`\`\`sql
SELECT * FROM classes, students;
\`\`\`

这条语句返回的行数是两张表行数的乘积,这叫笛卡尔积:每个班级和每个学生都配对一次。显然大部分配对是没意义的,我们只想要"学生和他的班级"这种正确配对,所以加上关联条件:

\`\`\`sql
SELECT s.name, c.name
FROM students s, classes c
WHERE s.class_id = c.id;
\`\`\`

FROM 里给表起别名(s 和 c),WHERE 里的 s.class_id = c.id 把学生行和它所属班级行配对,这才得到有意义的结果:每个学生的名字加上他班级的名字。

> 前端类比:多表查询就像两个数组做关联。笛卡尔积等价于双重 for 循环把两两组合全列出来,WHERE 关联条件就是循环里加个 if 判断,只留下 student.classId === class.id 的配对。前端拿到两个接口的数据后自己写代码关联,数据库里就是把这段关联逻辑写进一条 SQL。

## 连接查询

上面那种写法是隐式连接,更推荐用显式的 JOIN 语法,关联条件写在 ON 后面,意图更清晰。

INNER JOIN 内连接:只返回两边都配得上的行。查每个学生的班级名:

\`\`\`sql
SELECT s.name, c.name
FROM students s
INNER JOIN classes c ON s.class_id = c.id;
\`\`\`

LEFT JOIN 左连接:以左表为主,右表配不上的行也要,配不上的列填 NULL。查所有班级,包括还没有学生的班级:

\`\`\`sql
SELECT c.name, COUNT(s.id) AS student_num
FROM classes c
LEFT JOIN students s ON c.id = s.class_id
GROUP BY c.id;
\`\`\`

RIGHT JOIN 右连接和 LEFT JOIN 对称,以右表为主。日常 LEFT JOIN 用得最多,只要把"必须全部保留的表"放左边就行。

MySQL 没有 FULL JOIN,要查"两边的孤儿"(没学生的班级 + 没班级的学生)得用 UNION 拼两个查询,或者 LEFT JOIN 加 IS NULL 条件:

\`\`\`sql
SELECT c.name
FROM classes c
LEFT JOIN students s ON c.id = s.class_id
WHERE s.id IS NULL;
\`\`\`

> 前端类比:INNER JOIN 就是两个数组过滤出"能对上"的组合,像 JS 里 students.flatMap(s => classes.filter(c => c.id === s.classId).map(c => ({...})))。LEFT JOIN 是遍历左数组,每一项去右数组里找,找不到就给 null,等价于 for 循环 + find,配不上也要保留左表那一项。IS NULL 判断要专门学一下:SQL 里 NULL 和任何值比较都是未知,所以必须用 IS NULL,不能写 = NULL。

## 插入数据

INSERT 往表里插入新行,列名和值一一对应:

\`\`\`sql
INSERT INTO students (class_id, name, gender, score) VALUES (2, '大牛', 'M', 100);
\`\`\`

自增主键 id 不用写,数据库自动生成。一次插入多行用多条 VALUES,性能比一条条插高得多:

\`\`\`sql
INSERT INTO students (class_id, name, gender, score) VALUES
(1, '大毛', 'M', 87),
(2, '二毛', 'M', 81),
(3, '三毛', 'F', 96);
\`\`\`

还可以把查询结果插进表里,比如把一班的男生复制到二班:

\`\`\`sql
INSERT INTO students (class_id, name, gender, score)
SELECT 2, name, gender, score FROM students WHERE class_id = 1 AND gender = 'M';
\`\`\`

列的顺序可以调换,只要 VALUES 的顺序和前面声明的列一致。没写到的列用默认值,建表时没有默认值就填 NULL。

> 前端类比:INSERT 就是数组的 push。多行 VALUES 相当于一次性 push 多个元素,比循环里一个个 push 效率高。INSERT INTO ... SELECT 相当于 newArr.push(...oldArr.filter(...).map(...)),把已有数据加工后批量复制。

## 更新数据

UPDATE 修改已有行的数据,SET 指定改哪些列,WHERE 圈定改哪些行:

\`\`\`sql
UPDATE students SET score = score + 5 WHERE class_id = 1;
UPDATE students SET name = '小明同学', score = 92 WHERE id = 1;
\`\`\`

最重要的一条纪律:UPDATE 必须带 WHERE,否则全表每一行都会被改,生产事故里排名前三的案例就是忘写 WHERE。养成习惯,先写 WHERE 再写 SET。

批量更新用 CASE 表达式,一条语句按不同条件改不同值:

\`\`\`sql
UPDATE students SET score = CASE
    WHEN score < 60 THEN 60
    WHEN score >= 90 THEN 95
    ELSE score
END;
\`\`\`

> 前端类比:UPDATE 就是先 find 到元素再改它的属性:list.find(s => s.id === 1).score = 92。忘写 WHERE 的 UPDATE 相当于 list.forEach(s => s.score = 92) 把所有人都改了。CASE WHEN 就是 map 里的 if-else 分支,根据原值算出新值。

## 删除数据

DELETE 删除行,同样必须带 WHERE:

\`\`\`sql
DELETE FROM students WHERE id = 10;
DELETE FROM students WHERE score < 60;
\`\`\`

和 UPDATE 一样,忘写 WHERE 就是清空全表,这是不可恢复的操作。所以实际开发中很少物理删除,主流做法是软删除:表里加一个 deleted 标记列,删除操作改成 UPDATE deleted = 1,查询时都带 WHERE deleted = 0。数据还在,误删可以一键恢复,还能留审计痕迹。

> 前端类比:DELETE FROM ... WHERE 相当于 list.splice(index, 1),前提是先找到下标。软删除就是前端里"移入回收站"而不是彻底清空,标记个 isDeleted = true,列表过滤掉就行,后悔了还能捞回来。

## 小结

这一篇把"动数据"的三板斧补齐了:JOIN 把多张表关联起来查,INSERT/UPDATE/DELETE 负责增删改。两个必须刻在脑子里的纪律:UPDATE 和 DELETE 必须先写 WHERE,以及生产环境优先软删除。写操作会改真实数据,而改数据必须保证安全,这就引出了下一篇的主角:事务。
`;export{n as default};

const n=`## 基本查询

查询是 SQL 里使用频率最高的操作。查一个表的所有数据用 SELECT * FROM 表名,星号代表所有列:

\`\`\`sql
SELECT * FROM students;
\`\`\`

结果会把 students 表的所有行所有列都返回。实际开发中不建议滥用星号,查什么列就写什么列,表结构变了不会殃及查询结果,传输的数据也更小:

\`\`\`sql
SELECT id, name, score FROM students;
\`\`\`

SQL 里 -- 开头是注释,和 Java 的 // 一样。查询不区分大小写,但习惯上关键字大写、表名列名小写,一眼能区分结构。

> 前端类比:SELECT 列名 FROM 表名 就像 JS 里 data.map(item => item.name),只挑需要的字段。SELECT * 相当于把整个对象原样返回,字段一多就成了"我只要名字你给我全家桶"。

## 条件查询

大多数时候我们只想查满足某些条件的行,用 WHERE 子句。常用比较运算符和 Java 一样:大于、小于、等于、不等于用 <> 或 !=:

\`\`\`sql
SELECT * FROM students WHERE score >= 80;
SELECT * FROM students WHERE score >= 80 AND gender = 'M';
SELECT * FROM students WHERE score >= 80 OR score <= 60;
SELECT * FROM students WHERE NOT class_id = 2;
\`\`\`

AND 的优先级高于 OR,拿不准就加括号,和 Java 的逻辑运算规则一致。字符串匹配用 LIKE,% 代表任意多个字符,_ 代表一个字符:

\`\`\`sql
SELECT * FROM students WHERE name LIKE '小%';
SELECT * FROM students WHERE name LIKE '小_';
\`\`\`

查某个集合里的值用 IN,查范围用 BETWEEN,注意 BETWEEN 1 AND 10 是闭区间,包含两个端点:

\`\`\`sql
SELECT * FROM students WHERE class_id IN (1, 2, 3);
SELECT * FROM students WHERE score BETWEEN 80 AND 90;
\`\`\`

> 前端类比:WHERE 就是数组的 filter。WHERE score >= 80 AND gender = 'M' 等价于 list.filter(s => s.score >= 80 && s.gender === 'M')。LIKE '小%' 等价于前端里 name.startsWith('小') 加上通配符,IN (1,2,3) 等价于 [1,2,3].includes(classId)。

## 投影查询

投影查询就是只查部分列,并且可以给列起别名,或者把列加工成新的列。别名用 AS:

\`\`\`sql
SELECT id, name, score AS 分数 FROM students;
\`\`\`

列之间可以做计算,比如把分数加 10 分展示:

\`\`\`sql
SELECT id, name, score, score + 10 AS score_new FROM students;
\`\`\`

想要去掉重复值用 DISTINCT,比如查所有出现过的班级编号:

\`\`\`sql
SELECT DISTINCT class_id FROM students;
\`\`\`

DISTINCT 修饰的是整行,SELECT DISTINCT class_id, gender 去重的是两列组合,不是单列。

> 前端类比:投影加计算就是 map。SELECT score + 10 AS score_new 等价于 list.map(s => ({ ...s, score_new: s.score + 10 })),AS 就是给新字段起名。DISTINCT 等价于 new Set(list.map(s => s.class_id)),一行一行去重。

## 排序

ORDER BY 子句负责排序,默认升序 ASC,降序用 DESC。先按分数降序,分数相同再按 id 升序:

\`\`\`sql
SELECT id, name, score FROM students ORDER BY score DESC, id ASC;
\`\`\`

排序只影响返回结果的顺序,不会改表里的数据。可以对任何列排序,包括前面算出来的新列,比如按加分后的分数排。

> 前端类比:ORDER BY score DESC 就是 list.sort((a, b) => b.score - a.score),多列排序就是比较器里先比分数、分数相同再比 id。数据库排序在服务端完成,前端拿到的已经是排好序的数组,不需要自己再 sort。

## 分页查询

数据多了不能一次全查出来,用 LIMIT 限制返回行数,OFFSET 指定跳过多少行。查第 2 页(每页 10 条)就是跳过前 10 条再取 10 条:

\`\`\`sql
SELECT id, name FROM students ORDER BY id LIMIT 10 OFFSET 10;
\`\`\`

LIMIT 10 OFFSET 0 可以简写成 LIMIT 10。注意 OFFSET 是"跳过多少行"不是"第几页",前端常见的页码参数要先换算:OFFSET = (页码 - 1) * 每页条数。分页必须配 ORDER BY,否则每次查询的顺序不确定,翻页会重复或漏数据。

> 前端类比:LIMIT OFFSET 就是数组的 slice。第 2 页每页 10 条等价于 list.slice(10, 20),OFFSET 就是 slice 的起点。前端的页码从 1 开始、slice 从 0 开始,换算关系别搞混。

## 聚合查询

聚合函数把多行汇总成一个值:COUNT 数行数,SUM 求和,AVG 求平均,MAX/MIN 求最大最小:

\`\`\`sql
SELECT COUNT(*) FROM students;
SELECT AVG(score) FROM students WHERE gender = 'M';
SELECT MAX(score), MIN(score) FROM students;
\`\`\`

分组统计用 GROUP BY,比如按班级统计人数和平均分:

\`\`\`sql
SELECT class_id, COUNT(*) AS num, AVG(score) AS avg_score
FROM students
GROUP BY class_id;
\`\`\`

GROUP BY 把相同 class_id 的行分成一组,聚合函数在每组内计算。想对分组结果再过滤,用 HAVING,它和 WHERE 的区别是:WHERE 在分组前过滤行,HAVING 在分组后过滤组:

\`\`\`sql
SELECT class_id, AVG(score) AS avg_score
FROM students
GROUP BY class_id
HAVING AVG(score) > 80;
\`\`\`

记住执行顺序:先 WHERE 筛行,再 GROUP BY 分组,然后聚合计算,最后 HAVING 筛分组。

> 前端类比:聚合就是 reduce,COUNT 相当于 list.length,AVG 相当于 sum / length。GROUP BY 就是按某个字段分组再对每组 reduce,等价于前端先分组再统计。WHERE 是分组前 filter 每个元素,HAVING 是分组后 filter 每个分组结果,时机不同,别混用。

## 小结

查询六件套:SELECT 挑列、WHERE 筛行、ORDER BY 排序、LIMIT 分页、GROUP BY 分组、HAVING 筛分组。这六个子句能组合出日常 90% 的查询需求,执行顺序是 FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT。下一篇讲怎么把两张表连起来查,以及往表里增删改数据。
`;export{n as default};

---
title: '[框架学习]Hibernate - 5 查询与连接池.md'
date: 2019-02-15 00:00:00
categories: 框架学习
tags: 框架学习
excerpt: 'Hibernate是一个开放源代码的对象关系映射框架，它对[JDBC](https://baike.baidu.com/item/JDBC/485214)进行了非常轻量级的对象封装，它将POJO与数据库表建立映射关系，是一个全自动的orm框架，hibernate可以自动生成SQL语句，自动执行，使得Java程序员可以随心所欲的使用对象编程思维来操纵数据库...'
---

## (一) 描述

Hibernate 的查询方式有多种，这里详细说明。

连接池。。。

## (二) 查询

### 2.1 GET/LOAD 主键查询

hibernate 专门封装了主键查询

**2.1.1 懒加载**

```java
<T> T load(Class<T> theClass, Serializable id, LockMode lockMode);
<T> T load(Class<T> theClass, Serializable id, LockOptions lockOptions);
Object load(String entityName, Serializable id, LockMode lockMode);
Object load(String entityName, Serializable id, LockOptions lockOptions);
<T> T load(Class<T> theClass, Serializable id);
Object load(String entityName, Serializable id);
void load(Object object, Serializable id);
```

**2.1.2 立即查询**

```java
<T> T get(Class<T> entityType, Serializable id);
<T> T get(Class<T> entityType, Serializable id, LockMode lockMode);
<T> T get(Class<T> entityType, Serializable id, LockOptions lockOptions);
Object get(String entityName, Serializable id);
Object get(String entityName, Serializable id, LockMode lockMode);
Object get(String entityName, Serializable id, LockOptions lockOptions);
```

### 2.2 对象导航查询

>如果对象与对象之前存在一对多、多对一的关系的时候
>
>- 在以前SQL查询的时候：我们如果**想要得到当前对象与另一对象的关联关系的时候，就必须用多表查询来得到数据**
>- Hibernate提供了对象导航查询：我们可以使用主键查询完之后，得到的对象，**直接使用对象得到集合就可以得到对应的数据了**。

```java
	/** 对象导航查询 */
    @Test
    public void testObj(){
        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        
        ClassRoom classRoom = session.get(ClassRoom.class, 1);
        Set<Student> students = classRoom.getStudents();
        
        tx.commit();
        session.close();
    }
```

### 2.3 HQL 查询

### 2.3.1 查询全部与查询指定列

```java
	@Test
    public void testHql1(){
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("from Student ");
        List students = res.list();
        System.out.println(students);
    }
	@Test
    public void testHql1(){
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("select id from Student ");
        List students = res.list();
        System.out.println(students);
    }	
```

注意： select 不支持 *，查询指定列的时候，返回的是对象数组 。

**封装对象**

查询指定列返回对象数组不操作，可以直接将其封装为对象。

```java
	/**
     * 封装对象
     */
    @Test
    public void testHql2() {
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("select new java.lang.Integer(id) from Student");
        List students = res.list();
        System.out.println(students);
    }
```

### 2.3.2 条件查询

**占位符**

```java
	/** 占位符查询 */
 	@Test
 	public void testHql3(){
     	Session session = HibernateUtil.getSession();
     	Query res = session.createQuery("from Student where id=?1");
     	res.setParameter(1,1);
     	List students = res.list();
     	System.out.println(students);
 	}
```

？ 后面要跟数字，不跟数字的形式在新版本已经不被支持了。

**命名参数**

```java
 /** 命名参数 */
    @Test
    public void testHql4(){
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("from Student where id=:id");
        res.setParameter("id",1);
        List students = res.list();
        System.out.println(students);
    }
```

**范围查询**

```java
 	/** 范围查询 */
    @Test
    public void testHql5(){
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("from Student where id between 1 and 3");
        List students = res.list();
        System.out.println(students);
    }
```

**模糊查询**

```java
	/** 模糊查询  */
    @Test
    public void testHql6(){
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("from Student where name like ?1");
        res.setParameter(1,"%%");
        List students = res.list();
        System.out.println(students);
    }
```

通配符要卸载参数中。

### 2.3..3 聚合查询

**Query对象提供了 uniqueResult() 这么一个方法，返回只有一条记录的数据。也可以使用 getSingleResult()。**

```java
 	/** 聚合查询 */
    @Test
    public void testHql7(){
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("select count(*) from Student");
        Object students = res.getSingleResult();
        students = res.uniqueResult();
        System.out.println(students);
    }
```

### 2.3.4 分组查询

```java
	/** 分组查询 */
    @Test
    public void testHql8(){
        Session session = HibernateUtil.getSession();
        Query res = session.createQuery("select name,count(*) from Student group by name");
        List students = res.list();
        System.out.println(students);
    }
```

### 2.3.5 连接查询

> 连接查询也就是多表查询,多表查询有三种：
>
> * 内连接【等值连接】
>
> * 左外连接
>
> * 右外连接
>
> 值得注意的是：连接查询返回的也是对象数组！

```java
//1) 内连接   【映射已经配置好了关系，关联的时候，直接写对象的属性即可】
Query q = session.createQuery("from ClassRoom c inner join c.students");

//2) 左外连接
Query q = session.createQuery("from ClassRoom c left join c.students");

//3) 右外连接
Query q = session.createQuery("from Student s right join s.classRoom");

q.list();
```

### 2.3.6 迫切连接

>由于连接查询返回的是对象数组，我们使用对象数组来操作的话会很不方便…**既然是连接查询，那么对象与对象是肯定有关联关系的**…于是乎，我们想把左表的数据填充到右表中，或者将右表的数据填充到左表中…**使在返回的时候是一个对象、而不是对象数组！**HQL提供了**fetch关键字供我们做迫切连接**

```java
//1) 迫切内连接    【使用fetch, 会把右表的数据，填充到左表对象中！】
Query q = session.createQuery("from ClassRoom c inner join fetch c.students");
q.list();

//2) 迫切左外连接
Query q = session.createQuery("from ClassRoom c left join fetch c.students");
q.list();
```

### 2.3.7 命名查询

将常用的查询语句写在相应的映射文件中，然后直接获取。  

```xml
<!-- 写在 Student 映射文件中 -->
<query name="getAllStudents">
	from Student
</query>
```

```java
	/** 命名查询 */
    @Test
    public void testHql9(){
        Session session = HibernateUtil.getSession();
        Query q = session.getNamedQuery("getAllStudents");
        List res = q.list();
        log.info(res.toString());
    }
```

### 2.3.8 Criteria 查询

>**Criteria是一种完全面向对象的查询**
>
>**Criteria使用的是add()来添加条件。条件又使用一个Restrictions类来封装**

```java
	/* Criteria 查询 */
    @Test
    public void testCriteria() {
        Session session = HibernateUtil.getSession();
        Criteria criteria = session.createCriteria(Student.class);
        criteria.add(Restrictions.eq("id", 1));
        List res = criteria.list();
        log.info(res.toString());
    }
```

Criteria查询使用不了分组、连接查询，并且已经不推荐使用了。

### 2.3.9 SQL 本地化查询

不使用映射来操作对象，而是直接执行 SQL 语句。

返回的也是对象数组，不过可以使用 addEntity() 方法进行包装。

```java
	/* SQL */
    @Test
    public void testSql(){
        Session session = HibernateUtil.getSession();
        NativeQuery nativeQuery = session.createSQLQuery("select * from student ").addEntity(Student.class);
        List list = nativeQuery.list();
        log.info(list.toString());
    }	
```

这种方式不能跨数据库，所以我们在主配置文件中配置了方言：

```xml
<!-- 数据库方言，这里配置的是 MySQL8 ，hibernate 根据不同的方言生成不同的 sql -->
<property name="hibernate.dialect">org.hibernate.dialect.MySQL8Dialect</property>
```

### 2.3.10 分页查询

>传统的SQL我们在DAO层中往往都是使用两个步骤来实现分页查询
> - 得到数据库表中的总记录数
> - 查询起始位置到末尾位数的数据

hibernate  对分页查询提供了良好的支持。

```java
	/* 分页查询 */
    @Test
    public void testPage() {
        Session session = HibernateUtil.getSession();
        Query query = session.createQuery("from Student");
        // 得到滚动结果集
        ScrollableResults scroll = query.scroll();
        // 滚动到最后一行
        scroll.last();
        // 当前行号 + 1,因为行号从0开始
        int sum = scroll.getRowNumber() + 1;
        log.info("总记录数： " + sum);
        // 设置分页位置
        query.setFirstResult(0);
        query.setMaxResults(2);

        log.info(query.list().toString());
    }
```

## (三) 连接池

Hibernate自带了连接池，如果没有别的配置，就会使用自带的连接池，但是，该连接池比较简单。我们可以在配置文件中指定别的连接池。

先引入 maven 依赖：

```xml
<!-- druid 连接池 -->
<dependency>
	<groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.20</version>
</dependency>
```

不同连接池配置方式不同，这里用了 Durid，在 hibernate.cfg.xml 配置：

```xml
	<!-- 数据库连接配置 -->
        <property name="url">jdbc:mysql:///test_v2?serverTimezone=Asia/Shanghai</property>
        <property name="driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="username">admin</property>
        <property name="password">199711</property>

        <!-- 连接池配置 -->
        <property name="hibernate.connection.provider_class">
            com.alibaba.druid.support.hibernate.DruidConnectionProvider
        </property>
```

## (四) 线程 Session 的使用

我们创建Session的时候，有两个方法

- openSession()【每次都会创建新的Session】
- getCurrentSession()【获取当前线程的Session，如果没有则创建】

一般地，我们**使用线程Session比较多**

如果要使用getCurrentSession()，需要在 hibernate.cfg.xml 中配置:

```xml
<!--配置线程Session-->        
<property name="hibernate.current_session_context_class">thread</property>
```

```java
/**
 * @author zh  --2019/10/23 13:31
 */
public class TestThreadSession extends TestApplication {
    /** 使用线程 Session 可以不用关闭session，线程结束会自动关闭 */
    @Test
    public void test(){
        Session session = HibernateUtil.getCurrentSession();

        Student student = new Student();
        student.setName("小李");

        Transaction tx = session.beginTransaction();
        session.save(student);
        tx.commit();
    }
}
```

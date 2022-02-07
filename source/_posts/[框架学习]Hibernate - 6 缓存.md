---
title: '[框架学习]Hibernate - 6 缓存.md'
date: 2019-02-16 00:00:00
categories: 框架学习
tags: 框架学习
toc: true
---

## (一) 描述

Hibernate 中对象的状态有三种：

* 临时/瞬时状态

* 持久化状态

* 游离状态

这是缓存的基础

## (二) 状态解析

**2.1 瞬时状态**

我们直接 new 出来的对象就是瞬时状态：

* 该对象还没有被持久化到数据库中
* 不受 Session 的管理

**2.2 持久化状态**

调用 Session 的查询或更新方法返回的对象就是持久化状态，特点：

* 数据库中有对应的数据
* Session 没有关闭，受 Session 的管理
* 对对象的操作会反映到数据库

**2.3 游离状态**

当 Session 关闭的时候，持久化状态的对象就变成了游离状态：

* 不受 Session 管理
* 数据库中有对应的数据

## (三) 懒加载

**3.1 概述**

> **懒加载就是当使用数据的时候才去获取数据、执行对应的SQL语句**,**当还没用到数据的时候，就不加载对应的数据!**
>
> 主要目的就是为了**提高Hibernate的性能，提高执行效率**！
>
> - **get: 及时加载，只要调用get方法立刻向数据库查询**
> - **load:默认使用懒加载，当用到数据的时候才向数据库查询。**

**3.2 配置**

可以再映射文件中通过 lazy 属性来设置，lazy 的取值：

- true：启用懒加载

- false：关闭懒加载

- extra：在集合数据懒加载的时候提升效率，只能在 set ，list 标签中有效，在真正使用数据的时候才会发送  SQL，如果调用 size() / isEmpty() 只是统计，不是真正使用数据。

**3.3 懒加载异常**

当 Session 关闭的时候，就不能使用懒加载了，否则会出异常，可以用这些方法解决：

- 使用一下数据

- 强迫代理对象初始化

  Hibernate.initialize(proxy)

- 关闭懒加载

- 在使用完数据之后再关闭 Session

## (四) 缓存

Hibernate 有一级缓存和二级缓存之分。

### 4.1 一级缓存

**4.1.1 什么是一级缓存**

>Hibenate中一级缓存，也叫做session的缓存，**它可以在session范围内减少数据库的访问次数！  只在session范围有效！ Session关闭，一级缓存失效！**
>
>**只要是持久化对象状态的，都受Session管理，也就是说，都会在Session缓存中！**
>
>Session的缓存由hibernate维护，**用户不能操作缓存内容； 如果想操作缓存内容，必须通过hibernate提供的evit/clear方法操作**。

**4.1.2 为什么要使用缓存**

减少对数据库的访问次数！从而提升hibernate的执行效率！

**4.1.3 测试缓存**

```java
	/** 测试缓存 */
    @Test
    public void test() {
        Session session = HibernateUtil.getCurrentSession();
        Transaction tx = session.beginTransaction();
        Student student = session.get(Student.class, 1);
        student.setName("小红");
        tx.commit();
    }
```

多次执行测试，发现始终只执行了一条 SQL 语句。因为在一级缓存中发现要更改的数据跟原来一样所以不做操作。

```sql
Hibernate: select student0_.stu_no as stu_no1_11_0_, student0_.name as name2_11_0_, student0_.class_no as class_no3_11_0_ from student student0_ where student0_.stu_no=?

```

```java
	/** 测试缓存 */
    @Test
    public void test() {
        Session session = HibernateUtil.getCurrentSession();
        Transaction tx = session.beginTransaction();
        Student student = session.get(Student.class, 1);
        student.setName("小红");
        Student student2 = session.get(Student.class, 1);
        log.info(String.valueOf(student == student2));
        tx.commit();
    }
```

取两次 student，发现是同一个对象，因为第二次取是从一级缓存中取得的。

**4.1.4 缓存相关的方法**

```java
session.flush();       让一级缓存与数据库同步

session.evict(arg0);    清空一级缓存中指定的对象

session.clear();       清空一级缓存中缓存的所有对象
```

**4.1.5 使用缓存相关方法**

从缓存中取一条数据，清空缓存后，再取同一条数据。

```java
 	/** 测试缓存方法 */
    @Test
    public void testCacheMethod(){
        Session session = HibernateUtil.getCurrentSession();
        Transaction tx = session.beginTransaction();
        Student student1 = session.get(Student.class, 1);
        session.clear();
        Student student2 = session.get(Student.class, 1);
        log.info(String.valueOf(student1 == student2));
        tx.commit();
    }
```

执行了两条 SQL 语句，并且两个对象并不是同一个对象。

```sql
Hibernate: select student0_.stu_no as stu_no1_11_0_, student0_.name as name2_11_0_, student0_.class_no as class_no3_11_0_ from student student0_ where student0_.stu_no=?
Hibernate: select student0_.stu_no as stu_no1_11_0_, student0_.name as name2_11_0_, student0_.class_no as class_no3_11_0_ from student student0_ where student0_.stu_no=?
```

设置对象属性后同步数据库，再设置对象属性。

```java
	@Test
    public void testCacheMethod2(){
        Session session = HibernateUtil.getCurrentSession();
        Transaction tx = session.beginTransaction();
        Student student1 = session.get(Student.class, 1);
        student1.setName("江流儿");
        session.flush();
        student1.setName("唐僧");
        tx.commit();
    }
```

执行了两条更新语句，如果不同步缓存，只会执行一次更新操作，就是最后设置的那个。

```sql
Hibernate: select student0_.stu_no as stu_no1_11_0_, student0_.name as name2_11_0_, student0_.class_no as class_no3_11_0_ from student student0_ where student0_.stu_no=?
Hibernate: update student set name=?, class_no=? where stu_no=?
Hibernate: update student set name=?, class_no=? where stu_no=?
```

### 4.2 二级缓存

**4.2.1 什么是二级缓存**

> 二级缓存是基于应用程序的缓存，所有的 Session 都可以使用
>
>- Hibernate提供的二级缓存有默认的实现，且是一种**可插配的缓存框架**！如果用户想用二级缓存，**只需要在hibernate.cfg.xml中配置即可**； 不想用，直接移除，不影响代码。
>- 如果用户觉得hibernate提供的框架框架不好用，**自己可以换其他的缓存框架或自己实现缓存框架都可以**。

二级缓存存储的是常用的类。

**4.2.2 配置二级缓存**

1. 开启二级缓存

   ```
   <!-- 开启二级缓存 -->
   <property name="hibernate.cache.use_second_level_cache">true</property>
   ```

2. 指定缓存框架

   ```
   <property name="cache.provider_class">缓存框架提供者</property>
   ```

3. 指定加入二级缓存的类

   ```
   <!-- 将这个类加入二级缓存 -->
   <class-cache class="com.xiaobu.learn_hibernate.entity.User" usage="read-write"/>
   ```

   usage 的取值：

   * read-only：只读

   * read-write：可读可写

   * nonstrict-read-write：非严格的读写
   * transactional：基于事务策略

**4.2.3 集合缓存**

如果我们在数据库查询的数据是集合,Hibernate默认是没有为集合数据设置二级缓存的,因此还是需要去读写数据库的信息。配置集合缓存：

```
<!-- 集合缓存 -->
<collection-cache collection="com.xiaobu.learn_hibernate.entity.manytoone.ClassRoom.students" usage="read-write"/>
```

**4.2.4 查询缓存**

list()和iterator()会把数据放在一级缓存，但一级缓存只在Session的作用域中有效…如果想，要跨Session来使用，就要设置查询缓存。配置：

```
<!-- 开启查询缓存 -->
<property name="hibernate.cache.use_query_cache">true</property>
```

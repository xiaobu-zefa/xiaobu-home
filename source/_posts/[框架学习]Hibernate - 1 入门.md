---
title: '[框架学习]Hibernate - 1 入门.md'
date: 2019-02-10 00:00:00
categories: 框架学习
tags: 框架学习
toc: true
---

## (一) maven依赖

```xml
<!-- Hibernate -->
<dependency>
    <groupId>org.hibernate</groupId>
    <artifactId>hibernate-core</artifactId> 
    <version>5.3.12.Final</version>
</dependency>
<!-- mysql 驱动 -->
<dependency>
    <groupId>mysql</groupId> 
    <artifactId>mysql-connector-java</artifactId> 
    <version>8.0.17</version>
</dependency>
```

## (二) 概念

> Hibernate是一个开放源代码的对象关系映射框架，它对[JDBC](https://baike.baidu.com/item/JDBC/485214)进行了非常轻量级的对象封装，它将POJO与数据库表建立映射关系，是一个全自动的orm框架，hibernate可以自动生成SQL语句，自动执行，使得Java程序员可以随心所欲的使用对象编程思维来操纵数据库。 

## (三) 使用

**3.1 构造领域模型**

User 模型

```java
/**
 * 对应数据库中的 user 表
 *
 * @author zh  --2019/10/11 15:33
 */
@Data
public class User {
    private int id;
    private Date birthday;
    private Date createTime;
    private String name;
    private int status;
    private Date updateTime;
    private int countryId;
}

```

**3.2 在类路径/mapping下面配置映射文件**

针对 User 类的配置文件 user.hbm.xml

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="User" lazy="true" table="user">
        <!-- 主键属性 -->
        <id name="id" column="id">
            <!-- 主键生成策略 ，这里是 native -->
            <generator class="native"/>
        </id>

        <!-- 非主键属性 -->
        <property name="birthday" column="birthday"/>
        <property name="countryId" column="country_id"/>
        <property name="createTime" column="create_time"/>
        <property name="name" column="name"/>
        <property name="status" column="status"/>
        <property name="updateTime" column="update_time"/>
    </class>
</hibernate-mapping>
```



**3.3 主键的自动生成策略(`<generator class="native"/>` 的取值)**
>
>- identity  自增长(mysql,db2)
>
>- sequence  自增长(序列)， oracle中自增长是以序列方法实现**
>
>- native  自增长【会根据底层数据库自增长的方式选择identity或sequence】
>
>- - 如果是mysql数据库, 采用的自增长方式是identity
>  - 如果是oracle数据库， 使用sequence序列的方式实现自增长
>
>- increment  自增长(会有并发访问的问题，一般在服务器集群环境使用会存在问题。

**3.4 在类路径下建立 hibernate.cfg.xml**

```xml
<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE hibernate-configuration PUBLIC
        "-//Hibernate/Hibernate Configuration DTD//EN"
        "http://www.hibernate.org/dtd/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
    <!-- SessionFactory -->
    <session-factory>
        <!-- 数据库连接配置 -->
        <property name="connection.url">jdbc:mysql:///test_v2?serverTimezone=Asia/Shanghai</property>
        <property name="connection.driver_class">com.mysql.cj.jdbc.Driver</property>
        <property name="connection.username">admin</property>
        <property name="connection.password">199711</property>

        <!-- 数据库方言，这里配置的是 MySQL8 ，hibernate 根据不同的方言生成不同的 sql -->
        <property name="hibernate.dialect">org.hibernate.dialect.MySQL8Dialect</property>
        <!-- 开启自动提交 -->
        <property name="hibernate.connection.autocommit">true</property>
        <!-- 自动建表，用 update 方式 -->
        <property name="hibernate.hbm2ddl.auto">update</property>
        <!-- 显示 sql 语句-->
        <property name="hibernate.show_sql">true</property>
        <!-- 格式化 sql 语句 -->
        <property name="hibernate.format_sql">true</property>

        <!-- 映射指定资源作为 mapping 文件 -->
        <mapping resource="mapping/user.hbm.xml"/>
        <!-- ......其余映射文件...... -->
    </session-factory>
</hibernate-configuration>
```

`<property name="hibernate.hbm2ddl.auto"/>` 的取值

>create：表示启动的时候先drop，再create
> 
>create-drop: 也表示创建，只不过再系统关闭前执行一下drop
> 
>update: 这个操作启动的时候会去检查schema是否一致，如果不一致会做scheme更新
> 
>validate: 启动时验证现有schema与你配置的hibernate是否一致，如果不一致就抛出异常，并不做更新

**3.5 java代码使用步骤**

1. 初始化 SessiongFacttory，这个对象一个程序中只需要一个。

2. SessionFactory.openSession() 使用 SessionFactory 获得 Session 对象，一个 Session 对象维护一个 Connection 连接。

3. Transactoin tx = Session.beginTransaction(); 开启事务，获得事务对象，hibernate的所有操作都需要事务。

4. session的基本增删改查方法

    Session.save() | Session.delete() |Session.update() | Session.find() 

5. tx.commit() 提交事务
6. session.close() 关闭会话 

使用工具类来初始化 SessionFactory，并提供获得 Session 的方法。

```java
public class HibernateUtil {
    private static SessionFactory sessionFactory;

    static {
        StandardServiceRegistry registry = new StandardServiceRegistryBuilder().configure().build();
        sessionFactory = new MetadataSources(registry).buildMetadata().buildSessionFactory();
    }

    /** 获得一个 Session */
    public static Session getSession() {
        return sessionFactory.openSession();
    }
    
    /** 获得线程Session */
    public static Session getCurrentSession(){
        return sessionFactory.getCurrentSession();
    }
}
```

**3.6 简单的增删改查**

```java
public class TestSimpleCRUD extends TestApplication {

    /*
    session.find() 与 session.load() 区别：
    1.find()在类检索级别时总是执行立即检索而且如果检索不到相关的对象的话会返回null,load()方法则会抛出一个ObjectNotException
    2.load()方法可返回一个实体代理类类型，而find()方法直接返回的是实体类对象。
    3.load()方法可以充分利用内部缓存和二级缓存，而find()方法会忽略二级缓存，若内部缓存没有查询到会到数据库中去查询。
    session.get() 与 session.load() 的区别：
    1.如果未能发现符合条件的记录，get方法返回null，而load方法会抛出一个ObjectNotFoundException。
    2.Load方法可返回实体的代理类类型，而get方法永远直接返回实体类。
    3.Load方法可以充分利用内部缓存和二级缓存中现有数据，而get方法则仅仅在内部缓存中进行数据查找，如没有发现对应数据，将越过二级缓存，直接调用SQL完成数据读取。
    */

    /**
     * 测试插入数据
     */
    @Test
    public void testSave() {
        User user = new User();
        user.setBirthday(new Date());
        user.setCountryId(102);
        user.setCreateTime(new Date());
        user.setName("刘晓彤");
        user.setStatus(0);
        user.setCreateTime(new Date());

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        session.save(user);
        tx.commit();
        session.close();
    }

    /**
     * 查询数据
     */
    @Test
    public void testFind() {
        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        User user = session.find(User.class, 1002);
        tx.commit();
        session.close();
        log.info("查询主键为 1002 的数据包装为 User 对象：" + user.toString());
    }

    /**
     * 修改数据
     */
    @Test
    public void testUpdate() {
        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        User user = session.find(User.class, 1003);
        user.setName("王二麻子");
        session.save(user);
        tx.commit();
        session.close();
    }

    /**
     * 测试删除数据
     */
    @Test
    public void testDelete() {
        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        User user = session.find(User.class, 1003);
        session.delete(user);
        tx.commit();
        session.close();
    }
}

```

**3.7 HQL,QBC,SQL**

```java
public class TestQL extends TestApplication {
    /**
     * 测试 HQL 语句
     */
    @Test
    public void testHQL() {
        Session session = HibernateUtil.getSession();
        Query query = session.createQuery("from User");
        List res = query.list();
        log.info("结果：" + res);
    }

    /**
     * HQL 语句带参数
     */
    @Test
    public void testHQLWithParameter() {
        Session session = HibernateUtil.getSession();
        Query query = session.createQuery("from User where name=?1");
        query.setParameter(1, "刘晓彤");
        List res = query.list();
        log.info("结果：" + res);
    }


    /**
     * 测试 SQL 语句
     */
    @Test
    public void testSQL() {
        Session session = HibernateUtil.getSession();
        NativeQuery query = session.createSQLQuery("select * from user where id=?");
        query.setParameter(1, "1004");
        List res = query.list();
        log.info("结果：" + res);
    }

    /**
     * 测试 QBC
     * 完全面向对象的查询
     */
    @Test
    public void testQBC() {
        Session session = HibernateUtil.getSession();
        // 已经不建议使用了，建议使用 JPA 
        Criteria criteria = session.createCriteria(User.class);
        criteria.add(Restrictions.eq("name", "刘晓彤"));
        List res = criteria.list();
        log.info("结果：" + res);
    }
}
```




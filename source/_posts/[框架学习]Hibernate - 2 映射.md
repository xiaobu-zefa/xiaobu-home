---
title: '[框架学习]Hibernate - 2 映射.md'
date: 2019-02-11 00:00:00
categories: 框架学习
tags: 框架学习
toc: true
---

## (一) 描述

现实项目一般不会只有一个表，而且多表之间还会有关系。

## (二) 集合映射

**2.1 Set 映射**

用户有多个地址，地址不能重复，用 Set 保存。

**2.2 List 映射**

用户有多个昵称，用 list 保存。

**2.3 Map 映射**

用户有很多卡片，卡片有标号和描述，通过标号能找到描述。

**2.4 设计实体类**

```java
@Data
public class User {

    private int id;

    private Date birthday;

    private Date createTime;

    private String name;

    private int status;

    private Date updateTime;

    private int countryId;

    // 一个用户有多个地址
    private Set<String> address = new HashSet<>();

    // 一个用户有多个昵称
    private List<String> nickNames = new ArrayList<>();

    // 一个用户有多个卡片，每个卡片上有一串描述
    private Map<Integer,String> card = new HashMap<>();
}
```

**2.5 思考**

1. 对于 Set 映射，我们需要在数据库中创建一个从表，名字就是 Set 集合的字段名字，叫 address，表中要有一个外键指向 user 表的主键，这样才能建立起联系。

2. 对于 List 映射，我们和 Set 集合应该想法是一样的，不过 List 集合是有顺序的，所以我们增加一个列用来描述顺序。

3. 对于 Map 映射，跟 List 不同的是，map 是键值对存储，所以我们要有一列存储键，一列存储值。

在 mapping 文件中是这样配置的：
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

        <!-- 一个用户有多个地址 -->
        <set name="address" table="address">
            <!-- 描述外键 -->
            <key column="user_id"/>
            <!-- 描述元素 -->
            <element column="address" type="java.lang.String"/>
        </set>

        <!-- 一个用户有多个昵称 -->
        <list name="nickNames" table="nick_name">
            <!-- 描述外键 -->
            <key column="user_id"/>
            <!-- 描述索引 ，注意不要跟数据库关键字重名 -->
            <index column="nick_index"/>
            <element column="nick_name" type="java.lang.String"/>
        </list>

        <!-- 一个用户有多个卡片 -->
        <map name="card" table="card">
            <!-- 描述外键 -->
            <key column="user_id"/>
            <!-- 描述键 -->
            <map-key column="card_id" type="java.lang.Integer"/>
            <!-- 描述值 -->
            <element column="card_description" type="java.lang.String"/>
        </map>
    </class>
</hibernate-mapping>
```

**2.6 测试**

```java
public class TestSetListMap extends TestApplication{
    /** 测试实体中有 Set 集合 */
    @Test
    public void testSet() {
        User user = new User();
        user.setName("set用户");
        user.setStatus(0);
        user.setCreateTime(new Date());
        user.setUpdateTime(new Date());
        user.setBirthday(new Date());
        user.setCountryId(200);
        user.getAddress().add("河南");
        user.getAddress().add("济宁");
        user.getAddress().add("临沂");

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(user);
        log.info("key = " + key);
        tx.commit();
        session.close();
    }
    /** 测试实体中有 List 集合 */
    @Test
    public void testList(){
        User user = new User();
        user.setName("list用户");
        user.setStatus(0);
        user.setCreateTime(new Date());
        user.setUpdateTime(new Date());
        user.setBirthday(new Date());
        user.setCountryId(200);

        user.getAddress().add("河北");
        user.getAddress().add("青岛");

        user.getNickNames().add("捣乱黄");
        user.getNickNames().add("捣乱红");
        user.getNickNames().add("捣乱绿");

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(user);
        log.info("key = " + key);
        tx.commit();
        session.close();
    }

    /** 测试实体中有 Map */
    @Test
    public void testMap(){
        User user = new User();
        user.setName("set用户");
        user.setStatus(0);
        user.setCreateTime(new Date());
        user.setUpdateTime(new Date());
        user.setBirthday(new Date());
        user.setCountryId(200);

        user.getAddress().add("云南");
        user.getAddress().add("四川");

        user.getNickNames().add("狗蛋");

        user.getCard().put(1001,"第一张卡片");
        user.getCard().put(1002,"第二张卡片");

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(user);
        log.info("key = " + key);
        tx.commit();
        session.close();
    }
}
```

## (三) 对象映射 - 一对多&多对一

**3.1 引入**

上面中集合只映射了一种类型的值，如果集合里面不只是一个单一的类型，而是一个对象类型，就需要用到对象的映射。

考虑两个类，学生 Student 和 教室 ClassRoom

一个 ClassRoom 中可以有许多学生，多个学生在一个教室中，并且一个学生只能在一个教室上课（垃圾学校）

**3.2 实体类**

```java
/**
 * 学生实体类，一个学生只能属于一个教室
 *
 * @author zh  --2019/10/22 11:31
 */
@Data
public class Student {
    private ClassRoom classRoom;

    private String name;

    private Integer no; // 学号
}

```

```java
/**
 * 教室实体类，一个教室有许多学生
 *
 * @author zh  --2019/10/22 11:30
 */
@Data
public class ClassRoom {
    private Set<Student> students = new HashSet<>();

    private Integer classNo;// 教室标号
}

```

**3.3 思考**

学生和教室在数据库中是两个数据表。

学生与教室在数据库中的关系是多对一，我们需要在学生这一方增加一列作为外键指向教室的主键，以此来建立联系。

**3.4 映射文件**

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
<!-- 学生映射文件 -->
<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="Student" lazy="true" table="student">
        <id column="stu_no" name="no">
            <generator class="native"/>
        </id>
        <property name="name" column="name" type="java.lang.String"/>

        <!-- 直接一个 多对一 关系-->
        <many-to-one name="classRoom" column="class_room_id" cascade="all"/>
    </class>
</hibernate-mapping>
```

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">
<!-- 教室映射文件 -->
<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="ClassRoom" lazy="true" table="class_room">
        <!-- 主键 -->
        <id name="classNo" column="class_no">
            <generator class="native"/>
        </id>
		<!-- 一个集合，有多个学生 -->
        <set name="students" table="student" cascade="all">
            <!-- 维护外键 -->
            <!-- 为什么要在这里配置外键，仔细想想，一个教室里有多个学生，学生需要教室的一个键当作外键，所以教室就名正言顺的指定自己的所有学生拿自己的教室编号当作外键 -->
            <key column="class_no"/>
            <!-- 一对多关系 -->
            <one-to-many class="Student"/>
        </set>
    </class>
</hibernate-mapping>
```

*cascade = all，表示对这个对象的所有操作都会级联操作关联对象，这样在保存新对象的时候如果没有关联对象的对象的时候就会自动创建，不然就会报错*。

**3.5 测试**

```java
public class TestOneToManyAndManyToOne extends TestApplication {
    /**
     * 测试一的一方
     */
    @Test
    public void testOneToMany() {
        Student student1 = new Student();
        student1.setName("小刘");
        Student student2 = new Student();
        student2.setName("小王");

        ClassRoom classRoom = new ClassRoom();
        classRoom.getStudents().add(student1);
        classRoom.getStudents().add(student2);

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        session.save(classRoom);
        tx.commit();
        session.close();
    }

    /** 测试多的一方 */
    @Test
    public void testManyToOne() {
        ClassRoom classRoom = new ClassRoom();

        Student student1 = new Student();
        student1.setClassRoom(classRoom);
        student1.setName("小刘");
        Student student2 = new Student();
        student2.setClassRoom(classRoom);
        student2.setName("小王");

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        session.save(student1);
        session.save(student2);
        tx.commit();
        session.close();
    }
}
```

## (四) 对象映射 - 多对多

**4.1 引入**

除了一对多&多对一关系外，还有多对多关系。

考虑一个文章类，一篇文章有多个标签，一个标签可以标注多篇文章。

**4.2 实体类**

```java
/**
 * 文章实体类，一篇文章有许多标签
 *
 * @author zh  --2019/10/22 14:24
 */
@Data
public class Article {
    private Set<Tag> tags = new HashSet<>();

    private Integer id;

    private String title;

    private String content;
}
```

```java
/**
 * 标签实体类，一个标签可在打在多个文章上
 *
 * @author zh  --2019/10/22 14:25
 */
@Data
public class Tag {
    private Set<Article> articles = new HashSet<>();

    private String name;

    private Integer id;
}
```

**4.3 思考**

文章类在数据库中需要一个数据表，标签类在数据库中需要一个数据表，二者之间是多对多的关系，无法在某一方用外键来维护关系，所以我们要借助中间表，中间表的主键是复合主键，复合了文章表和标签表的主键，而两个键又是两个外键，分别指向两个表。这个中间表不是程序的核心表，所以不需要设计实体类。

文章类包含一个标签的集合，标签类包含一个文章的集合，我们要在配置文件中展示的东西有：

* 集合属性

* 集合的类型

* 中间表

* 中间表的两个外键

**4.4 映射文件**

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="Article" lazy="true" table="article">
        <id name="id">
            <generator class="native"/>
        </id>
        <property name="title" type="java.lang.String"/>
        <property name="content" type="java.lang.String"/>

        <set name="tags" table="article_tag" cascade="all">
            <!-- 当前表在中间表中的外键 -->
            <key column="article_id"/>
            <!-- column 表示关联类在中间表中的外键 -->
            <many-to-many column="tag_id" class="Tag"/>
        </set>

    </class>
</hibernate-mapping>
```

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="Tag" lazy="true" table="tag">
        <id name="id">
            <generator class="native"/>
        </id>

        <property name="name"/>

        <set name="articles" table="article_tag" cascade="save-update">
            <key column="tag_id"/>
            <many-to-many column="article_id" class="Article"/>
        </set>

    </class>
</hibernate-mapping>
```

cascade = "save-update" 表示此数据表保存或更新数据的时候级联操作关联表。

**4.5 测试**

```java
/**
 * 测试多对多
 *
 * @author zh  --2019/10/22 14:31
 */
public class TestManyToMany extends TestApplication {
    @Test
    public void test() {
        Tag tag1 = new Tag();
        Tag tag2 = new Tag();
        tag1.setName("冒险");
        tag2.setName("搞笑");

        Article article = new Article();
        article.setTitle("鲁滨逊漂流记");
        article.setContent("鲁滨逊在漂流");
        article.getTags().add(tag1);
        article.getTags().add(tag2);

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(article);
        log.info("key == " + key);
        tx.commit();
        session.close();
    }

    @Test
    public void test_v2() {
        Article article1 = new Article();
        Article article2 = new Article();
        article1.setTitle("鲁滨逊漂流记");
        article1.setContent("鲁滨逊在漂流");
        article2.setTitle("呐喊");
        article2.setContent("鲁迅在呐喊");

        Tag tag = new Tag();
        tag.setName("搞笑");
        tag.getArticles().add(article1);
        tag.getArticles().add(article2);

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(tag);
        log.info("key == " + key);
        tx.commit();
        session.close();
    }
}

```

## (五) 文件映射 - 一对一

**5.1 引入**

除了上面两个外，还有一对一，使用场景不多，但会用到。

考虑一个消费者类，消费者有一个消费密码，一个消费密码只属于一个消费者，由于密码重要性，将其单独保存。

**5.2 实体类**

```java
/**
 * 消费者实体类
 *
 * @author zh  --2019/10/22 15:06
 */
@Data
public class Customer {
    // 每个消费者有唯一一个支付密码
    private PayPassword payPassword;

    private Integer id;

    private String name;
}
```

```java
/**
 * 支付密码，支付密码比较重要，所以单独保存
 *
 * @author zh  --2019/10/22 15:07
 */
@Data
public class PayPassword {
    // 对应一个消费者
    private Customer customer;

    private Integer id;

    private String password;
}
```

**5.3 思考**

消费者在数据库中对应一张表，支付密码在数据库对应一张表，两者之间是一对一关系，可以用两种方式来描述这种关系：

1. 在支付密码表中添加一个外键列，指向消费者的主键列。
2. 支付密码的主键列指向消费者的主键列，也就是说，支付密码的主键同时是外键。

**5.4 映射文件**

两种方式的 Customer 映射文件相同

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="Customer" lazy="true" table="customer">
        <id column="id" name="id">
            <generator class="native"/>
        </id>
        <property name="name" type="java.lang.String"/>

        <one-to-one name="payPassword" class="PayPassword" cascade="save-update"/>
    </class>
</hibernate-mapping>
```

第一种方式的 PayPassword 映射文件

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="PayPassword" lazy="true" table="pay_password">
        <id column="id" name="id">
            <generator class="native"/>
        </id>

        <property name="password"/>

        <!-- 这里是多对一，多对一才能配置外键 -->
        <many-to-one name="customer" column="customer_id" unique="true" class="Customer" cascade="save-update"/>
    </class>
</hibernate-mapping>
```

第二种方式的 PayPassword 映射文件

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="PayPassword" lazy="true" table="pay_password">
        <!-- 主键生成的时候，指定其即是主键，又是外键，外键类型为 customer -->
        <id column="id" name="id">
            <generator class="foreign">
                <param name="property">customer</param>
            </generator>
        </id>

        <property name="password"/>
		
        <one-to-one name="customer"  class="Customer" cascade="save-update"/>
    </class>
</hibernate-mapping>
```

**5.5 测试**

```java
/**
 * 测试一对一
 *
 * @author zh  --2019/10/22 15:11
 */
public class TestOneToOne extends TestApplication{
    /** 保存 customer 的时候同时更新 pay_password */
    @Test
    public void test(){
        PayPassword payPassword = new PayPassword();
        payPassword.setPassword("123456789");

        Customer customer1 = new Customer();
        Customer customer2 = new Customer();
        customer1.setName("王笑笑");
        customer1.setPayPassword(payPassword);
        customer2.setName("刘飒飒");
        customer2.setPayPassword(payPassword);

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(customer1);
        log.info("key == " + key);
        key = session.save(customer2);
        log.info("key == " + key);
        tx.commit();
        session.close();
    }

    /** 保存 pay_password 的同时保存 customer */
    @Test
    public void test_v2(){
        Customer customer = new Customer();
        customer.setName("张小侯");

        PayPassword payPassword = new PayPassword();
        payPassword.setPassword("123321");
        payPassword.setCustomer(customer);

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(payPassword);
        log.info("key == " + key);
        tx.commit();
        session.close();
    }
}

```


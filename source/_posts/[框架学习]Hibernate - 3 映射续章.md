---
title: '[框架学习]Hibernate - 3 映射续章'
date: 2019-02-12 00:00:00
categories: 框架学习
tags: 框架学习
excerpt: 'Hibernate是一个开放源代码的对象关系映射框架，它对[JDBC](https://baike.baidu.com/item/JDBC/485214)进行了非常轻量级的对象封装，它将POJO与数据库表建立映射关系，是一个全自动的orm框架，hibernate可以自动生成SQL语句，自动执行，使得Java程序员可以随心所欲的使用对象编程思维来操纵数据库...'
---

## (一) 描述

JAVA 中的类之间的关系有两种：

* 组合

* 继承

这两种关系，在 hibernate 同样可以映射。

## (二) 组合关系

**2.1 引入**

考虑一个房间类 Class ，房间里面有窗户 Window，窗户有大小，数量，据此设计两个实体类。

**2.2 实体类**

```java
/**
 * 房间类，房间里有窗户，是组合关系
 *
 * @author zh  --2019/10/22 15:57
 */
@Data
public class Room {
    private Integer id;

    private String name;

    private Window window;
}
```

```java
/**
 * 窗户类
 *
 * @author zh  --2019/10/22 15:58
 */
@Data
public class Window {
    private Integer count;

    private Integer size;
}

```

**2.3 思考**

我们有两个实体类，但是我们在数据库中只需要一个数据表，这个数据表包括两个实体类的所有属性。通过配置映射文件中的 component 节点实现。

**2.4 映射文件**

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity">
    <class name="Room" lazy="true" table="room">
        <id column="id" name="id">
            <generator class="native"/>
        </id>
        <property name="name"/>

        <!-- 组合属性，window -->
        <component name="window" class="Window">
            <property name="count"/>
            <property name="size"/>
        </component>

    </class>
</hibernate-mapping>
```

只需要配置此一个映射文件，就能完成映射。

**2.5 测试**

```java
/**
 * 测试组件映射
 *
 * @author zh  --2019/10/22 16:01
 */
public class TestComponent extends TestApplication{
    /** 保存教室 */
    @Test
    public void test(){
        Window window = new Window();
        window.setCount(6);
        window.setSize(100);

        Room room = new Room();
        room.setName("网络工程三班教室");
        room.setWindow(window);

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(room);
        log.info("key == " + key);
        tx.commit();
        session.close();
    }
}

```

## (三) 继承关系

考虑一个父类 Animal，子类有 Cat，Dog 。。。

### 3.1 子类直接复写父类属性

子类可以直接复写子类属性，非常简单，不过如果子类多的话会书写复杂。

**3.1.1 实体类**

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * 父类 - 动物
 *
 * @author zh  --2019/10/22 17:24
 */

@Data
public class Animal {
    private Integer id;

    private String name;
}

```

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * @author zh  --2019/10/22 17:34
 */
@Data
public class Cat extends Animal{
    private String eatFish;
}

```

**3.1.2 配置映射**

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<!-- 就像配置普通实体类一样 -->
<hibernate-mapping package="com.xiaobu.learn_hibernate.entity.extend">
    <class name="Animal" lazy="true" table="animal" abstract="true">
        <id name="id">
            <generator class="uuid"/>
        </id>

        <property name="name"/>
        <property name="eatFish"/>
    </class>
</hibernate-mapping>
```

**3.1.3 测试**

```java
	/**
     * 测试简单继承,直接写父类的属性
     */
    @Test
    public void testSimple() {
        Dog dog = new Dog();
        dog.setEatBone("吃骨头");
        dog.setName("哈士奇");

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(dog);
        log.info("key == " + key);
        tx.commit();
        session.close();
    }
```

### 3.2 子类和父类映射到一个数据表

子类可以和父类映射到一个数据表，数据表包括子类和父类所有的属性，并额外增加一个列用来区分不同的子类。这并不符合数据库设计规范，并且只适合子类较少的情况。

**3.2.1 实体类**

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * 父类 - 动物
 *
 * @author zh  --2019/10/22 17:24
 */

@Data
public class Animal {
    private Integer id;

    private String name;
}

```

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * @author zh  --2019/10/22 17:34
 */
@Data
public class Cat extends Animal{
    private String eatFish;
}

```

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * @author zh  --2019/10/22 17:25
 */
@Data
public class Dog extends Animal {
    // 吃骨头
    private String eatBone;
}

```

**3.2.2 映射文件**

在 xml 映射文件中，需要使用一个 鉴别器 。

用 subclass 节点配置每个子类，并指定鉴别器字段的值。

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<!-- 使用鉴别器 discriminator 和 subclass 配置到一个数据库 -->
<hibernate-mapping package="com.xiaobu.learn_hibernate.entity.extend">
    <class name="Animal" lazy="true" table="animal">
        <id name="id">
            <generator class="native"/>
        </id>

        <!-- 鉴别器,用来鉴别不同的字段 -->
        <discriminator column="type_"/>

        <property name="name"/>

        <!-- 指定鉴别器字段为 cat_ -->
        <subclass name="Cat" discriminator-value="cat_">
            <property name="eatFish"/>
        </subclass>

        <subclass name="Dog" discriminator-value="dog_">
            <property name="eatBone"/>
        </subclass>
    </class>
</hibernate-mapping>
```

**3.2.3 测试**

```java
	@Test
    public void testDis(){
        Dog dog = new Dog();
        dog.setName("亚马逊");
        dog.setEatBone("吃骨头");

        Cat cat = new Cat();
        cat.setName("加菲");
        cat.setEatFish("吃猫粮");

        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        Serializable key = session.save(dog);
        log.info("key == " + key);
        key = session.save(cat);
        log.info("key == " + key);
        tx.commit();
        session.close();
    }
```

### 3.3 子类和父类分别映射一个数据表

子类和父类都可以映射到一个数据表，这时候，子类存在一个外键指向父类的主键。

**3.3.1 实体类**

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * 父类 - 动物
 *
 * @author zh  --2019/10/22 17:24
 */

@Data
public class Animal {
    private Integer id;

    private String name;
}

```

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * @author zh  --2019/10/22 17:34
 */
@Data
public class Cat extends Animal{
    private String eatFish;
}

```

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * @author zh  --2019/10/22 17:25
 */
@Data
public class Dog extends Animal {
    // 吃骨头
    private String eatBone;
}

```

**3.3.2 映射文件**

使用 joined-subclass 节点，将子类和父类担单独映射

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<!-- 使用 joined-subclass 将父类和子类分别单独映射为单独的表 -->
<hibernate-mapping package="com.xiaobu.learn_hibernate.entity.extend">
    <class name="Animal" lazy="true" table="animal">
        <id name="id">
            <generator class="native"/>
        </id>

        <property name="name"/>

        <joined-subclass name="Cat">
            <!-- 指定外键列 -->
            <key column="id"/>
            <property name="eatFish"/>
        </joined-subclass>

        <joined-subclass name="Dog">
            <key column="id"/>
            <property name="eatBone"/>
        </joined-subclass>
    </class>
</hibernate-mapping>
```

**3.3.3 测试**

同上

这种方式会增加 SQL 语句的执行条数。

### 3.4 只将子类映射到数据表，父类不做映射

**3.4.1 实体类**

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * 父类 - 动物
 *
 * @author zh  --2019/10/22 17:24
 */

@Data
public class Animal {
    private String id;

    private String name;
}

```

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * @author zh  --2019/10/22 17:34
 */
@Data
public class Cat extends Animal{
    private String eatFish;
}

```

```java
package com.xiaobu.learn_hibernate.entity.extend;

import lombok.Data;

/**
 * @author zh  --2019/10/22 17:25
 */
@Data
public class Dog extends Animal {
    // 吃骨头
    private String eatBone;
}

```

**3.4.2 映射文件**

将父类设置成 abstract。

使用 union-subclass 配置子类。

注意：使用了 union-subclass 节点不能配置自增长主键，可以使用 UUID 代替。

```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
        "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
        "http://www.hibernate.org/dtd/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="com.xiaobu.learn_hibernate.entity.extend">
    <class name="Animal" lazy="true" table="animal" abstract="true">
        <id name="id">
            <generator class="uuid"/>
        </id>

        <property name="name"/>

        <union-subclass name="Cat">
            <property name="eatFish"/>
        </union-subclass>

        <union-subclass name="Dog">
            <property name="eatBone"/>
        </union-subclass>
    </class>
</hibernate-mapping>
```

**3.4.3 测试**

同上

推荐用这种方式。

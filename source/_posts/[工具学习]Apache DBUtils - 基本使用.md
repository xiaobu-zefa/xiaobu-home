---
title: '[工具学习]Apache DBUtils - 基本使用'
categories: 工具学习
tags: 工具学习
excerpt: DBUtils简化了JDBC的开发步骤，使得我们可以用更少量的代码实现连接数据库的功能...
abbrlink: 830a77cb
date: 2018-03-10 00:00:00
---

## 一、maven依赖

```xml
<!-- DBUtils -->
<dependency>
	<groupId>commons-dbutils</groupId>
    <artifactId>commons-dbutils</artifactId>
    <version>1.7</version>
</dependency>
 <!-- mysql 驱动 -->
<dependency>
	<groupId>mysql</groupId>
	<artifactId>mysql-connector-java</artifactId>
    <version>8.0.16</version>
</dependency>
<!-- 数据库连接池 DBCP -->
<dependency>
	<groupId>org.apache.commons</groupId>
    <artifactId>commons-dbcp2</artifactId>
    <version>2.7.0</version>
</dependency>
```

## 二、概述

DBUtils是Java编程中的数据库操作实用工具，小巧简单实用。

DBUtils封装了对JDBC的操作，简化了JDBC操作，可以少写代码。

并不是一个ORM框架。

## 三、核心类

**QueryRunner 类**

提供对sql语句操作的API。

是一个线程安全的类，可以复用这一个对象。

可以在构造的时候传入一个数据源，以后操作SQL语句的时候就不需要传入连接。

**ResultSetHandler 接口**

用于定义select操作后，怎样封装结果集。

已经内置了一些常用的 handler，也可以自己定义自己的 handler。

**DBUtils 类**

一个工具类，定义了关闭资源与事务处理的方法。

## 四、使用

**使用 queryRunner 增删改**

```java
public class TestQueryRunner extends TestApplication {
    /**
     * 测试插入数据
     */
    @Test
    public void testInsert() throws SQLException {
        String sql = "insert into user value(?,?,?,?,?,?,?)";
        int res = queryRunner.update(sql, new Object[]{1001, new Date(), new Date(), "阿三", 1, new Date(), 1002});
        log.info("受影响的行数： " + res);
    }

    /**
     * 测试修改数据
     */
    @Test
    public void testUpdate() throws SQLException {
        String sql = "update user set name=? where id=5";
        int res = queryRunner.update(sql, "刘翔");
        log.info("受影响的行数： " + res);
    }

    /**
     * 测试删除数据
     */
    @Test
    public void testDelete() throws SQLException {
        String sql = "delete from user where name=?";
        int res = queryRunner.update(sql, "阿三");
        log.info("受影响的行数： " + res);
    }
}
```

**使用 queyRunner 查询并使用 resultSetHandler 处理查询结果**

使用到了 javaBean 的概念：

> JavaBean 是一种JAVA语言写成的可重用组件。为写成JavaBean，类必须是具体的和公共的，并且具有无参数的[构造器](https://baike.baidu.com/item/构造器/9844976)。JavaBean 通过提供符合一致性设计模式的公共方法将内部域暴露成员属性，set和get方法获取。众所周知，属性名称符合这种模式，其他Java 类可以通过自省机制(反射机制)发现和操作这些JavaBean 的属性。

```java
public class TestResultHandler extends TestApplication {
    /* 测试查询 */

    /**
     * 结果封装为 bean 的 List 集合
     */
    @Test
    public void testSelectByBeanListHandler() throws SQLException {
        String sql = "select * from user";
        List<User> res = queryRunner.query(sql, new BeanListHandler<User>(User.class));
        res.forEach(val -> log.info(val.toString()));
    }

    /**
     * 查询的第一条数据封装成bean
     */
    @Test
    public void testSelectByBeanHandler() throws SQLException {
        String sql = "select * from user";
        User res = queryRunner.query(sql, new BeanHandler<>(User.class));
        log.info(res.toString());
    }

    /**
     * 将查询的第一行数据封装成数组，每个元素代表一个列
     */
    @Test
    public void testSelectByArrayHandler() throws SQLException {
        String sql = "select * from user";
        Object[] res = queryRunner.query(sql, new ArrayHandler());
        for (Object val : res) {
            log.info(val.toString());
        }
    }

    /**
     * 将查询的数据封装成数组 List
     */
    @Test
    public void testSelectByArrayListHandler() throws SQLException {
        String sql = "select * from user";
        List<Object[]> res = queryRunner.query(sql, new ArrayListHandler());
        for (Object[] val : res) {
            String str = "";
            for (Object obj : val) {
                str += obj + "\t";
            }
            log.info(str);
        }
    }

    /**
     * 将查询的数据封装成 Map，键 默认为数据库主键的字段，值为封装的 Bean，可以传入自己的 RowProcess 实现
     */
    @Test
    public void testSelectByBeanMapHandler() throws SQLException {
        String sql = "select * from user";
        Map<String, User> res = queryRunner.query(sql, new BeanMapHandler<String, User>(User.class));
        log.info(res.toString());
    }

    /**
     * 将查询的某一列数据封装册到 List 当中
     */
    @Test
    public void testSelectByColumnListHandler() throws SQLException {
        String sql = "select * from user";
        List<String> res = queryRunner.query(sql, new ColumnListHandler<String>(2));
        System.out.println(res);
    }

    /**
     * 将查询的结果封装成一个 Map，Map 的 key 每行数据的主键列的值，value 又是一个 Map，保存着每行数据的 列与值的映射
     */
    @Test
    public void testSelectByKeyedHandler() throws SQLException {
        String sql = "select * from user";
        Map<String, Map<String, Object>> res = queryRunner.query(sql, new KeyedHandler<String>());
        log.info(res.toString());
    }

    /**
     * 将查询的第一行结果封装成 Map
     */
    @Test
    public void testSelectByMapHandler() throws SQLException {
        String sql = "select * from user";
        Map<String, Object> res = queryRunner.query(sql, new MapHandler());
        log.info(res.toString());
    }

    /**
     * 将查询的第一行结果封装成 List,list 内的元素是每一行数据的 map
     */
    @Test
    public void testSelectByMapListHandler() throws SQLException {
        String sql = "select * from user";
        List<Map<String, Object>> res = queryRunner.query(sql, new MapListHandler());
        log.info(res.toString());
    }

    /**
     * 查询指定列的数据
     */
    @Test
    public void testSelectByScalarHandler() throws SQLException {
        String sql = "select * from user";
        Object res = queryRunner.query(sql, new ScalarHandler<>(4));
        log.info(res.toString());
    }
}
```

**使用 Dbutils**

```java
public class TestDBUtils extends TestApplication {
    @Test
    public void test() {
        /*
            DbUtils.close(resultSet);
            DbUtils.close(statement);
            DbUtils.close(connection);
            DbUtils.commitAndClose(connection);
            DbUtils.rollback(connection);
            DbUtils.rollbackAndClose(connection);
        */
    }
}
```




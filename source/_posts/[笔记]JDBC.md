---
title: '[笔记]JDBC'
date: 2018-02-10 02:34:17
excerpt: 'JDBC使用过程中产生的笔记...'
tags: 笔记
categories: 笔记
---

## (一) maven依赖

mysql为例：

```xml
<dependency>
	<groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
	<version>8.0.16</version>
</dependency>
```

## (二) 介绍

> JDBC（Java DataBase Connectivity,java数据库连接）是一种用于执行SQL语句的Java API，可以为多种关系数据库提供统一访问，它由一组用Java语言编写的类和接口组成。JDBC提供了一种基准，据此可以构建更高级的工具和接口，使数据库开发人员能够编写数据库应用程序

java 已经提供了接口，只需要引入数据库提供商提供的驱动包，就可以使用这组API进行数据库开发。

## (三) 使用

**3.1 使用过程**

1. 注册数据库驱动
2. 使用驱动管理器获取数据库连接  
3. 在数据库连接上进行事务管理
4. 通过数据库连接创建执行语句
5. 执行语句执行并返回结果
6. 关闭连接

**3.2 JDBC工具类**

封装了数据库常用操作

````java
public class DBUtil {
    private static Logger log = Logger.getLogger(DBUtil.class.getName());

    private static final String DRIVER;
    private static final String URL;
    private static final String USERNAME;
    private static final String PASSWORD;

    /* 注册数据库 */
    static {
        PropertiesUtil util = PropertiesUtil.getUtil("jdbc-config.properties");
        DRIVER = util.getProperty("jdbc.driver");
        URL = util.getProperty("jdbc.url");
        USERNAME = util.getProperty("jdbc.username");
        PASSWORD = util.getProperty("jdbc.password");
        try {
            Class.forName(DRIVER);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            throw new RuntimeException("注册数据库驱动失败 > " + DRIVER);
        }
    }

    /* 获取数据库连接 */
    public static Connection getConnection(){
        try {
            return DriverManager.getConnection(URL, USERNAME, PASSWORD);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("获取数据库连接失败");
        }
    }

    /* 关闭数据库连接 */
    public static void closeConnection(Connection connection){
        try {
            connection.close();
        } catch (SQLException e) {
            e.printStackTrace();
            log.severe("关闭数据库连接失败 > " + connection);
        }
    }

    /* 开启事务 */
    public static void startTransaction(Connection connection){
        try {
            connection.setAutoCommit(false);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("开启事务失败");
        }
    }

    /* 关闭事务 */
    public static void endTransaction(Connection connection){
        try {
            connection.setAutoCommit(true);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("关闭事务失败");
        }
    }

    /* 设置保存点 */
    public static Savepoint setSavepoint(Connection connection, String id){
        try {
            return connection.setSavepoint(id);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("设置保存点失败");
        }
    }

    /* 回滚事务 */
    public static void rollback(Connection connection){
        try {
            connection.rollback();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("回滚事务失败");
        }
    }

    /* 回滚事务到保存点 */
    public static void rollbackToSavepoint(Connection connection,Savepoint savepoint){
        try {
            connection.rollback(savepoint);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("回滚事务失败");
        }
    }

    /* 提交事务 */
    public static void commit(Connection connection){
        try {
            connection.commit();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("提交事务失败");
        }
    }
}
````

**3.3 增删改查**

```java
public class TestCRUD extends TestApplication {
    // 插入数据
    @Test
    public void insert() {
        String sql = "insert into user(`birthday`,`update_time`,`create_time`,`name`,`status`,`country_id`) values(?,?,?,?,?,?)";
        User user = new User(2, new Date(), new Date(), "or 1=1", 1, new Date(), 1002);
        Connection conn = DBUtil.getConnection();
        try {
            PreparedStatement pst = conn.prepareStatement(sql);
            pst.setDate(1, new java.sql.Date(user.getBirthday().getTime()));
            pst.setDate(2, new java.sql.Date(user.getUpdateTime().getTime()));
            pst.setDate(3, new java.sql.Date(user.getCreateTime().getTime()));
            pst.setString(4, user.getName());
            pst.setInt(5, user.getStatus());
            pst.setInt(6, user.getCountryId());
            log.info("执行的SQL： " + pst.toString());
            int res = pst.executeUpdate();
            log.info("受影响的行数： " + res);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("创建 预执行语句 异常");
        } finally {
            DBUtil.closeConnection(conn);
        }
    }

    // 修改数据
    @Test
    public void update() {
        String sql = "update user set name=? where id=1";
        Connection conn = DBUtil.getConnection();
        try {
            PreparedStatement pst = conn.prepareStatement(sql);
            pst.setString(1, "老男孩");
            log.info("执行的SQL： " + pst.toString());
            int res = pst.executeUpdate();
            log.info("受影响的行数： " + res);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("创建 预执行语句 异常");
        } finally {
            DBUtil.closeConnection(conn);
        }
    }

    // 删除数据
    @Test
    public void delete() {
        String sql = "delete from user where name=?";
        Connection conn = DBUtil.getConnection();
        try {
            PreparedStatement pst = conn.prepareStatement(sql);
            pst.setString(1, "老男孩");
            log.info("执行的SQL： " + pst.toString());
            int res = pst.executeUpdate();
            log.info("受影响的行数： " + res);
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("创建 预执行语句 异常");
        } finally {
            DBUtil.closeConnection(conn);
        }
    }

    // 查询数据
    @Test
    public void select() {
        String sql = "select * from user";
        Connection conn = DBUtil.getConnection();
        try {
            PreparedStatement pst = conn.prepareStatement(sql);
            ResultSet resultSet = pst.executeQuery();
            log.info("执行的SQL： " + pst.toString());
            while (resultSet.next()) {
                log.info("第" + resultSet.getRow() + "行数据: " + resultSet.getObject(1).toString() + " \t" + resultSet.getObject(2).toString() + " \t" + resultSet.getObject(3).toString() + " \t" + resultSet.getObject(4).toString() + " \t" + resultSet.getObject(5).toString() + " \t" + resultSet.getObject(6).toString() + " \t" + resultSet.getObject(7).toString() + " \t");
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("创建 预执行语句 异常");
        } finally {
            DBUtil.closeConnection(conn);
        }
    }

    // 插入的时候返回主键
    // 创建 conn.prepareStatement(sql,1) 的时候，第二个参数指定主键所在的列索引，因为这只能获取自己生成的键
    // 或者 conn.prepareStatement(sql,new String[]{"id"} 的时候，第二个参数是一个数组，数组里面放可以自己生成键的列名);
    // 获取自己生成的键
    // statement 执行完毕后，调用 pst.getGeneratedKeys(); 方法可以返回一个 ResultSet，从这里面取值
    @Test
    public void insertReturnKey(){
        String sql = "insert into user(`birthday`,`update_time`,`create_time`,`name`,`status`,`country_id`) values(?,?,?,?,?,?)";
        User user = new User(2, new Date(), new Date(), "or 1=1", 1, new Date(), 1002);
        Connection conn = DBUtil.getConnection();
        try {
            PreparedStatement pst = conn.prepareStatement(sql,1);
            pst.setDate(1, new java.sql.Date(user.getBirthday().getTime()));
            pst.setDate(2, new java.sql.Date(user.getUpdateTime().getTime()));
            pst.setDate(3, new java.sql.Date(user.getCreateTime().getTime()));
            pst.setString(4, user.getName());
            pst.setInt(5, user.getStatus());
            pst.setInt(6, user.getCountryId());
            log.info("执行的SQL： " + pst.toString());
            int res = pst.executeUpdate();
            log.info("受影响的行数： " + res);
            if(res > 0){
                ResultSet resultSet = pst.getGeneratedKeys();
                while (resultSet.next()) {
                    log.info("第" + resultSet.getRow() + "行数据: " + resultSet.getObject(1));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("创建 预执行语句 异常");
        } finally {
            DBUtil.closeConnection(conn);
        }
    }

    // JDBC 查询的三大参数
    // conn.createStatement(resultSetType, resultSetConcurrency, resultSetHoldability)
    // 解释： https://www.cnblogs.com/daxin/p/3389438.html

}

```

**3.4 事务操作**

*注意：事务操作只能在 Innodb 的表引擎中生效，在不支持事务的表引擎中不会报错，但没有用，坑点*

```java
public class TestTransaction extends TestApplication {
    // 事务操作只能在 Innodb 的表引擎中生效，在不支持事务的表引擎中不会报错，但没有用，坑点
    @Test
    public void transaction() {
        String sql = "insert into user(`birthday`,`update_time`,`create_time`,`name`,`status`,`country_id`) values(?,?,?,?,?,?)";
        Connection conn = DBUtil.getConnection();
        User user = new User(2, new Date(), new Date(), "or 1=1", 1, new Date(), 1002);
        try {
            // 开启事务
            DBUtil.startTransaction(conn);
            PreparedStatement pst = conn.prepareStatement(sql);
            PreparedStatement pst2 = conn.prepareStatement(sql);
            pst.setDate(1, new java.sql.Date(user.getBirthday().getTime()));
            pst.setDate(2, new java.sql.Date(user.getUpdateTime().getTime()));
            pst.setDate(3, new java.sql.Date(user.getCreateTime().getTime()));
            pst.setString(4, user.getName());
            pst.setInt(5, user.getStatus());
            pst.setInt(6, user.getCountryId());
            pst.executeUpdate();
            // 让 pst2 出异常
            pst2.setDate(1, null);
            pst2.setInt(6, Integer.MAX_VALUE);
            pst2.executeUpdate();
            // 提交事务
            DBUtil.commit(conn);
        } catch (Exception e) {
            e.printStackTrace();
            log.warning("执行事务操作出现异常");
            // 回滚事务
            DBUtil.rollback(conn);
        } finally {
            // 关闭事务
            DBUtil.endTransaction(conn);
            DBUtil.closeConnection(conn);
        }
    }
}
```

## (四) 数据源与数据库连接池

>**数据源**是指数据的来源，比如数据库。由SUN公司制定的获取数据库连接的规范接口。用来代替 DriverManager.getConnection() 的方式。
>
>`DataSource `与  `DriverManager  `获取连接的不同：
>`DriverManager` 是由SUN实现的，它只供了最基本的获取连接的方式。
>而 `DataSource` 是一个接口，不光SUN可以实现，很多第三方的中间件也可以实现，而且实现得很好。 
>
>**DataSource 一般有如下三种实现方式：**
>**标准实现** -- 提供最基本的连接，也就是DriverManager的方式
>**连接池的实现** -- 提供了连接池，是一种可以缓存及管理多个数据库连接的“容器”。
>**分布事务的实现** -- 提供了连接池，而且这个池中的连接是支持分布式事务的(Distribute Transaction)。
>
>**连接池**是指这样一个“池子”，池子中的每个东西都是连接数据源的一个“连接”，这样别人想连接数据源的时候可以从这 个“池子”里取，用完以后再放回来供以后其他想使用的人使用。

**4.1 使用DBCP的连接池实现**

```java
/**
 * 使用了 DBCP 连接池
 *
 * @author zh  --2019/10/14 19:53
 */
public class DBCPUtil {
    private static DataSource dataSource;

    static {
        PropertiesUtil util = PropertiesUtil.getUtil("jdbc-config.properties");
        try {
            dataSource = BasicDataSourceFactory.createDataSource(util.getProperties());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("创建 DataSource 失败");
        }
    }

    public static DataSource getDataSource(){
        return dataSource;
    }

    public static Connection getConnection(){
        try {
            return dataSource.getConnection();
        } catch (SQLException e) {
            e.printStackTrace();
            throw new RuntimeException("获取 Connection 失败");
        }
    }
}
```

使用数据库连接池获取的连接调用 .close() 方法关闭的时候会将连接返回到池中，不会真的物理上关闭，而且在 DBCP 的实现中，如果不手动关闭连接，其也会在 1s 内没有使用的时候自动关闭。

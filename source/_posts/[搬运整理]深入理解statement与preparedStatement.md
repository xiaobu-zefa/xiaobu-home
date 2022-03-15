---
title: '[搬运整理]深入理解statement与preparedStatement'
date: 2022-03-15 14:10:00
excerpt: '大家平时都使用过JDBC中的PreparedStatement接口，它有预编译功能。什么是预编译功能呢？它有什么好处呢？...'
tags: 搬运整理
categories: 搬运整理
---

## (一) 前言

以前就只知道PreparedStatement是“预编译类”，能够对sql语句进行预编译，预编译后能够提高数据库sql语句执行效率。

预编译？？是谁对sql语句的预编译？？是数据库？还是PreparedStatement对象？？到底什么是预编译？？为什么能够提高效率？？为什么在数据库操作时能够防止sql注入攻击？？

## (二) 什么是预编译

**2.1 预编译介绍**

其实预编译是MySQL数据库本身都支持的。但是MySQL Server 4.1之前的版本是不支持预编译的。（具体是否包括4.1还得读者们亲自试验）

预编译的好处：当客户发送一条SQL语句给服务器后，服务器总是需要校验SQL语句的语法格式是否正确，然后把SQL语句编译成可执行的函数，最后才是执行SQL语句。其中校验语法，和编译所花的时间可能比执行SQL语句花的时间还要多。

注意：可执行函数存储在MySQL服务器中，并且当前连接断开后，MySQL服务器会清除已经存储的可执行函数。

如果我们需要执行多次insert语句，但只是每次插入的值不同，MySQL服务器也是需要每次都去校验SQL语句的语法格式，以及编译，这就浪费了太多的时间。如果使用预编译功能，那么只对SQL语句进行一次语法校验和编译，所以效率要高。

**2.2 使用预编译**

1. 执行预编译语句，例如：

```sql
prepare showUsersByLikeName from 'select * from user where username like ?';
```

2. 设置变量，例如：

```sql
set @username='%小明%';
```

3. 执行语句，例如：

```sql
execute showUsersByLikeName using @username;
```

如果需要再次执行 showUsersByLikeName ，那么就不再需要第一步，即不需要再编译语句了：

1. 设置变量，例如：

```sql
set @username='%小宋%';
```

2. 执行语句，例如：

```sql
execute showUsersByLikeName using @username;
```

## (三) 使用PreparedStatement执行sql查询

**3.1 使用preparedStatement**
JDBC MySQL驱动5.0.5以后的版本默认PreparedStatement是关闭预编译功能的，所以需要我们手动开启。而之前的JDBC MySQL驱动版本默认是开启预编译功能的。

MySQL数据库服务器的预编译功能在4.1之后才支持预编译功能的。如果数据库服务器不支持预编译功能时，并且使用PreparedStatement开启预编译功能是会抛出异常的。这点非常重要。

在我们以前写项目的时候，貌似都没有注意是否开启PreparedStatement的预编译功能，以为它一直都是在使用的，现在看看不开启PreparedStatement的预编译，查看MySQL的日志输出到底是怎么样的。

```java
@Test
public void showUser(){
    //数据库连接
    Connection connection = null;
    //预编译的Statement，使用预编译的Statement提高数据库性能
    PreparedStatement preparedStatement = null;
    //结果 集
    ResultSet resultSet = null;

    try {
        //加载数据库驱动
        Class.forName("com.mysql.jdbc.Driver");

        //通过驱动管理类获取数据库链接
        connection =  DriverManager.getConnection("jdbc:mysql://localhost:3306/mybatis", "root", "");
        //定义sql语句 ?表示占位符
        String sql = "select * from user where username = ?";
        //获取预处理statement
        preparedStatement = connection.prepareStatement(sql);

        //设置参数，第一个参数为sql语句中参数的序号（从1开始），第二个参数为设置的参数值
        preparedStatement.setString(1, "王五");
        //向数据库发出sql执行查询，查询出结果集
        resultSet =  preparedStatement.executeQuery();

        preparedStatement.setString(1, "张三");
        resultSet =  preparedStatement.executeQuery();
        //遍历查询结果集
        while(resultSet.next()){
            System.out.println(resultSet.getString("id")+"  "+resultSet.getString("username"));
        }
        resultSet.close();
        preparedStatement.close();

        System.out.println("#############################");

    } catch (Exception e) {
        e.printStackTrace();
    }finally{
        //释放资源
        if(resultSet!=null){
            try {
                resultSet.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(preparedStatement!=null){
            try {
                preparedStatement.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(connection!=null){
            try {
                connection.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }
}
```

这是输出日志:

```
20 Query /* mysql-connector-java-5.1.13 ( Revision: ${bzr.revision-id} ) */SELECT @@session.auto_increment_increment
20 Query SHOW COLLATION
20 Query SET NAMES utf8mb4
20 Query SET character_set_results = NULL
20 Query SET autocommit=1
20 Query select * from user where username = '王五'
20 Query select * from user where username = '张三'
20 Quit
```

可以看到，在日志中并没有看到"prepare"命令来预编译`select * from user where username = ?`这个sql模板。所以我们一般用的PreparedStatement并没有用到预编译功能的，只是用到了防止sql注入攻击的功能。防止sql注入攻击的实现是在PreparedStatement中实现的，和服务器无关。在源码中，PreparedStatement对敏感字符已经转义过了。

**3.2 在PreparedStatement中开启预编译功能**

设置MySQL连接URL参数：useServerPrepStmts=true，如下所示。

```
jdbc:mysql://localhost:3306/mybatis?&useServerPrepStmts=true
```

这样才能保证mysql驱动会先把SQL语句发送给服务器进行预编译，然后在执行executeQuery()时只是把参数发送给服务器。

再次执行上面的程序看下MySQL日志输出：

```
21 Query SHOW WARNINGS
21 Query /* mysql-connector-java-5.1.13 ( Revision: ${bzr.revision-id} ) */SELECT @@session.auto_increment_increment
21 Query SHOW COLLATION
21 Query SET NAMES utf8mb4
21 Query SET character_set_results = NULL
21 Query SET autocommit=1
21 Prepare   select * from user where username = ?
21 Execute   select * from user where username = '王五'
21 Execute   select * from user where username = '张三'
21 Close stmt    
21 Quit
```

很明显已经进行了预编译，`Prepare select * from user where username = ?`，这一句就是对sql语句模板进行预编译的日志。好的非常Nice。

*注意：我们设置的是MySQL连接参数，目的是告诉MySQL JDBC的PreparedStatement使用预编译功能（5.0.5之后的JDBC驱动版本需要手动开启，而之前的默认是开启的），不管我们是否使用预编译功能，MySQL Server4.1版本以后都是支持预编译功能的。*

**3.3 多个PreparedStatement缓存问题(cachePrepStmts参数)**

当使用不同的PreparedStatement对象来执行相同的SQL语句时，还是会出现编译两次的现象，这是因为驱动没有缓存编译后的函数key，导致二次编译。如果希望缓存编译后函数的key，那么就要设置cachePrepStmts参数为true。例如：

```
jdbc:mysql://localhost:3306/mybatis?useServerPrepStmts=true&cachePrepStmts=true
```

测试代码:

```java
@Test
public void showUser(){
    //数据库连接
    Connection connection = null;
    //预编译的Statement，使用预编译的Statement提高数据库性能
    PreparedStatement preparedStatement = null;
    //结果 集
    ResultSet resultSet = null;

    try {
        //加载数据库驱动
        Class.forName("com.mysql.jdbc.Driver");

        //通过驱动管理类获取数据库链接
        connection =  DriverManager.getConnection("jdbc:mysql://localhost:3306/mybatis?&useServerPrepStmts=true&cachePrepStmts=true", "root", "");

        preparedStatement=connection.prepareStatement("select * from user where username like ?");
        preparedStatement.setString(1, "%小明%");
        resultSet =  preparedStatement.executeQuery();
        //遍历查询结果集
        while(resultSet.next()){
            System.out.println(resultSet.getString("id")+"  "+resultSet.getString("username"));
        }
        //注意这里必须要关闭当前PreparedStatement对象流，否则下次再次创建PreparedStatement对象的时候还是会再次预编译sql模板，使用PreparedStatement对象后不关闭当前PreparedStatement对象流是不会缓存预编译后的函数key的
        resultSet.close();
        preparedStatement.close();

        preparedStatement=connection.prepareStatement("select * from user where username like ?");
        preparedStatement.setString(1, "%三%");
        resultSet =  preparedStatement.executeQuery();
        //遍历查询结果集
        while(resultSet.next()){
            System.out.println(resultSet.getString("id")+"  "+resultSet.getString("username"));
        }

        resultSet.close();
        preparedStatement.close();

    } catch (Exception e) {
        e.printStackTrace();
    }finally{
        //释放资源
        if(resultSet!=null){
            try {
                resultSet.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(preparedStatement!=null){
            try {
                preparedStatement.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(connection!=null){
            try {
                connection.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }
}
```

日志输出:

```
24 Query SHOW WARNINGS
24 Query /* mysql-connector-java-5.1.13 ( Revision: ${bzr.revision-id} ) */SELECT @@session.auto_increment_increment
24 Query SHOW COLLATION
24 Query SET NAMES utf8mb4
24 Query SET character_set_results = NULL
24 Query SET autocommit=1
24 Prepare   select * from user where username like ?
24 Execute   select * from user where username like '%小明%'
24 Execute   select * from user where username like '%三%'
24 Quit
```

*注意：每次使用PreparedStatement对象后都要关闭该PreparedStatement对象流，否则预编译后的函数key是不会缓存的。*

## (四) Statement执行sql语句是否会对编译后的函数进行缓存

对于每个数据库的具体实现都是不一样的，对于预编译肯定都大体相同，但是对于Statement和普通sql，数据库一般都是先检查sql语句是否正确，然后编译sql语句成为函数，最后执行函数。其实也不乏某些数据库很疯狂，对于普通sql的函数进行缓存。但是目前的主流数据库都不会对sql函数进行缓存的。因为sql语句变化那么多，如果对所有函数缓存，那么对于内存的消耗也是非常巨大的。

如果你不确定普通sql语句的函数是否被存储，那要怎么做呢？？

查看MySQL日志记录：检查第二次执行相同sql语句时，是否是直接通过execute来进行查询的。

```java
@Test
public void showUser(){
    //数据库连接
    Connection connection = null;
    //预编译的Statement，使用预编译的Statement提高数据库性能
    PreparedStatement preparedStatement = null;
    //结果 集
    ResultSet resultSet = null;

    try {
        //加载数据库驱动
        Class.forName("com.mysql.jdbc.Driver");

        //通过驱动管理类获取数据库链接
        connection =  DriverManager.getConnection("jdbc:mysql://localhost:3306/mybatis?&useServerPrepStmts=true&cachePrepStmts=true", "root", "");

        Statement statement=connection.createStatement();


        resultSet =  statement.executeQuery("select * from user where username='小天'");
        //遍历查询结果集
        while(resultSet.next()){
            System.out.println(resultSet.getString("id")+"  "+resultSet.getString("username"));
        }

        resultSet.close();
        statement.close();

        statement=connection.createStatement();

        resultSet =  statement.executeQuery("select * from user where username='小天'");
        //遍历查询结果集
        while(resultSet.next()){
            System.out.println(resultSet.getString("id")+"  "+resultSet.getString("username"));
        }

        resultSet.close();
        statement.close();
    } catch (Exception e) {
        e.printStackTrace();
    }finally{
        //释放资源
        if(resultSet!=null){
            try {
                resultSet.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(preparedStatement!=null){
            try {
                preparedStatement.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
        if(connection!=null){
            try {
                connection.close();
            } catch (SQLException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }

    }
}
```

输出日志:

```
26 Query SHOW WARNINGS
26 Query /* mysql-connector-java-5.1.13 ( Revision: ${bzr.revision-id} ) */SELECT @@session.auto_increment_increment
26 Query SHOW COLLATION
26 Query SET NAMES utf8mb4
26 Query SET character_set_results = NULL
26 Query SET autocommit=1
26 Query select * from user where username='小天'
26 Query select * from user where username='小天'
26 Quit
```

看日志就会知道，都是Query命令，所以并没有存储函数。

## (五) 总结

PreparedStatement的预编译是数据库进行的，编译后的函数key是缓存在PreparedStatement中的，编译后的函数是缓存在数据库服务器中的。预编译前有检查sql语句语法是否正确的操作。只有数据库服务器支持预编译功能时，JDBC驱动才能够使用数据库的预编译功能，否则会报错。预编译在比较新的JDBC驱动版本中默认是关闭的，需要配置连接参数才能够打开。

在已经配置好了数据库连接参数的情况下，Statement对于MySQL数据库是不会对编译后的函数进行缓存的，数据库不会缓存函数，Statement也不会缓存函数的key，所以多次执行相同的一条sql语句的时候，还是会先检查sql语句语法是否正确，然后编译sql语句成函数，最后执行函数。

对于PreparedStatement在设置参数的时候会对参数进行转义处理。
因为PreparedStatement已经对sql模板进行了编译，并且存储了函数，所以PreparedStatement做的就是把参数进行转义后直接传入参数到数据库，然后让函数执行。这就是为什么PreparedStatement能够防止sql注入攻击的原因了。

PreparedStatement的预编译还有注意的问题，在数据库端存储的函数和在PreparedStatement中存储的key值，都是建立在数据库连接的基础上的，如果当前数据库连接断开了，数据库端的函数会清空，建立在连接上的PreparedStatement里面的函数key也会被清空，各个连接之间的预编译都是互相独立的。

使用Statement执行预编译
使用Statement执行预编译就是把上面的原始SQL语句预编译执行一次。

```java
Connection con = JdbcUtils.getConnection();
Statement stmt = con.createStatement();
stmt.executeUpdate("prepare myfun from 'select * from t_book where bid=?'");
stmt.executeUpdate("set @str='b1'");
ResultSet rs = stmt.executeQuery("execute myfun using @str");

while(rs.next()) {
    System.out.print(rs.getString(1) + ", ");
    System.out.print(rs.getString(2) + ", ");
    System.out.print(rs.getString(3) + ", ");
    System.out.println(rs.getString(4));
}

stmt.executeUpdate("set @str='b2'");
rs = stmt.executeQuery("execute myfun using @str");

while(rs.next()) {
    System.out.print(rs.getString(1) + ", ");
    System.out.print(rs.getString(2) + ", ");
    System.out.print(rs.getString(3) + ", ");
    System.out.println(rs.getString(4));
}

rs.close();
stmt.close();
con.close();
```

## (六) 额外-在持久层框架中存在的问题

很多主流持久层框架(MyBatis，Hibernate)其实都没有真正的用上预编译，预编译是要我们自己在参数列表上面配置的，如果我们不手动开启，JDBC驱动程序5.0.5以后版本 默认预编译都是关闭的。

所以我们要在参数列表中配置，例如：
```
jdbc:mysql://localhost:3306/mybatis?&useServerPrepStmts=true&cachePrepStmts=true
```

*注意：
在MySQL中，既要开启预编译也要开启缓存。因为如果只是开启预编译的话效率还没有不开启预编译效率高，大家可以做一下性能测试，而在MySQL中开启预编译和开启缓存，其中的查询效率和不开启预编译和不开启缓存的效率是持平的。*
---
title: '[框架学习]Hibernate - 4 维护与级联.md'
date: 2019-02-14 00:00:00
categories: 框架学习
tags: 框架学习
toc: true
---

## (一) 描述

Inverse 属性和 Cascade 属性是在维护关联关系中起作用的。

Inverse 属性只能在关联关系“一”的一方配置，可以取值 true 和 false，默认为 false

- true  ：表示放弃维护权
- false ：表示拥有维护权

Cascade 属性可以在任意一方配置，表示操作一方数据时对另一方的影响，可以取多个值，默认为 none

* none          	 ：不级联操作

- save-update  ：级联保存或更新
- delete             ：级联删除
- save-update,delete  ：  级联保存、更新、删除
- all                    ：同上，级联保存、更新、删除

## (二) Cascade 属性

### 2.1 级联保存

>如果在保存对象的时候，**没有把相关的对象也一并保存进数据库，会出现错误**。
>
>因为它会发现**dept是有外键的，而外键又是一个对象来保存着，这个对象在数据库表中并没有存在，因此会抛出异常**。
>
>如果我们在dept中设置了级联保存，那么Hibernate就会知道：**保存dept的数据时，发现dept了外键，也把dept外键的对象保存在数据库之中。**

### 2.2 级联删除

>这个对于我们来说风险太大了，**如果删除了某些数据，会把另外有关联的数据也删除**，在实际中我们一般不使用！

设置了级联删除，在删除数据的时候，会将关联的数据全部删除。

没设置级联删除，在删除数据的时候，只会将关联的数据外键置为 NULL。

## 2.3 Inverse 属性

使用 classRoom 和 student 对此属性进行测试，只配置 inverse 属性，不配置 cascade 属性。

**2.3.1 映射文件**

```xml
<!-- 截取 ClassRoom 映射文件的一部分 -->
<set name="students" table="student">
    <key column="class_no"/>
	<one-to-many class="com.xiaobu.learn_hibernate.entity.manytoone.Student"/>
</set>
```

### 2.4 保存数据

**2.4.1 测试**

```java
	// 测试代码，只保存 classRoom
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
```

**2.4.2 分析四种情况**

第一种：

```xml
<set name="students" table="student" inverse="true">
```

只在 class_room 表中插入了数据。因为没有给 classRoom 设置级联，也没有维护关系。只执行了一条 SQL 语句：

```sql
Hibernate: insert  into class_room values()
```

第二种：

```xml
<set name="students" table="student" inverse="false">
```

在插入 classRoom 数据的时候会报错，因为这个时候 classRoom 维护关系，所以在插入 classRoom 数据的时候要更新自己级联的数据的外键，也就是要更新 student1 和 student 2 的外键，但是数据库学生表中没有相应的数据，所以会报一个 瞬时对象 异常。这个时候执行了两条 SQL 语句：

````sql
Hibernate: insert into class_room values( )
Hibernate: update student set class_no=? where stu_no=?
````

第三种：

```xml
<set name="students" table="student" inverse="false" cascade="save-update">
```

在插入 classRoom 数据的时候会发现没有自己维护的数据，然后会先把自己维护的数据插入，然后更新自己维护的数据的外键。这个时候执行的 SQL 语句：

```sql
Hibernate: insert into class_room values ( )
Hibernate: insert into student (name, class_no) values (?, ?)
Hibernate: insert into student (name, class_no) values (?, ?)
Hibernate: update student set class_no=? where stu_no=?
Hibernate: update student set class_no=? where stu_no=?
```

第四种：

```xml
<set name="students" table="student" inverse="true" cascade="save-update">
```

由于设置了级联，所以在插入 classRoom 数据的时候同时插入了 student ，又因为 classRoom 不维护外键，所以没有更新 student 的外键。这个时候执行的 SQL 语句：

```sql
Hibernate: insert into class_room values ( )
Hibernate: insert into student (name, class_no) values (?, ?)
Hibernate: insert into student (name, class_no) values (?, ?)
```

### 2.5 获取数据

不管将 inverse 的属性设置为什么，也不管设没设置 cascade 属性，对获取数据都没有影响。这些时候执行的 SQL 语句：

```sql
Hibernate: select classroom0_.class_no as class_no1_0_0_ from class_room classroom0_ where classroom0_.class_no=?
Hibernate: select students0_.class_no as class_no3_1_0_, students0_.stu_no as stu_no1_1_0_, students0_.stu_no as stu_no1_1_1_, students0_.name as name2_1_1_, students0_.class_no as class_no3_1_1_ from student students0_ where students0_.class_no=?
```

其实就是将 classRoom 和 classRoom 关联的数据同时查出来。

### 2.6 解除关联关系

**2.6.1 测试**

```java
	/** 测试解除关联关系 */
    @Test
    public void testClear(){
        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        ClassRoom classRoom = session.get(ClassRoom.class, 2);
        classRoom.getStudents().clear();
        tx.commit();
        session.close();
    }
```

**2.6.2 分析两种情况**

第一种：

```xml
<set name="students" table="student" inverse="true">
```

classRoom 没有维护外键的权限，解除关联关系需要将关联数据的外键置为 NULL ，所以解除不了。这时候执行的 SQL 语句：

```sql
Hibernate: select classroom0_.class_no as class_no1_0_0_ from class_room classroom0_ where classroom0_.class_no=?
```

只执行了查询。

第二种：

```xml
<set name="students" table="student" inverse="false">
```

classRoom 维护了外键关系，所以可以将关联数据的外键置为 NULL。这时候执行的 SQL 语句：

```sql
Hibernate: select classroom0_.class_no as class_no1_0_0_ from class_room classroom0_ where classroom0_.class_no=?
Hibernate: select students0_.class_no as class_no3_1_0_, students0_.stu_no as stu_no1_1_0_, students0_.stu_no as stu_no1_1_1_, students0_.name as name2_1_1_, students0_.class_no as class_no3_1_1_ from student students0_ where students0_.class_no=?
Hibernate: update student set class_no=null where class_no=?
```

可以看到，将外键为 class_no 的 student 数据置为了NULL。 

### 2.7 删除数据测

**2.7.1 测试**

```java
	/** 测试删除数据 */
    @Test
    public void testDelete(){
        Session session = HibernateUtil.getSession();
        Transaction tx = session.beginTransaction();
        ClassRoom classRoom = session.get(ClassRoom.class, 1);
        session.delete(classRoom);
        tx.commit();
        session.close();
    }
```

**2.7.2 分析两种情况**

第一种：

```xml
<set name="students" table="student" inverse="true">
```

classRoom 没有维护外键的权限，因为这个数据有关联的外键存在，所以删除失败。此时执行的 SQL：

```sql
Hibernate: select classroom0_.class_no as class_no1_0_0_ from class_room classroom0_ where classroom0_.class_no=?
Hibernate: delete from class_room where class_no=?
```

语句没有问题，但是会异常：

```java
Cannot delete or update a parent row: a foreign key constraint fails 
```

第二种：

```xml
<set name="students" table="student" inverse="false">
```

classRoom 维护了外键关系，所以可以先将外键置为NULL，再删除数据。这时候执行的 SQL 语句：

```sql
Hibernate: select classroom0_.class_no as class_no1_0_0_ from class_room classroom0_ where classroom0_.class_no=?
Hibernate: update student set class_no=null where class_no=?
Hibernate: delete from class_room where class_no=?
```

可以看到，跟我们想的一样，先将外键置为 NULL，再删除。

### 2.8 注意

>**inverse的优先级是比cascade的优先级要高的，因此设置了inverse属性为true，那么cascade就无效了。**

## (三) 总结

>**inverse属性只能在“一”的一方中设置**。inverse=false表示有控制权，inverse=ture表示没有控制权
>
>- 在保存关联信息时
>
>- - 有控制权--->可以保存相对应的关联数据
>  - 没有控制权--->数据会保存，但是关联关系没有维护，也就是外键列为NULL
>
>- 在查询数据时
>
>- - 有无控制权对查询数据没有任何影响
>
>- 在解除关联关系时
>
>- - 有控制权--->可以解除关联关系
>  - 没有控制权--->不能解除关联关系，不会生成update语句，也不会报错
>
>- 在删除数据时对关联关系的影响
>
>- - 有控制权--->将外键的值设置为NULL，随后删除数据
>  - 没有控制权--->如果删除的记录有被外键引用，会报错，违反主外键引用约束，如果删除的记录没有被引用，可以直接删除。
>
>**多对多关系的时候也是一样的，只不过多对多的关联关系是在中间表中**
>
>### cascade属性
>
>cascade有这么几个值：
>
>- none          不级联操作， 默认值
>- save-update     级联保存或更新
>- delete          级联删除
>- save-update,delete    级联保存、更新、删除
>- all                 同上。级联保存、更新、删除
>
>我们可能使用到的往往是：save-update这个值，因为级联删除的风险太大了！
>
>- 级联保存
>
>- - 没有设置级联保存-->如果单单保存一个对象，而对象又存在外键时，那么就会抛出异常
>  - 设置了级联保存-->那么就可以将对象以及有关联关系的对象一并保存
>
>- 级联删除
>
>- - 没有设置级联删除-->在删除数据的时候，会把外键的字段设置为NULL，再删除当前一方的记录
>  - 设置了级联删除-->把对象有关联关系的记录都删除了
>
>如果cascade和inverse同时设置时：
>
>- inverse属性优先级是要比cascade要高的，如果inverse属性设置了true，那么cascade就无效了!

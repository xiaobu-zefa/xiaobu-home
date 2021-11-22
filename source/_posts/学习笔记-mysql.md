---
title: 学习笔记-mysql
catalog: true
date: 2021-01-05 02:34:17
subtitle: MySQL 的学习笔记
header-img: /img/header_img/lml_bg.jpg
tags:
- 学习笔记
categories:
- 学习笔记
---

## 一、安装与部署

### 1.1 Centos 安装 Mysql
```
yum install mysql
sudo rpm -Uvh http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm
yum install mysql-server
service mysqld start
lsof -i:3306     **查看3306端口是否开启
chkconfig --add mysqld     **设置开机自启
mysqladmin -u root password 密码    **设置root密码
```

## 二、用户操作

### 2.1 创建用户允许远程登陆
```
CREATE USER  'username'@'host'   IDENTIFIED BY  'password';
```

### 2.2 授予用户所有权限 （数据库.数据表）
```
GRANT ALL ON  *.*  TO   'username'@'host'   
```

### 2.3 修改用户密码
```
SET PASSWORD FOR 'username'@'host' = PASSWORD('newpassword');
```

### 2.4 删除用户
```
DROP USER 'username'@'host';
```

### 2.5 刷新权限
```
FLUSH PRIVILEGES;
```

### 2.6 查看某个用户所有权限
```
SHOW GRANTS for root@'%'
```

## 三、时间类型的比较

单纯的比大小可以直接用 > = < ,要得出具体相差的时间是多少，则需要分别计算日期与时间差，最后换算为相应时间单位后相加得到最终结果。

```sql
select current_timestamp() > '2020-1-1';
```
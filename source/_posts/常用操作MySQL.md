---
title: 常用操作-MySQL
catalog: true
date: 2021-01-05 02:34:17
subtitle: MySQL 的常用操作
header-img: /img/header_img/lml_bg.jpg
tags:
- notes
categories:
- notes
---

**Centos 安装 Mysql**
```
yum install mysql
sudo rpm -Uvh http://dev.mysql.com/get/mysql-community-release-el7-5.noarch.rpm
yum install mysql-server
service mysqld start
lsof -i:3306     **查看3306端口是否开启
chkconfig --add mysqld     **设置开机自启
mysqladmin -u root password 密码    **设置root密码
```

**创建用户允许远程登陆**
```
CREATE USER  'username'@'host'   IDENTIFIED BY  'password';
```

**授予用户所有权限 （数据库.数据表）**
```
GRANT ALL ON  *.*  TO   'username'@'host'   
```

**修改用户密码**
```
SET PASSWORD FOR 'username'@'host' = PASSWORD('newpassword');
```

**删除用户**
```
DROP USER 'username'@'host';
```

**刷新权限**
```
FLUSH PRIVILEGES;
```

**查看某个用户所有权限**
```
SHOW GRANTS for root@'%'
```

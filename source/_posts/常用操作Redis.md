---
title: 常用操作Redis
date: 2020-12-31 14:32:52
tags: notes
---

**如果要安装最新的redis，需要安装Remi的软件源，官网地址：http://rpms.famillecollet.com/**
```
yum install -y http://rpms.famillecollet.com/enterprise/remi-release-7.rpm
```

**然后可以使用下面的命令安装最新版本的redis**
```
yum --enablerepo=remi install redis
```

**安装完毕后，即可使用下面的命令启动redis服务**
```
service redis start 或者 systemctl start redis
```

**redis安装完毕后，我们来查看下redis安装时创建的相关文件**
```
rpm -qa |grep redis
```
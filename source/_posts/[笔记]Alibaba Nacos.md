---
title: '[笔记]Alibaba Nacos'
date: 2022-02-14 17:00:00
excerpt: 'Alibaba Nacos使用过程中产生的笔记...'
tags: 笔记
categories: 笔记
---

## 一、Docker部署单实例Nacos(MySQL存储)

### 1.1 拉取Docker最新镜像

```shell
$ docker pull nacos/nacos-server
```

### 1.2 创建要挂载的目录
```shell
$ sudo mkdir -p /docker/mount/nacos/conf
$ sudo mkdir -p /docker/mount/nacos/logs
```

### 1.3 编写自定义配置文件
```properties
$ cd /docker/mount/nacos/conf
$ sudo vim application.properties
```
配置文件内容：(修改数据库地址，用户名，密码)
```
server.contextPath=/nacos
server.servlet.contextPath=/nacos
server.port=8848

spring.datasource.platform=mysql

db.num=1
db.url.0=jdbc:mysql://xxxx.xxxx.xxxx.xxxx:60032/nacos_dev?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user=xxxx
db.password=xxxx


nacos.cmdb.dumpTaskInterval=3600
nacos.cmdb.eventTaskInterval=10
nacos.cmdb.labelTaskInterval=300
nacos.cmdb.loadDataAtStart=false

management.metrics.export.elastic.enabled=false

management.metrics.export.influx.enabled=false


server.tomcat.accesslog.enabled=true
server.tomcat.accesslog.pattern=%h %l %u %t "%r" %s %b %D %{User-Agent}i


nacos.security.ignore.urls=/,/**/*.css,/**/*.js,/**/*.html,/**/*.map,/**/*.svg,/**/*.png,/**/*.ico,/console-fe/public/**,/v1/auth/login,/v1/console/health/**,/v1/cs/**,/v1/ns/**,/v1/cmdb/**,/actuator/**,/v1/console/server/**
nacos.naming.distro.taskDispatchThreadCount=1
nacos.naming.distro.taskDispatchPeriod=200
nacos.naming.distro.batchSyncKeyCount=1000
nacos.naming.distro.initDataRatio=0.9
nacos.naming.distro.syncRetryDelay=5000
nacos.naming.data.warmup=true
nacos.naming.expireInstance=true
```

### 1.4 启动Docker容器
```shell
docker run --name nacos -d -p 8848:8848 -p 9848:9848 --privileged=true --restart=always -e JVM_XMS=256m -e JVM_XMX=256m -e MODE=standalone -e PREFER_HOST_MODE=hostname -v /docker/mount/nacos/logs:/home/nacos/logs -v /docker/mount/nacos/conf/application.properties:/home/nacos/conf/application.properties nacos/nacos-server
```
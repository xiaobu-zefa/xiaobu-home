---
title: '[笔记]Apache Maven'
excerpt: Maven使用过程中产生的笔记...
tags: 笔记
categories: 笔记
abbrlink: 2ba028cd
date: 2021-01-04 02:34:17
---

**1. 安装Jar文件到本地仓库**
```
mvn install:install-file 
-DgroupId=com.alipay 
-DartifactId=sdk-Java 
-Dversion=20170725114550 
-Dpackaging=jar 
-Dfile=alipay-sdk-java20170725114550.jar
```

**2. 删除下载失败的缓存文件**
```
for /r %i in (*.lastUpdated) do del %i
```

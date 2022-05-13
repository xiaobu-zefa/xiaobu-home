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

**3. relativePath 作用**

查找父模块时，默认顺序：relativePath > 本地仓库 > 远程仓库
没有 relativePath 标签等同 …/pom.xml, 即默认从当前 pom 文件的上一级目录找
一个空 <relativePath/> 表示直接从本地仓库 > 远程仓库获取

![图 3](https://store.xiaobu.site/1.png)  


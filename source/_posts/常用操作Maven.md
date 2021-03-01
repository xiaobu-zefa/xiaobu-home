---
title: 学习笔记-Maven
catalog: true
date: 2021-01-04 02:34:17
subtitle: Maven 的学习笔记
header-img: /img/header_img/lml_bg.jpg
tags:
- 学习笔记
categories:
- 学习笔记
---

**本地Jar包做成Maven依赖**
```
mvn install:install-file -DgroupId=com.alipay -DartifactId=sdk-Java -Dversion=20170725114550 -Dpackaging=jar -Dfile=alipay-sdk-java20170725114550.jar
```

**删除下载失败的文件**
```
for /r %i in (*.lastUpdated) do del %i
```
---
title: 常用操作Maven
date: 2020-12-31 14:28:24
tags:
---
**本地Jar包做成Maven依赖**
```
mvn install:install-file -DgroupId=com.alipay -DartifactId=sdk-Java -Dversion=20170725114550 -Dpackaging=jar -Dfile=alipay-sdk-java20170725114550.jar
```

**删除下载失败的文件**
```
for /r %i in (*.lastUpdated) do del %i
```
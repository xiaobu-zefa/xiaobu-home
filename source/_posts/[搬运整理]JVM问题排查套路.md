---
title: '[笔记]JVM问题排查套路'
date: 2022-03-03 11:17:00
excerpt: '出现OOM问题后,我们如何排查问题的出现点呢? 在这篇博客中我只是简单的说下如何排查问题的...'
tags: 搬运整理
categories: 搬运整理
---

## (一) 找到出现问题的进程ID

**1.1 `top -c`**

使用`top -c`会列出当前的进程列表：

![top -c](https://store.xiaobu.site/store-blog/article-info/top-c.jpg)

如果你的应用出现问题,cpu占用很高,内存占用也很高的话，,你的进程就会排在很前面
在图中列表的第一列就是进程的id

**1.2 `ps -ef | grep java`**

![ps -ef | grep oms](https://store.xiaobu.site/store-blog/article-info/ps-efgrepjava.jpg)

在列出来的信息中,第二列代表的就是相关的进程id.

## (二) 查看GC情况

使用命令 `jstat -gc 20316`,查看进程GC情况:

![jstat -gc 20316](https://store.xiaobu.site/store-blog/article-info/jstat-gc.jpg)

参数说明:
|参数|说明|
|---|---|
|S0C|第一个幸存区的大小|
|S1C|第二个幸存区的大小|
|S0U|第一个幸存区的使用大小|
|S1U|第二个幸存区的使用大小|
|EC|伊甸园区的大小|
|EU|伊甸园区的使用大小|
|OC|老年代大小|
|OU|老年代使用大小|
|MC|方法区大小|
|MU|方法区使用大小|
|CCSC|压缩类空间大小|
|CCSU|压缩类空间使用大小|
|YGC|年轻代垃圾回收次数|
|YGCT|年轻代垃圾回收消耗时间|
|FGC|老年代垃圾回收次数|
|FGCT|老年代垃圾回收消耗时间|
|GCT|垃圾回收消耗总时间|

一般出现OOM的情况， 应用会频繁的进行GC活动的， 这里也可以看下GC的次数和时间也大概能知道是不是出现问题了

# (三) Jstack 查看栈信息

如果你的应用cpu占用100%导致变卡顿了， 但是堆栈并没有溢出， 此时你可以通过这个命令让控制台打印栈日志， 查看线程的情况。 通过这个jstack 就能排查出来99%死循环和死锁的等待线程方面的问题。

如果项目中出现CPU百分百的情况， 你需要的是找出这个线程， 使用`top -Hp 1 -c`命令会列出进程1下的所有线程：

![线程信息](https://store.xiaobu.site/store-blog/article-info/%E7%BA%BF%E7%A8%8B%E4%BF%A1%E6%81%AF.jpg)

注意此时图中的PID表示的是线程id， 我们需要把线程id转换成16进制的格式， 图中第一个线程的id是20396， 将其转换成16进制后变成 0x4fac

这个时候我们使用`stack -l 20316 | grep 0x4fac`查看下这个线程的栈信息:
![线程堆栈](https://store.xiaobu.site/store-blog/article-info/%E7%BA%BF%E7%A8%8B%E5%A0%86%E6%A0%88.jpg)

可以看到这是一个kafka的生产者线程,正在运行中

# (四) dump出jvm的堆栈文件

`jmap -dump:format=b,file=dump.hprof 20316`命令把堆栈文件dump下来， 这个命令中 20316 就是你的进程id。 dump就是你的自定义的堆栈文件的名称， 后缀是hprof
![dump堆栈](https://store.xiaobu.site/store-blog/article-info/dump.jpg)

使用mat打开堆栈信息:
![mat](https://store.xiaobu.site/store-blog/article-info/mat.jpg)

仔细看看它给你列举出来的可能的问题， 找找有没有你业务代码中的问题
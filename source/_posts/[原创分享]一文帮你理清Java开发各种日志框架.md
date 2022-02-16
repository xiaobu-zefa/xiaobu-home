---
title: '[原创分享]一文帮你理清Java开发各种日志框架'
date: 2022-02-10 14:20:11
categories: 原创分享
tags: 原创分享
excerpt: ''
---

> 日志：记录程序的运行轨迹，方便查找关键信息，也方便快速定位解决问题。

# 一、 JDK自带日志系统

## 1.1 System.out.println

作用是将信息输出到控制台。

`System` 是 `java.lang` 里面的一个类，而 `out` 就是` System` 里面的一个静态数据成员，而且这个成员是 `java.io.PrintStream` 类的引用，`println()` 就是` java.io.PrintStream` 类里的一个方法，它的作用是向控制台输出信息。
`
System` 类在静态初始化时会由虚拟机为 `out` 赋值。

这个不应该算在日志系统内，不过架不住用的人多，所以第一个说明。

## 1.2 Java.Util.Logging

从1.4.2开始，Java 通过 `Java.util.logging` 包为应用程序提供了记录消息的可能，在 API 中的核心类为 Logger 类。理解在记录消息中的日志的不同级别是非常重要的。Java 为此定时了8个级别，它们是分别 SEVERE, WARNING, INFO, CONFIG, FINE, FINER, FINEST 以及 ALL. 它们按照优先级降序排列，在应用运行的任何时间点，日志级别可以被更改。
通常来说，当为 Logger 指定了一个 Level, 该 Logger 会包含当前指定级别以及更高级别的日志。举例而言，如果 Level 被设置成了 WARNING, 所有的 warning 消息以及 SERVER 消息会被记录。应用可以用下列方法记录日志：`Logger.warning()`, `Logger.info()`, `Logger.config()` ...

在一般的 Web 开发中，这种方式不常使用。


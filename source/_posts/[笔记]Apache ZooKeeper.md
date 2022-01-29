---
title: '[笔记]Apache ZooKeeper'
date: 2022-01-01 00:00:00
toc: true
tags:
- 笔记
categories:
- 笔记
---

## (一) 基本命令

**1.1 增删改查**

```
create [-s] [-e] path data acl

delete path [version]

set path data [version]

get path [watch]
```

**1.2 列出**

```
ls path

ls2 path
```

**1.3 获取节点状态**

```
stat path [watch]
```

## (二) 节点特性

**2.1 同一级节点 key 名称是唯一的**

```
$ ls /
$ create /runoob 2
```

**2.2 创建节点时，必须要带上全路径**

```
$ ls /runoob
$ create /runoob/child 0
$ create /runoob/child/ch01 0
```

**2.3 session 关闭，临时节点清除**

```
$ ls /runoob
$ create -e /runoob/echild 0
```

**2.4 自动创建顺序节点**

```
$ create -s -e /runoob 0
```

**2.5 watch 机制，监听节点变化**

事件监听机制类似于观察者模式，watch 流程是客户端向服务端某个节点路径上注册一个 watcher，同时客户端也会存储特定的 watcher，当节点数据或子节点发生变化时，服务端通知客户端，客户端进行回调处理。特别注意：监听事件被单次触发后，事件就失效了。

**2.6 delete 命令只能一层一层删除(新版本可以使用deleteall递归删除)**

```
$ ls /
$ delete /runoob
```

## (三) 经典应用场景

1. 数据发布/订阅
2. 负载均衡
3. 分布式协调/通知
4. 集群管理
5. 集群管理
6. master 管理
7. 分布式锁
8. 分布式队列

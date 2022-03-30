---
title: '[笔记]Redis'
excerpt: Redis使用过程中产生的笔记...
tags: 笔记
categories: 笔记
abbrlink: 3c97aee1
date: 2022-02-15 10:17:56
---

## 一、Docker部署单机Redis

### 1.1 拉取Redis最新镜像

```shell
$ docker pull redis
```

### 1.2 建立挂载目录
```shell
$ sudo mkdir -p /docker/mount/redis/conf
```

### 1.3 下载官方配置文件并修改
```shell
$ cd /docker/mount/redis/conf
$ wget https://raw.githubusercontent.com/redis/redis/6.2/redis.conf
$ vim redis.conf
```
要修改的文件内容：
```properties
## 注释掉这一行（默认本机才能访问）
# bind 127.0.0.1 

## 关闭保护模式（默认限制为本地访问）
protected-mode no

## 关闭以守护进程方式启动（Docker容器启动必须有一个前台进程，开启这个容器会启动失败，非Docker启动需要开启）
daemonize no

## 设置认证密码
requirepass xxxxxx
```

### 1.4 启动容器
```shell
$ docker run -v /docker/mount/redis/conf/redis.conf:/usr/local/etc/redis/redis.conf -v /docker/mount/redis/data/:/data --name redis -p 6379:6379 -d redis redis-server /usr/local/etc/redis/redis.conf
```

### 1.5 使用命令连接Redis服务
```shell
$ docker run -it --rm --network=host redis redis-cli
```

## 二、持久化配置

### 2.1 RDB持久化

默认情况下，是快照RDB的持久化方式，将内存中的数据以快照的方式写入二进制文件中，默认的文件名是dump.rdb

```
# 900秒内，如果超过1个key被修改，则发起快照保存
save 900 1
# 300秒内，如果超过10个key被修改，则发起快照保存
save 300 10
# 60秒内，如果1万个key被修改，则发起快照保存
save 60 10000
# 持久化文件名
dbfilename dump.rdb
```

### 2.2 AOF持久化

使用AOF做持久化，每一个命令以 Redis 协议的格式来保存，新命令会被追加到文件的末尾。 Redis 还可以在后台对 AOF 文件进行重写，使得 AOF文件的体积不会超出保存数据集状态所需的实际大小。实际上，AOF持久化并不会立即将命令写入到硬盘文件中，而是写入到硬盘缓存，在接下来的策略中，配置多久来从硬盘缓存写入到硬盘文件。所以在一定程度一定条件下，还是会有数据丢失，不过你可以大大减少数据损失

```
# 开启AOF
appendonly yes

# 持久化策略
appendfsync everysec

# appendfsync 配置含义:
# always: 每次操作都会立即写入aof文件中
# everysec: 每秒持久化一次(默认配置)
# no: 不主动进行同步操作，默认30s一次

# 持久化文件名
appendfilename "appendonly.aof"
```

### 三、单机Docker部署Redis集群

**3.1 创建挂载目录**

```
$ mkdir -p /docker/mount/redis-cluster/redis-node-1/conf
$ mkdir -p /docker/mount/redis-cluster/redis-node-2/conf
$ mkdir -p /docker/mount/redis-cluster/redis-node-3/conf
$ mkdir -p /docker/mount/redis-cluster/redis-node-1/data
$ mkdir -p /docker/mount/redis-cluster/redis-node-2/data
$ mkdir -p /docker/mount/redis-cluster/redis-node-3/data
```

**3.2 修改各个配置文件**

```properties
# 端口,可以使用默认
port 6379
# 开启集群功能
cluster-enabled yes
# 集群节点配置文件名，该文件不是人工编写的，由程序自动生成和修改
cluster-config-file cluster-nodes-7001.conf
# 集群节点超时时间，配合cluster-replica-validity-factor使用
cluster-node-timeout 1000
# 探测集群节点超时不可用的次数，假设cluster-node-timeout设置为1000毫秒，cluster-replica-validity-factor为5，那么1000*5之间内集群节点还不可用的话，会被标记为疑似下线
cluster-replica-validity-factor 5
# 主节点下最少的从节点数
cluster-migration-barrier 0
# yes 要求所有主节点正常工作，且所有hash slots被分配到工作的主节点，集群才能提供服务，如果想一部分hash slots即可响应请求，则设置为no
cluster-require-full-coverage yes
# yes 禁止当主节点挂掉时，让从节点不能竞选为主节点
cluster-replica-no-failover no
# 开启AOF持久化
appendonly yes
# 设置RDB和AOF文件目录
dir ./
# 密码
requirepass ******
```

**3.3 创建Docker网络(使用单独的桥接模式网络)**

```shell
$ docker network create redis-cluster
```

**3.4 启动每个Redis实例**

```shell
$ docker run -v /docker/mount/redis-cluster/redis-node-1/conf/redis.conf:/usr/local/etc/redis/redis.conf -v /docker/mount/redis-cluster/redis-node-1/data/:/data --name redis-node-1 -p 6381:6379 --privileged=true --net redis-cluster -h redis-node-1 -d redis redis-server /usr/local/etc/redis/redis.conf
$ docker run -v /docker/mount/redis-cluster/redis-node-2/conf/redis.conf:/usr/local/etc/redis/redis.conf -v /docker/mount/redis-cluster/redis-node-2/data/:/data --name redis-node-2 -p 6382:6379 --privileged=true --net redis-cluster -h redis-node-2 -d redis redis-server /usr/local/etc/redis/redis.conf
$ docker run -v /docker/mount/redis-cluster/redis-node-3/conf/redis.conf:/usr/local/etc/redis/redis.conf -v /docker/mount/redis-cluster/redis-node-3/data/:/data --name redis-node-3 -p 6383:6379 --privileged=true --net redis-cluster -h redis-node-3 -d redis redis-server /usr/local/etc/redis/redis.conf
```

**3.5 获取每个容器的IP**

*注意:创建集群时使用IP地址,使用主机名称会报错*

```shell
$ docker inspect redis-node-1 | grep IPAddress
$ docker inspect redis-node-2 | grep IPAddress
$ docker inspect redis-node-3 | grep IPAddress
```

我这里获取到的IP是:`172.18.0.2`, `172.18.0.3`, `172.18.0.4`

**3.6 使用redis-cli创建集群**

```shell
$ docker exec -it redis-node-1 bash
$ redis-cli --cluster create 172.18.0.2:6379  172.18.0.3:6379  172.18.0.4:6379 --cluster-replicas 0
```

**3.7 集群设置密码**

```shell
# 进入其中一个容器
$ docker exec -it redis-node-1 bash

# 连接节点1,设置密码
$ redis-cli -c -h redis-node-1
$ config set requirepass ******
$ config set masterauth  ******

# 连接节点2,设置密码
$ redis-cli -c -h redis-node-2
$ config set requirepass ******
$ config set masterauth  ******

# 连接节点3,设置密码
$ redis-cli -c -h redis-node-3
$ config set requirepass ******
$ config set masterauth  ******
```
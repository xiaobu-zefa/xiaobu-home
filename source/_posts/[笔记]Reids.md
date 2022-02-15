---
title: '[笔记]Reids'
date: 2022-02-15 10:17:56
excerpt: 'Reids使用过程中产生的笔记...'
tags: 笔记
categories: 笔记
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
$ docker run -v /docker/mount/redis/conf/redis.conf:/usr/local/etc/redis/redis.conf --name redis -p 6379:6379 -d redis r
edis-server /usr/local/etc/redis/redis.conf
```

### 1.5 使用命令连接Redis服务
```shell
$ docker run -it --rm --network=host redis redis-cli
```
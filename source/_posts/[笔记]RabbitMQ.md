---
title: '[笔记]RabbitMQ'
excerpt: RabbitMQ使用过程中产生的笔记...
tags: 笔记
categories: 笔记
abbrlink: 69af257b
date: 2022-02-16 16:32:08
---

## 一、Docker部署单实例RabbitMQ

### 1.1 拉取Docker最新镜像并以环境变量模式启动(rabbitmq:3-management会开启控制面板)
```shell
$ docker run -d --name rabbitmq -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=19971123Zh_   -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
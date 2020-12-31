---
title: elk常用操作
date: 2020-12-31 14:34:35
tags:
---

## 一、安装es
#### 1.1 下载并安装ES的yum公钥
```
rpm --import https://packages.elastic.co/GPG-KEY-elasticsearch
```
#### 1.2 配置ES的yum源
```
vim /etc/yum.repos.d/elasticsearch.repo
```
输入下面的内容：
```
[elasticsearch-2.x]
name=Elasticsearch repository for 2.x packages
baseurl=http://packages.elastic.co/elasticsearch/2.x/centos
gpgcheck=1
gpgkey=http://packages.elastic.co/GPG-KEY-elasticsearch
enabled=1
```
命令模式输入:wq保存

#### 1.3 更新yum的缓存
```
yum makecache
```
#### 1.4 安装ES
```
yum install elasticsearch
```

#### 1.5 修改配置文件
```
vim /etc/elasticsearch/elasticsearch.yml
```
修改对应字段
```
node.name: v-node-100
network.host: 0.0.0.0
http.port: 9200
cluster.initial_master_nodes: ["v-node-100"]
```

#### 1.6 启动 es
```
systemctl start elasticsearch.service
```

#### 1.7 ip:9200
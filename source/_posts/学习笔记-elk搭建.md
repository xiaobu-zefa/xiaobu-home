---
title: 学习笔记-elk搭建
catalog: true
date: 2021-01-02 02:34:17
subtitle: ELK 的学习笔记
header-img: /img/header_img/lml_bg.jpg
tags:
- 学习笔记
categories:
- 学习笔记
---

## 一、Elasticsearch
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

## 二、Kibana
#### 2.1 下载并导入公开签署密钥
```
rpm --import https://artifacts.elastic.co/GPG-KEY-elasticsearch
```

#### 2.2 指定仓库信息
编辑文件
```
vim /etc/yum.repos.d/kibana.repo
```
输入
```
[kibana-6.x]
name=Kibana repository for 6.x packages
baseurl=https://artifacts.elastic.co/packages/6.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md
```

#### 2.3 安装
```
yum install kibana -y
```

#### 2.5 配置
编辑文件
```
vim /etc/kibana/kibana.yml
```
修改下列项
```
server.port: 5601                              # 开放端口
server.host: "0.0.0.0"                         # 允许所有主机访问
elasticsearch.url: "http://localhost:19204"    # es的服务地址
```

#### 2.6 开启服务
```
systemctl start kibana
```


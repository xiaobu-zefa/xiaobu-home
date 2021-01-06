---
title: 常用操作-Docker
catalog: true
date: 2021-01-01 02:34:17
subtitle: Docker 的常用操作
top: 999
header-img: /img/header_img/lml_bg.jpg
tags:
- notes
categories:
- notes
---

**删除已经停止的容器**
```
docker container prune
```

**进入运行中的容器**
```
docker exec -ti d0b86 /bin/bash 
```

**阿里云docker镜像加速**
```
sudo mkdir -p /etc/docker sudo tee /etc/docker/daemon.json <<-'EOF' { "registry-mirrors": ["https://uswxfj2s.mirror.aliyuncs.com"] } EOF sudo systemctl daemon-reload sudo systemctl restart docker
```

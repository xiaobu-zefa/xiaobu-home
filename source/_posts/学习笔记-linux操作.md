---
title: 学习笔记-linux操作
catalog: true
date: 2021-01-03 02:34:17
subtitle: Linux 的学习笔记
header-img: /img/header_img/lml_bg.jpg
tags:
- 学习笔记
categories:
- 学习笔记
---

## 一、系统信息查看相关
**1.1 查看发行版**
```
lsb_release -a
```

**1.2 查看系统位数**
```
getconf LONG_BIT
```

**1.3 查看机器名**
```
hostname
```

**1.4 查看被系统识别的磁盘**
```
fdisk -l
```

**1.5 查看磁盘类型**
```
df -T
```

**1.6 查看磁盘占用情况**
```
df -h
```

## 二、磁盘操作相关
**2.1 挂载磁盘**
```
mount -t ext4 /dev/vdb /mnt/vdb
```

**2.2 列出所有可用块设备的信息，显示块与块之间的依赖关系**
```
lsblk
```

**2.3 使用 ext4 格式化磁盘**
```
mkfs.ext4 /dev/sdb
```

**2.4 创建分区**
```
fdisk /dev/vdb
	n
	p
	1
	(default)
	(default)
	w
```

**2.5 格式化**
```
mkfs.ext4 /dev/sdb
```

**2.6 挂载**
```
mount /dev/vdb1 /mnt/vdb
```

## 三、文件操作相关
**3.1 修改文件所属人**
```
chown -R oracle:oinstall /mnt/vdb/data/oracle/
```

**3.2 修改文件权限**
```
chmod -R 775 /mnt/vdb/data/oracle/
```

## 四、防火墙相关
**4.1 端口操作**
```
firewall-cmd --zone=public --add-port=5672/tcp --permanent       # 开放5672端口
firewall-cmd --zone=public --remove-port=5672/tcp --permanent    # 关闭5672端口   
```
**4.2 配置立即生效**
```
firewall-cmd --reload   					                               
```

**4.3 查看防火墙所有开放的端口**
```
firewall-cmd --zone=public --list-ports
```

**4.4 关闭防火墙**
```
systemctl stop firewalld.service
```

**4.5 查看防火墙状态**
```
firewall-cmd --state
```


## 五、端口进程相关
**5.1 查看监听的端口**
```
netstat -lnpt
PS:centos7默认没有 netstat 命令，需要安装 net-tools 工具，yum install -y net-tools
```

**5.2 检查端口被哪个进程占用**
```
netstat -lnpt | grep 5672
```

**5.3 查看进程的详细信息**
```
ps 6832
```

**5.4 中止进程**
```
kill -9 6832
```

**5.5 开启某个端口的TCP监听**
```
yum install nc -y
nc -l -p 9140
```

## 六、软件包相关
**6.1 查询一个软件包是否安装**
```
rpm –qa | grep redis
```

**6.2 查询一个软件包安装了哪些文件**
```
rpm -ql redis
```


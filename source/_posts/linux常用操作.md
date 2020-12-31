---
title: linux常用操作
date: 2020-12-31 14:22:58
tags:
---

**查看发行版**
`lsb_release -a`

**查看系统位数**
`getconf LONG_BIT`

**查看机器名**
`hostname`

**查看被系统识别的磁盘**
`fdisk -l`

**查看磁盘类型**
`df -T`

**查看磁盘占用情况**
`df -h`

**挂载磁盘**
`mount -t ext4 /dev/vdb /mnt/vdb`

**列出所有可用块设备的信息，显示块与块之间的依赖关系**
`lsblk`

**使用 ext4 格式化磁盘**
`mkfs.ext4 /dev/sdb`

**修改文件所属人**
`chown -R oracle:oinstall /mnt/vdb/data/oracle/`

**修改文件权限**
`chmod -R 775 /mnt/vdb/data/oracle/`

**Linux 添加一块新硬盘的步骤**
**创建分区		    
```
fdisk /dev/vdb
	n
	p
	1
	(default)
	(default)
	w
```

**格式化**
`mkfs.ext4 /dev/sdb`

**挂载**
`mount /dev/vdb1 /mnt/vdb`
#**END ###################

**开放端口**
```
firewall-cmd --zone=public --add-port=5672/tcp --permanent          **开放5672端口
firewall-cmd --zone=public --remove-port=5672/tcp --permanent    **关闭5672端口
firewall-cmd --reload   					**配置立即生效
```

**查看防火墙所有开放的端口**
`firewall-cmd --zone=public --list-ports`

**关闭防火墙**
`systemctl stop firewalld.service`

**查看防火墙状态**
`firewall-cmd --state`

**查看监听的端口**
```
netstat -lnpt
PS:centos7默认没有 netstat 命令，需要安装 net-tools 工具，yum install -y net-tools
```

**检查端口被哪个进程占用**
`netstat -lnpt | grep 5672`

**查看进程的详细信息**
`ps 6832`

**中止进程**
`kill -9 6832`

**开启某个端口的TCP监听**
```
yum install nc -y
nc -l -p 9140
```

**查看挂载点**
`df -h`

**查询一个软件包是否安装**
`rpm –qa | grep redis`

**查询一个软件包安装了哪些文件**
`rpm -ql redis`


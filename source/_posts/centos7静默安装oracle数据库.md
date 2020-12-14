---
title: centos7静默安装oracle数据库
date: 2020-12-14 13:55:34
tags:
---
## 一、前言
静默安装就是不使用图形化界面的安装，全部用命令与配置文件进行安装的方式。
如果你在 Windows 下安装过 Oracle 数据库，理解起来可能会比较简单。
个人使用的环境为：Centos7 + Oracle11gR2。
提前去官网下载好 Oracle 的压缩包，放到 `/opt/download` 目录中，可能有两个压缩包，使用命令 `unzip xxx1.zip` 、`unzip xxx2.zip` 将两个压缩包解压，得到 `database` 目录。

## 二、步骤拆解
系统环境配置  |  安装数据库软件  |  配置静默监听  |  静默方式创建数据库同时建立实例

## 三、详细步骤
#### 3.1 系统环境配置
**3.1.1 安装依赖**
这些是需要的依赖，需要先安装好，不能漏掉。
```shell
# yum install 
  gcc 
  make 
  binutils 
  gcc-c++ 
  compat-libstdc++-33elfutils-libelf-devel 
  elfutils-libelf-devel-static 
  ksh 
  libaio 
  libaio-develnumactl-devel 
  sysstat 
  unixODBC 
  unixODBC-devel 
  pcre-devel 
```

**3.1.2 配置用户和组**
安装 Oracle 需要用到 oracle 用户，所以需要手动创建好用户和用户组。
```shell
[root@CentOS \]# groupadd oinstall      # 这是创建用户组
[root@CentOS \]# groupadd dba           # 这是创建用户组
[root@CentOS \]# useradd -g oinstall -G dba oracle   # 这是创建用户并指定用户组
[root@CentOS \]# passwd oracle       # 这是配置用户密码
```
创建好之后可以确认一下用户信息。
```shell
[root@CentOS \] id oracle    # 这是查看用户信息
```
这是输出信息。
```shell
uid=1001(oracle) gid=1001(oinstall) 组=1001(oinstall),1002(dba)
```

**3.1.3 修改内核参数配置文件**
这一步是让 Oracle 更好的工作。
使用命令 `vim /etc/sysctl.conf` 打开配置文件，文件后面追加下面的内容。
```shell
fs.aio-max-nr = 1048576
fs.file-max = 6815744
kernel.shmall = 2097152
kernel.shmmax = 1073741824         # 本机物理内存（2G）的一半
kernel.shmmni = 4096
kernel.sem = 250 32000 100 128
net.ipv4.ip_local_port_range = 9000 65500
net.core.rmem_default = 262144
net.core.rmem_max = 4194304
net.core.wmem_default = 262144
net.core.wmem_max = 1048576
```
*注：其中 `kernel.shmmax = 1073741824` 设置为本机物理内存（2G）的一半，单位为byte。*
保存退出后使用命令 ` sysctl -p` 使其生效。

**3.1.4 修改用户限制文件**
这一步是限制 Oracl 用户的权限。
使用命令 `vim /etc/security/limits.conf` 打开用户限制配置文件。
在文件的后面追加以下内容：
```
oracle           soft      nproc           2047
oracle           hard     nproc         16384
oracle           soft      nofile           1024
oracle           hard     nofile          65536
oracle           soft      stack           10240
```
保存退出。
使用命令 `vim /etc/pam.d/login` 打开用户登录配置文件。
在文件后面追加以下内容：
```
session required   /lib64/security/pam_limits.so
session required   pam_limits.so
```
保存退出。
使用命令 `vim /etc/profile` 打开环境变量配置文件。
在文件后面追加以下内容：
```
if [ $USER = "oracle" ]; then
  if[ $SHELL = "/bin/ksh" ]; then
    ulimit -p 16384
    ulimit -n 65536
  else
    ulimit -u 16384 -n 65536
  fi
fi
```
保存退出。

**3.1.5 创建安装目录、设置文件权限**
执行以下命令。
```shell
[root@CentOS /]# mkdir -p /data/oracle/product/11.2.0      # 这是创建安装目录
[root@CentOS /]# mkdir /data/oracle/oradata                     # 这是创建实例的数据文件目录
[root@CentOS /]# mkdir /data/oracle/inventory                  # 这是创建Oracle中央目录，Oracle 不建议将此目录创建到 ORACLE_BASE 中，不过不影响安装。
[root@CentOS /]# mkdir /data/oracle/fast_recovery_area  
[root@CentOS /]# chown -R oracle:oinstall /data/oracle   将目录所有者改为 Oracle 用户
[root@CentOS /]# chmod -R 775 /data/oracle 
```

**3.1.6 更改oracle用户的环境变量**
切换用户。
```shell
[root@CentOS /]# su - oracle      # 中间加 - 可以将环境变量同时切换
```
打开配置文件。
```shell
[oracle@Centos /]$ vim ~/.bash_profile
```
按照上一步创建的目录与文件内容，在该配置文件的后面追加以下内容：
```
# oracle 设置
ORACLE_BASE=/data/oracle            # oracle 的基目录
ORACLE_HOME=$ORACLE_BASE/product/11.2.0 # oracle 的安装目录
ORACLE_SID=orcl   # 这里必须和数据库实例名一致，所以创建的实例的时候要用这个名字
PATH=$PATH:$ORACLE_HOME/bin   # oracle的命令存放目录
ORACLE_UNQNAME=$ORACLE_SID
export ORACLE_BASE ORACLE_HOME ORACLE_SID PATH ORACLE_UNQNAME
```
使用命令 `source ~/.bash_profile` 刷新一下。

**3.1.7 配置hostname**
使用命令 `hostname` 查看主机名，每个人不一样，比如我的是 `CentOS`。
使用命令 `vim /etc/hosts` 打开文件，追加一行主机与域名的记录。
```
# 要使用你的IP地址和你的主机名
192.168.1.1                   CentOS
```

#### 3.2 安装数据库软件
**3.2.1 编辑静默安装响应文件**
静默安装数据库需要用到静默安装响应文件，静默安装响应文件就像使用图形化界面安装的时候点击的下一步、下一步一样，只不过是提前配置好，安装程序运行的时候就可以根据这个文件来做安装了。
切换到 `root` 用户，使用命令  `vim /opt/download/database/response/db_install.rsp` 打开静默安装响应文件。按照以下内容修改里面的内容：
```shell
# 表示只安装数据库
oracle.install.option=INSTALL_DB_SWONLY
# 当前的主机名，可以使用命令 `hostname` 查看
ORACLE_HOSTNAME=CentOS
UNIX_GROUP_NAME=oinstall
# inventory 目录
INVENTORY_LOCATION=/data/oracle/inventory
SELECTED_LANGUAGES=en,zh_CN
ORACLE_HOME=/data/oracle/product/11.2.0
ORACLE_BASE=/data/oracle
## 安装的版本 - 企业版
oracle.install.db.InstallEdition=EE
oracle.install.db.DBA_GROUP=dba
oracle.install.db.OPER_GROUP=dba
DECLINE_SECURITY_UPDATES=true
```
保存退出。

**3.2.2 使用oracle用户开始安装**
```shell
[oracle@CentOS ~]$ cd /opt/download/database/response/
[oracle@CentOS response]$  ./runInstaller -silent -responseFile /opt/download/database/response/db_install.rsp -ignorePrereq
```
这样，安装程序就在后台运行了，如果运行中发生了错误，提示信息中会有 [FATAL] 字样，出现这个字样说明安装失败，需要修改配置。
如果提示中出现 [WARNING] 字样可以不用理会，不会影响安装。
如果出现类似以下提示，就说明安装成功了，可能你的提示是英文版的。（不是自己的图，所以路径不对，请以你的路径为准）
![安装成功提示信息.png](https://upload-images.jianshu.io/upload_images/15228836-12fa46d37f8f3f90.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
然后按照提示，打开一个新的终端，使用 `root` 身份执行上面的两个脚本。
至此，数据库的安装就完成了。

#### 3.3 配置静默监听
按照静默监听文件配置静默监听。
切换到 `oracle` 用户，运行命令：
```shell
 [oracle@CentOS ~]$ netca /silent /responseFile /opt/download/database/response/netca.rsp
```
执行成功后可以使用 `netstat` 命令查看是否正在监听。
```shell
[oracle@CentOS ~]# netstat -tnulp | grep 1521
```
出现类似下面的信息就是正在监听。
![正在监听](https://upload-images.jianshu.io/upload_images/15228836-d8d1de1d6bd9650a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 3.4 静默方式创建数据库同时建立实例
**3.4.1 编辑静默安装响应文件**
切换回 `root` 用户，编辑静默安装响应文件。
```shell
[root@CentOS /]# vim /opt/download/database/response/dbca.rsp
```
将文件内容做以下修改：
```shell
GDBNAME= "orcl"
SID =" orcl"
SYSPASSWORD= "oracle"
SYSTEMPASSWORD= "oracle"
SYSMANPASSWORD= "oracle"
DBSNMPPASSWORD= "oracle"
DATAFILEDESTINATION=/data/oracle/oradata
RECOVERYAREADESTINATION=/data/oracle/fast_recovery_area
CHARACTERSET= "ZHS16GBK"
TOTALMEMORY= "1638"
```
*注：其中TOTALMEMORY ="1638" 为1638MB，物理内存2G x 80%。*
保存退出。

**3.4.2 开始执行静默安装**
切换回 `oracle` 用户，执行命令：
```
[oracle@CentOS ~]$ dbca -silent -responseFile /opt/download/database/response/dbca.rsp
```
安装过程出现以下提示：（网上随便找的图，所以路径不一样）
![安装提示](https://upload-images.jianshu.io/upload_images/15228836-7025a90eb0cd3d71.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
安装成功，检查一下实例。
```
[oracle@CentOS ~]$ ps -ef | grep ora_ | grep -v grep
```
出现进程信息（也是网图，路径一样）：
![进程信息](https://upload-images.jianshu.io/upload_images/15228836-f97d3fd018bbc8a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
查看以下监听状态：
```
[oracle@CentOS ~]$ lsnrctl status
```
出现提示：（网图）
![监听状态](https://upload-images.jianshu.io/upload_images/15228836-d0e445b4e10c504e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**3.4.3 登录查看实例状态**
```
[oracle@CentOS~]$ sqlplus / as sysdba
......
......
SQL> select status from v$instance;
```
出现这种提示代表实例启动成功：（网图）
![实例状态](https://upload-images.jianshu.io/upload_images/15228836-25843c54893d7aeb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
至此，数据库软件的安装和数据库实例的创建都成功了。
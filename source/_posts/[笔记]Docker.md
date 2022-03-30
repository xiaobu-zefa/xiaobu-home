---
title: '[笔记]Docker'
excerpt: Docker使用过程中产生的笔记...
tags: 笔记
categories: 笔记
abbrlink: a6cc1afa
date: 2021-01-01 02:34:17
---

## 一、配置阿里云镜像加速

```
sudo mkdir -p /etc/docker 
sudo vim /etc/docker/daemon.json
### 输入内容 >>>
{ "registry-mirrors": ["https://uswxfj2s.mirror.aliyuncs.com"] }
### 输入内容 <<<
sudo systemctl daemon-reload
sudo systemctl restart docker
```

## 二、镜像操作

**2.1 启动一个镜像并以root进入容器**
```
docker run -it --user root 镜像名 /bin/bash
```

**2.2 从容器生成新镜像**
```
docker commit 容器ID 所有人/镜像名:标签
```

**2.3 提交镜像到镜像仓库**
```
docker push 所有人/镜像名:标签
```

**2.4 从DOCKERFILE构建镜像**
```
# 需要目录下有一个dockerfile
docker build -t 镜像名:标签 .
```

**2.5 删除镜像**
```
docker rmi 镜像名:标签名
```

## 三、容器操作

**3.1 进入已经存在的容器**
```
docker exec -it 容器ID /bin/bash
```

**3.2 删除已经停止的容器**
```
docker container prune
```

## 三、Dockerfile相关

**3.1 Docerfile 文件内容解析**
```
# 初始镜像
FROM centos

# 执行命令-shell格式
RUN yum install wget

# 执行命令-exec格式
RUN ["./test.php", "dev", "offline"]

# 从上下文目录中复制文件或者目录到容器里指定路径
# <源路径>：源文件或者源目录，可以是通配符表达式，
COPY [--chown=<user>:<group>] <源路径1>...  <目标路径>
COPY [--chown=<user>:<group>] ["<源路径1>",...  "<目标路径>"]

# 和 COPY 的使用格式一致,（同样需求下，官方推荐使用 COPY）
# ADD 的优点：在执行 <源文件> 为 tar 压缩文件的话，压缩格式为 gzip, bzip2 以及 xz 的情况下，会自动复制并解压到 <目标路径>
# ADD 的缺点：在不解压的前提下，无法复制 tar 压缩文件。会令镜像构建缓存失效，从而可能会令镜像构建变得比较缓慢。具体是否使用，可以根据是否需要自动解压来决定
ADD [--chown=<user>:<group>] <源路径1>...  <目标路径>
ADD [--chown=<user>:<group>] ["<源路径1>",...  "<目标路径>"]

# 类似于 RUN 指令，用于运行程序，但二者运行的时间点不同
# CMD 在docker run 时运行,RUN 是在 docker build
# 为启动的容器指定默认要运行的程序，程序运行结束，容器也就结束。CMD 指令指定的程序可被 docker run 命令行参数中指定要运行的程序所覆盖
# 如果 Dockerfile 中如果存在多个 CMD 指令，仅最后一个生效
# 推荐使用第二种格式，执行过程比较明确。第一种格式实际上在运行的过程中也会自动转换成第二种格式运行，并且默认可执行文件是 sh
CMD <shell 命令> 
CMD ["<可执行文件或命令>","<param1>","<param2>",...]
# 该写法是为 ENTRYPOINT 指令指定的程序提供默认参数
CMD ["<param1>","<param2>",...]  

# 类似于 CMD 指令，但其不会被 docker run 的命令行参数指定的指令所覆盖，而且这些命令行参数会被当作参数送给 ENTRYPOINT 指令指定的程序,但是如果运行 docker run 时使用了 --entrypoint 选项，此选项的参数可当作要运行的程序覆盖 ENTRYPOINT 指令指定的程序
# 在执行 docker run 的时候可以指定 ENTRYPOINT 运行所需的参数
# 如果 Dockerfile 中如果存在多个 ENTRYPOINT 指令，仅最后一个生效
ENTRYPOINT ["<executeable>","<param1>","<param2>",...]

# 设置环境变量，定义了环境变量，那么在后续的指令中，就可以使用这个环境变量
ENV <key> <value>
ENV <key1>=<value1> <key2>=<value2>...

# 构建参数，与 ENV 作用一至。不过作用域不一样。ARG 设置的环境变量仅对 Dockerfile 内有效，也就是说只有 docker build 的过程中有效，构建好的镜像内不存在此环境变量

# 构建命令 docker build 中可以用 --build-arg <参数名>=<值> 来覆盖
ARG <参数名>[=<默认值>]

# 定义匿名数据卷。在启动容器时忘记挂载数据卷，会自动挂载到匿名卷
# 避免重要的数据，因容器重启而丢失，这是非常致命的
# 避免容器不断变大
# 在启动容器 docker run 的时候，我们可以通过 -v 参数修改挂载点
VOLUME ["<路径1>", "<路径2>"...]
VOLUME <路径>

# 仅仅只是声明端口
# 帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射
# 在运行时使用随机端口映射时，也就是 docker run -P 时，会自动随机映射 EXPOSE 的端口
EXPOSE <端口1> [<端口2>...]

# 指定工作目录。用 WORKDIR 指定的工作目录，会在构建镜像的每一层中都存在。（WORKDIR 指定的工作目录，必须是提前创建好的）
# docker build 构建镜像过程中的，每一个 RUN 命令都是新建的一层。只有通过 WORKDIR 创建的目录才会一直存在
WORKDIR <工作目录路径>
# 用于指定执行后续命令的用户和用户组，这边只是切换后续命令执行的用户（用户和用户组必须提前已经存在）
USER <用户名>[:<用户组>]

# 用于指定某个程序或者指令来监控 docker 容器服务的运行状态。
HEALTHCHECK [选项] CMD <命令>：设置检查容器健康状况的命令
HEALTHCHECK NONE：如果基础镜像有健康检查指令，使用这行可以屏蔽掉其健康检查指令
HEALTHCHECK [选项] CMD <命令> : 这边 CMD 后面跟随的命令使用，可以参考 CMD 的用法

# 用于延迟构建命令的执行。简单的说，就是 Dockerfile 里用 ONBUILD 指定的命令，在本次构建镜像的过程中不会执行（假设镜像为 test-build）。当有新的 Dockerfile 使用了之前构建的镜像 FROM test-build ，这是执行新镜像的 Dockerfile 构建时候，会执行 test-build 的 Dockerfile 里的 ONBUILD 指定的命令
ONBUILD <其它指令>
```

> Dockerfile 的指令每执行一次都会在 docker 上新建一层。所以过多无意义的层，会造成镜像膨胀过大。

**3.2 ENTRYPOINT搭配CMD指令**
一般是变参才会使用 CMD ，这里的 CMD 等于是在给 ENTRYPOINT 传参。
示例：
假设已通过 Dockerfile 构建了 nginx:test 镜像：
```
FROM nginx
ENTRYPOINT ["nginx", "-c"] # 定参
CMD ["/etc/nginx/nginx.conf"] # 变参
```
- 不传参运行
```
docker run  nginx:test
```
容器内会默认运行以下命令，启动主进程。
```
nginx -c /etc/nginx/nginx.conf
```
- 传参运行
```
docker run  nginx:test -c /etc/nginx/new.conf
```
容器内会默认运行以下命令，启动主进程(/etc/nginx/new.conf:假设容器内已有此文件)
```
nginx -c /etc/nginx/new.conf
```

## 四、Docker Compose相关

> Compose 是用于定义和运行多容器 Docker 应用程序的工具。通过 Compose，您可以使用 YML 文件来配置应用程序需要的所有服务。然后，使用一个命令，就可以从 YML 文件配置中创建并启动所有服务。

> Compose 使用的三个步骤：
>
> - 使用 Dockerfile 定义应用程序的环境。
> - 使用 docker-compose.yml 定义构成应用程序的服务，这样它们可以在隔离环境中一起运行。
> - 最后，执行 docker-compose up 命令来启动并运行整个应用程序。

**4.1 Compose 安装、配置、运行**
```
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 将可执行权限应用于二进制文件
sudo chmod +x /usr/local/bin/docker-compose

# 创建软链接
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose

docker-compose --version
```

## 五、Docker网络模式

**5.1 docker四种网络模式**

```
# 查看docker网络模式
docker network ls

# 桥接式网络模式
Bridge contauner
# 开放式网络模式
Host(open) container   
# 联合挂载式网络模式，是host网络模式的延伸
Container(join) container
# 封闭式网络模式
None(Close) container

# 指定容器使用的网络模式
docker run --network 命令可以指定使用网络模式
```

**5.2 Bridge 网络模式**

当Docker进程启动时，会在主机上创建一个名为docker0的虚拟网桥，此主机上启动的Docker容器会连接到这个虚拟网桥上，所以有默认地址172.17.0.0/16的地址。虚拟网桥的工作方式和物理交换机类似，这样主机上的所有容器就通过交换机连在了一个二层网络中。

从docker0子网中分配一个IP给容器使用，并设置docker0的IP地址为容器的默认网关。在主机上创建一对虚拟网卡veth pair设备，Docker将veth pair设备的一端放在新创建的容器中，并命名为eth0（容器的网卡），另一端放在主机中，以vethxxx这样类似的名字命名，并将这个网络设备加入到docker0网桥中。可以通过brctl show命令查看。

bridge模式是docker的默认网络模式，不写--net参数，就是bridge模式。使用docker run -p时，docker实际是在iptables做了DNAT规则，实现端口转发功能。可以使用iptables -t nat -vnL查看。

图示:
![bridge模式图示](https://store.xiaobu.site/store-blog/article-info/Snipaste_2022-03-25_20-51-51.png)

**5.3 Host 网络模式**

如果启动容器的时候使用host模式，那么这个容器将不会获得一个独立的Network Namespace，而是和宿主机共用一个Network Namespace。容器将不会虚拟出自己的网卡，配置自己的IP等，而是使用宿主机的IP和端口。但是，容器的其他方面，如文件系统、进程列表等还是和宿主机隔离的。

图示:
![Host模式](https://store.xiaobu.site/store-blog/article-info/1111.png)

**5.4 Container网络模式**

这个模式指定新创建的容器和已经存在的一个容器共享一个 Network Namespace，而不是和宿主机共享。新创建的容器不会创建自己的网卡，配置自己的 IP，而是和一个指定的容器共享 IP、端口范围等。同样，两个容器除了网络方面，其他的如文件系统、进程列表等还是隔离的。两个容器的进程可以通过 lo 网卡设备通信。

图示:
![Container模式](https://store.xiaobu.site/store-blog/article-info/fdfsfd.png)

**5.5 None 网络模式**

使用none模式，Docker容器拥有自己的Network Namespace，但是，并不为Docker容器进行任何网络配置。也就是说，这个Docker容器没有网卡、IP、路由等信息，只有lo 网络接口。需要我们自己为Docker容器添加网卡、配置IP等。

不参与网络通信，运行于此类容器中的进程仅能访问本地回环接口；仅适用于进程无须网络通信的场景中，例如：备份、进程诊断及各种离线任务等。

![None模式](https://store.xiaobu.site/store-blog/article-info/fff.png)
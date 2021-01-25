---
title: 常用操作-Docker
catalog: true
date: 2021-01-01 02:34:17
subtitle: Docker 的常用操作
header-img: /img/header_img/lml_bg.jpg
tags:
- notes
categories:
- notes
---
## 一、镜像操作

**1.1 启动一个镜像同时进入容器**
```
docker run -it 镜像名 /bin/bash
```

**1.2 容器生成新镜像**
```
docker commit 容器ID 所有人/镜像名:标签
```

**1.3 提交镜像到镜像仓库**
```
docker push 所有人/镜像名:标签
```

**1.4 构建镜像**
```
docker build -t 镜像名:标签 .
```

**1.5 删除镜像**
```
docker rmi 镜像名:标签名
```

**1.6 配置阿里云docker镜像加速**
```
sudo mkdir -p /etc/docker sudo tee /etc/docker/daemon.json <<-'EOF' { "registry-mirrors": ["https://uswxfj2s.mirror.aliyuncs.com"] } EOF sudo systemctl daemon-reload sudo systemctl restart docker
```

## 二、容器操作

**2.1 进入已经存在的容器**
```
docker exec -it 容器ID /bin/bash
```

**2.2 删除已经停止的容器**
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
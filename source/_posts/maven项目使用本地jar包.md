---
title: maven项目使用本地jar包
date: 2020-12-14 13:57:07
tags:
---
## 一、前言
构建项目的时候避免不了使用一些本地 Jar 包，这些Jar包不在中央仓库里存在，我们在本地添加了依赖后，本机使用虽然没问题，但是如果想用比如 Docker 自动化构建这种远程构建的话就会出现问题，针对这种情况，可以采用以下几个步骤解决：
## 二、将本地Jar包安装成Maven依赖
进入到 Jar 包所在目录，使用一条命令：
```shell
mvn install:install-file -DgroupId=site.xiaobu -DartifactId=xiaobuTool -Dversion=1.0.0 -Dpackaging=jar -Dfile=xiaobuTool.jar
```
这条命令的意思是将 xiaobuTool.jar 这个 jar 包用 jar 的形式安装到仓库，这样项目中就可以直接引用了。
引用示例：
```
   <dependencies>
        <dependency>
            <groupId>site.xiaobu</groupId>
            <artifactId>xiaobuTool</artifactId>
            <version>1.0.0</version>
        </dependency>
    </dependencies>
```
## 三、找到本地仓库中安装的Jar包根目录并复制到项目下
**3.1 安装的 jar 包默认在`~/.m2/repository`下面**
![本地安装jar包位置](https://upload-images.jianshu.io/upload_images/15228836-b6576734b3c261fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**3.2 在项目根目录中新建一个 lib 文件夹并将要使用的本地jar包整个目录复制进去**
![lib目录](https://upload-images.jianshu.io/upload_images/15228836-3e0bf7c990e79b82.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
## 三、在POM文件中配置本地仓库
在 pom 文件中添加下列的项，id 和 name 可以随意，url 中 ${project.basedir} 指的是项目根目录，意思是从将项目根目录下的 lib 文件夹作为本地仓库。
```xml
    <repositories>
        <!-- 本地仓库 -->
        <repository>
            <id>in-project</id>
            <name>In Project Repo</name>
            <url>file://${project.basedir}/lib</url>
        </repository>
    </repositories>
```
## 四、后记
至此，maven 项目就可以在其余主机上顺利被构建了。
附带项目的一些构建配置：
```xml
   <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <artifactId>maven-shade-plugin</artifactId>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer
                                        implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <!-- 指定项目主启动类 -->
                                    <mainClass>xxx.xxx.xxx.xxx.App</mainClass>
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
```
---
title: 创建一个纯净的SpringBoot项目
catalog: true
date: 2020-10-01 02:34:17
subtitle: 创建一个纯净的SpringBoot项目
top: 0
header-img: /img/header_img/lml_bg.jpg
tags:
- Java教程
categories:
- Java教程
---

## 一、前言
Spring 是 Java 开发非常流行且优秀的框架，一般用来做 Web 开发，但是如果我们只想使用 Spring 提供的容器环境和方便的工具组件，不想启用 Tomcat 、数据库等繁杂的组件该如何做？
## 二、去掉数据库
只需要在启动类上加上一个属性，去掉数据源的自动装配即可
```java
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
@EnableScheduling
public class App implements ApplicationContextAware {

    private static final Logger log = LoggerFactory.getLogger(App.class);

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
```
## 三、去掉Servlet容器
最简单的方式是直接不引入 `spring-boot-starter-web`这个包，但是有时候我们又想使用 `RestTemplate` 等好用的工具，可以这样配置单独去掉 `Tomcat`。
```xml
 <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
            <!-- 去除内嵌tomcat -->
            <exclusions>
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-tomcat</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
```
## 四、后记
去掉不用的功能后启动时间极具缩短，同时还能享受 Spring 的福利，美滋滋。
```
2020-10-23 17:28:37.923  INFO 260 --- [           main] com.juyuansoft.buildcloud.iot14.App      : Starting App on DESKTOP-U21EBB6 with PID 260 (C:\jy\buildcloud-iots\buildcloud-iot-14\target\classes started by zhanghuan in C:\jy\buildcloud-iots\buildcloud-iot-14)
2020-10-23 17:28:37.930  INFO 260 --- [           main] com.juyuansoft.buildcloud.iot14.App      : No active profile set, falling back to default profiles: default
2020-10-23 17:28:39.409  INFO 260 --- [           main] o.s.s.c.ThreadPoolTaskScheduler          : Initializing ExecutorService 'taskScheduler'
2020-10-23 17:28:39.450  INFO 260 --- [           main] com.juyuansoft.buildcloud.iot14.App      : Started App in 1.987 seconds (JVM running for 2.702)
```
注意，去掉这些功能后，项目如何常驻就需要我们自己编写了。

---
title: SpringBoot配置动态数据源（可在运行时添加）
catalog: true
date: 2021-01-14 16:51:17
subtitle:
header-img:
tags: 数据库
categories: 数据库
---


## 一、前言

最近参与了一个大公司的wms项目，采用 SpringCloud 技术栈开发，公司国内国外有非常多的工厂，针对每个国家单独部署一套wms系统，大体的逻辑相通，只有个别调整。
项目的数据库是这样设计的，每个国家的所有人员信息存到一个库中，称为基础资料(base_info)库,每个国家的每个工厂单独启用一个数据库。
所以中国区的项目数据库结构类似这样：
```
base_info
db_0
db_1
db_2
db_sc
db_sd
...
```
但是项目中是这样做多数据源配置的：
- 首先在配置文件中配置国内所有的数据库信息；
- 为每个数据库配置创建一个数据源Bean；
- 创建一个动态数据源 Bean ，将上步创建的所有数据源注入到动态数据源中；
- 创建会话工厂 Bean、事务管理器 Bean；

项目在人员登录的时候做了配置，可以自动将数据源切换为人员对应的数据库上。

这里就产生了问题，国内那么多的工厂，需要配置那么多的数据库，并且手动配置那么多的数据源，虽然可以实现数据源切换，但是繁琐的配置比较费劲，所以我称之为此种配置方式为 “静态多数据源”。

## 二、动态多数据源

### 2.1 什么是动态多数据源

简单来说，可以在应用运行中，将数据源动态生成并可以切换使用。

### 2.2 动态多数据源好处

- 省去了创建大量的 Bean 的操作；
- 可以在运行时添加数据源；

## 三、动态多数据源的配置

废话不多说，直接上干货。

### 3.1 创建动态数据源

通过实现Spring提供的`AbstractRoutingDataSource`类，我们可以实现自己的数据源选择逻辑，从而可以实现数据源的动态切换。

```java
public class DynamicDataSource extends AbstractRoutingDataSource {

    @Value("${spring.datasource.default-db-key}")
    private String defaultDbKey;·

    @Override
    protected Object determineCurrentLookupKey() {
        String currentDb = DynamicDataSourceService.currentDb();
        if (currentDb == null) {
            return defaultDbKey;
        }
        return currentDb;
    }
}
```

### 3.2 创建动态数据源配置类

跟配置静态多数据源一样，需要手动配置下面的三个 Bean，只不过`DynamicDataSource`类的`targetDataSources`是空的。
```java
@Configuration
public class DynamicDataSourceConfig {
    /**
     * 动态数据源
     */
    @Bean
    public DynamicDataSource dynamicDataSource() {
        DynamicDataSource dataSource = new DynamicDataSource();
        Map<Object, Object> targetDataSources = new HashMap<>();
        dataSource.setTargetDataSources(targetDataSources);
        return dataSource;
    }

    /**
     * 会话工厂
     */
    @Bean
    public SqlSessionFactoryBean sqlSessionFactoryBean() throws IOException {
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        SqlSessionFactoryBean sqlSessionFactoryBean = new SqlSessionFactoryBean();
        sqlSessionFactoryBean.setDataSource(dynamicDataSource());
        sqlSessionFactoryBean.setConfiguration(configuration);
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        sqlSessionFactoryBean.setMapperLocations(resolver.getResources("classpath*:/repository/*.xml"));
        return sqlSessionFactoryBean;
    }

    /**
     * 事务管理器
     */
    @Bean
    public PlatformTransactionManager transactionManager() {
        return new DataSourceTransactionManager(dynamicDataSource());
    }
}
```

### 3.3 创建动态数据源服务类

这是一个比较核心的工具类,提供了一些静态方法从而可以实现一些功能，包括:
动态添加数据源、切换数据源、重置数据源、获取数据源。
在我们 3.1 中创建的 `DynamicDataSource` 类中，我们就是调用了 `DynamicDataSourceService` 类的 `switchDb`
方法实现的数据源选择。
通过查看下面的代码就能看出来使用线程本地的技术实现的多个请求数据源互不相干。
```java
public class DynamicDataSourceService {
    private static final Logger log = LoggerFactory.getLogger(DynamicDataSourceService.class);

    private static final Map<Object, Object> dataSources = new HashMap<>();
    private static final ThreadLocal<String> dbKeys = ThreadLocal.withInitial(() -> null);

    /**
     * 动态添加一个数据源
     *
     * @param name       数据源的key
     * @param dataSource 数据源对象
     */
    public static void addDataSource(String name, DataSource dataSource) {
        DynamicDataSource dynamicDataSource = App.context.getBean(DynamicDataSource.class);
        dataSources.put(name, dataSource);
        dynamicDataSource.setTargetDataSources(dataSources);
        dynamicDataSource.afterPropertiesSet();

        log.info("添加了数据源:{}",name);
    }

    /**
     * 切换数据源
     */
    public static void switchDb(String dbKey) {
        dbKeys.set(dbKey);
    }

    /**
     * 重置数据源
     */
    public static void resetDb() {
        dbKeys.remove();
    }

    /**
     * 获取当前数据源
     */
    public static String currentDb() {
        return dbKeys.get();
    }
}
```
至此，动态多数据源的配置就完成了，我们只需要编写数据源生成的逻辑，在程序运行时调用 `addDataSource` 方法即可将数据源动态添加到上下文中，并支持动态切换。

下面简单介绍一下基于配置文件的数据源生成。

## 四、数据源生成器

我自定义了一个数据源生成器接口用于定义动态生成数据源的要求。
```java
public interface DataSourceProvider {
    List<DataSource> provide();
}

```

然后编写了一个根据配置文件提供数据源并配置的实现类。
```java
@Component
@ConfigurationProperties(prefix = "spring.datasource.hikari")
public class YmlDataSourceProvider implements DataSourceProvider {

    private List<Map<String, DataSourceProperties>> dataSources;

    private DataSource buildDataSource(DataSourceProperties prop) {
        DataSourceBuilder<?> builder = DataSourceBuilder.create();
        builder.driverClassName(prop.getDriverClassName());
        builder.username(prop.getUsername());
        builder.password(prop.getPassword());
        builder.url(prop.getJdbcUrl());
        return builder.build();
    }

    @Override
    public List<DataSource> provide() {
        List<DataSource> res = new ArrayList<>();
        dataSources.forEach(map -> {
            Set<String> keys = map.keySet();
            keys.forEach(key -> {
                DataSourceProperties properties = map.get(key);
                DataSource dataSource = buildDataSource(properties);
                DynamicDataSourceService.addDataSource(key, dataSource);
            });
        });
        return res;
    }

    @PostConstruct
    public void init() {
        provide();
    }

    public List<Map<String, DataSourceProperties>> getDataSources() {
        return dataSources;
    }

    public void setDataSources(List<Map<String, DataSourceProperties>> dataSources) {
        this.dataSources = dataSources;
    }
}
```

看一下对应的配置文件内容：
```yml
spring:
  datasource:
    default-db-key: db0
    hikari:
      data-sources:
        - db0:
            jdbc-url: jdbc:mysql://47.96.172.163:3306/test
            username: admin
            password: 199711
            driver-class-name: com.mysql.cj.jdbc.Driver
        - db1:
            jdbc-url: jdbc:mysql://47.96.172.163:3306/test2
            username: admin
            password: 199711
            driver-class-name: com.mysql.cj.jdbc.Driver
```

这样就实现了应用启动时自动将配置文件中的数据源配置读取并生成数据源注册到上下文中。
当然也可以有其他的实现，比如从数据库读取并配置，或者通过接口请求的方式生成都可以，只要实现自己的 `DataSourceProvider` 就可以了。

## 五、后记

动态配置多数据源到这里就结束了，一些需要优化的地方可以自己修改，比如使用切面的形式将选择数据源的逻辑抽离等等。
借助 Spring 的生态，许多的工作都变得异常简单。
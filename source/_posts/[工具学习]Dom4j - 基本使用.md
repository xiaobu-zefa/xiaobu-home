---
title: '[工具学习]Dom4j - 基本使用'
categories: 工具学习
tags: 工具学习
excerpt: >-
  dom4j是一个Java的XML API，是jdom的升级品，用来读写XML文件的。dom4j是一个十分优秀的JavaXML
  API，具有性能优异、功能强大和极其易使用的特点，它的性能超过sun公司官方的dom技术，同时它也是一个开放源代码的软件，可以在SourceForge上找到它...
abbrlink: 4b463b58
date: 2018-03-15 00:00:00
---
## 一、maven依赖

```xml
<dependency>
    <groupId>org.apache.servicemix.bundles</groupId> 						<artifactId>org.apache.servicemix.bundles.dom4j</artifactId>   
	<version>1.6.1_5</version>
</dependency>
```

## 二、概述

**java中解析xml有两种方式：**

DOM解析：

将整个xml文档解析成Document对象放在内存中。

增，删，改，查都很方便，但是非常占用内存，一般用在服务器系统中。

SAX解析：

流式解析，存在一个指针，指针永远指向一行，每次指针向下移动，通过回调函数操作。

占用内存小，但是只能做查询，一般用在小内存机器，如手机中。

**java内置的xml解析方式：**

jaxp 方式。

这里使用的是第三方工具：Dom4j

## 核心类

**SAXReader**

```java
// 用来读取 xml 文件，生成 document 对象
SAXReader saxReader = new SAXReader();
```

**DocumentHelper**

```java
// 用来解析 xml 文本等
DocumentHelper
DocumentHelper.parseText("xml 字符串");
```

**Document**

```java
document 对象
```

**Element**

```java
element 对象，存在于 document 对象中
```

**XMLWriter**

```java
// 用来将 document 对象写入
XMLWriter xmlWriter = new XMLWriter();
```

## 三、操作

**获取 Document 对象**

```java
	/* SAXReader 读取 xml 文件*/
    @Test
    public void getDocByXMLFile() throws DocumentException {
        Document document = saxReader.read(FileUtil.getUrl("example.xml"));
        LOG.info("通过XML文件取得 Document 对象：" + document);
    }

    /* DocumentHelper 读取字符串为 Document */
    @Test
    public void getDocByXMLStr() throws DocumentException {
        Document document = DocumentHelper.parseText("<note>\n" +
                "    <to>George</to>\n" +
                "    <from>John</from>\n" +
                "    <heading>Reminder</heading>\n" +
                "    <body>Don't forget the meeting!</body>\n" +
                "</note>");
        LOG.info("通过 DocumentHelper 解析文本创建 Document 对象：" + document);
    }

    /* DocumentHelper 直接创建 Document 对象*/
    @Test
    public void getDocByCreate() {
        Document document = DocumentHelper.createDocument();
        LOG.info("通过 DocumentHelper 直接创建 Document 对象：" + document);
    }
```

**获取节点**

```java
	/* 获取节点 */
    @Test
    public void getNode(){
        // 获取根节点
        Element rootElm = document.getRootElement();
        // 获取节点下面的节点
        Element fromElm = rootElm.element("from");
        // 获取节点文字
        String fromElmText = fromElm.getText();
        LOG.info("from节点的文本： " + fromElmText);
        // 取得节点下面所有节点并进行遍历
        List<Element> headingElms = rootElm.elements("heading");
        LOG.info("root 下面 所有 heading 节点：");
        headingElms.forEach(val -> LOG.info(val.getText()));
        // 对节点下面的所有子节点进行遍历
        List<Element> elements = rootElm.elements();
        LOG.info("root 下面 所有节点：");
        elements.forEach(val -> LOG.info(val.getText()));
    }
```

**增加节点**

```java
	/* 增加节点 */
    @Test
    public void addNode() throws IOException {
        Element rootElm = document.getRootElement();
        Element extrasElm = rootElm.addElement("extras");
        extrasElm.setText("额外");
        XMLWriter xmlWriter = new XMLWriter(new FileOutputStream(new File("result.xml")));
        xmlWriter.write(document);
    }
```

**删除节点**

```java
	/* 删除节点 只删除一个，同名节点要全部删除需要用循环 */
    @Test
    public void removeNode() throws IOException {
        Element rootElm = document.getRootElement();
        Element extrasElm = rootElm.element("heading");
        Assert.assertNotNull(extrasElm);
        rootElm.remove(extrasElm);
        XMLWriter xmlWriter = new XMLWriter(new FileOutputStream(new File("result.xml")));
        xmlWriter.write(document);
    }
```


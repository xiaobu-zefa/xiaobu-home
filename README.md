# Hexo-Theme-LiveMyLife

> Ported Theme of [Hux Blog](https://github.com/Huxpro/huxpro.github.io), Thank [Huxpro](https://github.com/Huxpro) for designing such a flawless theme.
>
> 主题创建人 [Vincent](https://v-vincen.github.io/)， 从这里修改： [YenYuHsuan](https://github.com/YenYuHsuan/hexo-theme-beantech) ,并参考了主题 [dusign](https://github.com/dusign/hexo-theme-snail)、[Utone](https://github.com/shixiaohu2206/hexo-theme-huhu)。 感谢他们： [dusign](https://github.com/dusign/hexo-theme-snail)、[Utone](https://github.com/shixiaohu2206/hexo-theme-huhu).


## 仓库

Github Repo: https://github.com/V-Vincen/hexo-theme-livemylife

Gitee Repo:  https://gitee.com/V_Vincen/hexo-theme-livemylife


## [点击预览主题 ->]](https://v-vincen.github.io/)


![LiveMyLife Desktop](/source/_posts/Hexo-Theme-LiveMyLife/livemylife-desktop.png)

## 快速开始

可以根据下面的教程方便的自定义自己的博客。

### 安装 Node.js 和 Git

```shell
# Mac 电脑执行
brew install node
brew install git
```
> Windows: 下载 & 安装 Node.js. -> [Node.js](https://nodejs.org/zh-cn/download/)
>
> Windows: 下载 & 安装 Git. -> [Git](https://git-scm.com/download/win)

### 安装 Hexo

```shell
$ npm install -g hexo-cli
```
> 什么是 [Hexo](https://hexo.io/docs/)?
>
> Hexo 是一个快速，简单强力的博客框架，你可以用Markdown书写博客使用 Hexo 生成静态页面，Hexo 支持自定义主题。

### 初始化你的博客
```shell
$ hexo init blog
```
> 更多命令查看 -> [Hexo Commands](https://hexo.io/docs/commands)


## 主题的使用

### 初始化

```shell
cd blog
rm -rf _config.yml package.json scaffolds source themes yarn.lock # 只保留 node_modules
git clone https://github.com/V-Vincen/hexo-theme-livemylife.git
mv hexo-theme-livemylife/* ./
rm -rf hexo-theme-livemylife
npm install
```

### 设置主题
修改 `theme` 的值从配置文件  `_config.yml` 中：
```yml
#  Extensions
## Themes: https://hexo.io/themes/
## Plugins: https://hexo.io/plugins/
theme: livemylife
```

### 开启服务
```shell
hexo generate # or hexo g
hexo server   # or hexo s
```
开启一个本地服务，默认情况下, 访问地址为： `http://localhost:4000/`。
> 更多命令查看 -> [Hexo Commands](https://hexo.io/docs/commands)

## 配置
修改 `_config.yml` 的信息:

### 站点
用你自己的信息替换下面的内容：
```yml
# Site
title: Live My Life
subtitle: 淡而无味也是一种味道
author: Mr.Vincent
language: zh-CN
timezone:
```

### CDN 设置
JsDeliver 是一个灵活、自动化的免费开源 CDN。如果使用 Github Pages 部署，你可以配置 CDN 设置。本主题已经添加了 CDN 设置。点击这里查看如何使用 Jsdeliver：[免费 CDN 提速 Github 静态资源访问](https://v-vincen.github.io/2020/07/15/Github-%E5%8A%A0%E9%80%9F%E4%BC%98%E5%8C%96/#%E5%85%8D%E8%B4%B9-CDN-%E6%8F%90%E9%80%9F-Github-%E9%9D%99%E6%80%81%E8%B5%84%E6%BA%90%E8%AE%BF%E9%97%AE)
```yml
# CDN Setting
# Docs: https://www.jsdelivr.com/?docs=gh
# If Github Pages deploy，you can ues jsdelivr settings
#
jsdelivr:
  jsdelivr_url: https://cdn.jsdelivr.net/gh/
  github_username: V-Vincen
```

### 站点设置
添加自定义图片到你的目录：
```yml
# Site settings
SEOTitle: JavaDev | 一如Java深似海
email: hexo-theme-livemylife@mail.com
description: "It's an IT blog..."
keyword: "Java,v-vincen,v-vincen,livemylife,IT  blog,Blog"
header-img: img/header_img/newhome_bg.jpg
archives-img: img/header_img/archive_bg2.jpg
```

### 网站图标设置
```yml
favicon: img/avatar/favicon.jpg
```

### 图片签名设置
复制你的签名图到 `<root>/img/signature` 并且修改 `_config.yml`。
```yml
signature: true   # show signature
signature-img: img/signature/<your-signature>
```
> 怎么创建签名 -> [Free Online Signature](https://fontmeme.com/signature-fonts/)？

### Wave Settings
```yml
# Wave settings
wave: true
```
Example:

![wave](/source/_posts/Hexo-Theme-LiveMyLife/wave.png)


### SNS 设置
如果你不想显示，你可以删除下面的内容
```yml
# SNS settings
# RSS: true
github_username: V-Vincen
twitter_username: V_Vincen_
instagram_username: V_Vincen_
# facebook_username:  yourAccount
# linkedin_username:  yourAccount
# zhihu_username: yourAccount
weibo_username: WVincen
```

### 侧边栏设置
复制你的头像图片到 `<root>/img/avatar` 并且修改  `_config.yml`:
```yml
sidebar: true   # 是否启用侧边栏
sidebar-about-description: "I don't know where I am going ,but I am on my way..."
sidebar-avatar: img/avatar/vincnet.jpg    # use absolute URL, seeing it's used in both `/` and `/about/`
widgets:
- visitor   # busuanzi: https://busuanzi.ibruce.info/
- featured-tags
- short-about
- recent-posts
- friends-blog
- archive
- category

# widget behavior
## 归档
archive_type: 'monthly'
show_count: true

## 功能标签
featured-tags: true   # 是否启用
featured-condition-size: 0    # A tag will be featured if the size of it is more than this

## 友情链接
friends: [
    {
        title: "V_Vincen",
        href: "https://v-vincen.life/"
    },{
        title: "Teacher Ye",
        href: "http://teacherye.com/"
    }
]
```

### 评论设置
支持三种评论系统：

#### Gitalk
Gitalk 是一个流行的评论组件基于 GitHub Issue ，查看配置方法： [Gitalk](https://github.com/gitalk/gitalk) 
```yml
gitalk:
  owner:                          # 'GitHub repo owner'
  admin:                          # 'GitHub repo'
  repo:                           # ['GitHub repo owner and collaborators, only these guys can initialize github issues']
  clientID:                       # 'GitHub Application Client ID'
  clientSecret:                   # 'GitHub Application Client Secret'
  perPage: 10                     # Pagination size, with maximum 100.
  pagerDirection: last            # Comment sorting direction, available values are last and first.
  createIssueManually: false      # By default, Gitalk will create a corresponding github issue for your every single page automatically when the logined user is belong to the admin users. You can create it manually by setting this option to true
  language: en                    # Localization language key, en, zh-CN and zh-TW are currently available.
  maxCommentHeight: 250           # An optional number to limit comments' max height, over which comments will be folded.Default 250.
```

#### Gitment
Gitment 是一个基于  GitHub Issues 的评论组件,可以不使用任何后端代码实现评论。查看文档 [Gitment](https://github.com/imsun/gitment)；
```yml
gitment:
  owner:                          # Your GitHub ID. Required.
  repo:                           # The repository to store your comments. Make sure you're repo's owner. Required.
  client_id:                      # GitHub client ID. Required.
  client_secret:                  # GitHub client secret. Required.
  desc:                           # An optional description for your page, used in issue's body. Default ''.
  perPage: 10                     # An optional number to which comments will be paginated. Default 20.
  maxCommentHeight: 250           # An optional number to limit comments' max height, over which comments will be folded. Default 250.
```

#### Disqus
使用 Disqus 需要有代理支持
```yml
disqus_username: your-disqus-ID
```


### 数据分析设置
什么是数据分析？ Docs:[Analytics and Sitemap Settings](https://v-vincen.github.io/2020/07/21/Analytics-and-Sitemap-Settings/)
```yml
# Google Analytics
ga_track_id: UA-xxxxxx-xx   # Format: UA-xxxxxx-xx

# Baidu Analytics
ba_track_id: ba_track_id
```

### 网站地图设置
如何配置? -> Docs:[Analytics and Sitemap Settings](https://v-vincen.github.io/2020/07/21/Analytics-and-Sitemap-Settings/)
```yml
# Google sitemap
sitemap:
  path: sitemap.xml

# Baidu sitemap
baidusitemap:
  path: baidusitemap.xml

baidu_push: true
```


### 设置 icon 图标
在这里修改图片 `sourcre/css/images`.

### Post tag
定义是否显示 Post tag。
```yml
home_posts_tag: true
```
示例:

![home_posts_tag-true](/source/_posts/Hexo-Theme-LiveMyLife/home_posts_tag-true.png)


### Markdown render
My markdown render engine plugin is [hexo-renderer-markdown-it](https://github.com/celsomiranda/hexo-renderer-markdown-it).
```yml
# Markdown-it config
## Docs: https://github.com/celsomiranda/hexo-renderer-markdown-it/wiki
markdown:
  render:
    html: true
    xhtmlOut: false
    breaks: true
    linkify: true
    typographer: true
    quotes: '“”‘’'
```

### Anchorjs 设置
And if you want to change the header anchor '❡', you can go to `layout/_partial/anchorjs.ejs` to change it. How to use anchorjs, see [AnchorJS](https://www.bryanbraun.com/anchorjs/#examples) for detailed examples.
```yml
# Anchorjs Settings
anchorjs: true    # if you want to customize anchor. check out line:26 of `layout/_partial/anchorjs.ejs`
```

```javascript
async("//cdn.bootcss.com/anchor-js/1.1.1/anchor.min.js",function(){
        anchors.options = {
          visible: 'hover',
          placement: 'left',
          icon: '❡'
          // icon: 'ℬ'
        };
        anchors.add().remove('.intro-header h1').remove('.subheading').remove('.sidebar-container h5');
    })
```

### 文章置顶功能
```yml
# article top
top: true
```
实现了文章排序功能，只需要使用 `top: number` 定义文章顺序，999 的话会被置顶。

### WordCount Settings
A Word Count Plugin for Hexo. See [WordCount](https://github.com/willin/hexo-wordcount) for detailed configuration method.
```yml
# Dependencies: https://github.com/willin/hexo-wordcount
# Docs: https://www.npmjs.com/package/hexo-wordcount
wordcount: true
```

### Top scroll progress
```yml
# top scroll progress
scroll: true
```

### Tip
```yml
tip:
  enable: true
  copyright: Say what you think...
```

### Social Share Post
```yml
#Docs: https://github.com/overtrue/share.js
share: true
```

### Viewer Config
Viewer is a simple jQuery image viewing plugin. Let us first look at a [demo](https://fengyuanchen.github.io/viewer/). See [Viewer](https://github.com/fengyuanchen/viewer) for detailed configuration. If you want to modify the [options](https://github.com/fengyuanchen/viewerjs#options) of Viewer, you can go to `sourcre/js/viewer/pic-viewer.js` to change it.
```yml
# Viewer config
viewer: true
```

### Theme Color Config
Hexo-Theme-LiveMyLife temporarily supports two themes color.
```yml
themecolor: true
```
Light theme preview：
![light theme](/source/_posts/Hexo-Theme-LiveMyLife/light.png)

Dark theme preview：
![dark theme](/source/_posts/Hexo-Theme-LiveMyLife/dark.png)


### Search Settings
```yml
# Dependencies: https://github.com/V-Vincen/hexo-generator-zip-search
search:
  enable: true
  path: search.json
  zipPath: search.flv
  versionPath: searchVersion.json
  field: post
  # if auto, trigger search by changing input
  # if manual, trigger search by pressing enter key or search button
  trigger: auto
  # show top n results per article, show all results by setting to -1
  top_n_per_article: 1
```

### Gitter
Gitter is a chat and network platform that helps manage, develop and connect communities through messages, content and discovery.See [Gitter](https://gitter.im/) for detailed configuration method.
```yml
## Docs:https://gitter.im/?utm_source=left-menu-logo
##
gitter:
  room: your-community/your-room
```

### Deployment
Replace to your own repo!
```yml
deploy:
  type: git
  repo: https://github.com/<yourAccount>/<repo> # or https://gitee.com/<yourAccount>/<repo>
  branch: <your-branch>
```

## Hexo Basics

Some hexo command:

```bash
hexo new post "<post name>"   # you can change post to another layout if you want
hexo clean && hexo generate   # generate the static file
hexo server   # run hexo in local environment
hexo deploy   # hexo will push the static files automatically into the specific branch(gh-pages) of your repo!
```

## Have fun ^\_^

Please [Star](https://github.com/V-Vincen/hexo-theme-livemylife) this Project if you like it! [Follow](https://github.com/V-Vincen) would also be appreciated! Peace!

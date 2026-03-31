## 我的造轮子计划

### 第一阶段：搭建主题骨架
我们会在你的 themes 目录下新建一个文件夹（比如叫 themes/my-theme），并在里面创建最基础的 Hexo 主题结构：

- _config.yml (你的主题配置文件)
- layout/ (存放 HTML/EJS 模板)
    - layout.ejs (全局基础框架，也就是左中右的坑位)
    - index.ejs (首页文章列表)
    - post.ejs (文章详情页)
- source/ (存放静态资源)
    css/style.css (我们写排版和样式的地方)

### 第二阶段：构建“左中右”神级布局
抛弃以前复杂的浮动（float），我会直接给你写一套基于 CSS Grid 的响应式代码。  
- 电脑端：完美呈现 Left (20%) - Middle (60%) - Right (20%) 的经典比例。
- 平板/手机端：自动折叠成单列流式布局，保证移动端阅读体验。

### 第三阶段：注入 Hexo 灵魂数据
我会教你如何在 EJS 模板里使用 Hexo 的变量（比如 <%- page.title %>、<%- page.content %>），把你的 Markdown 文章、标签、分类精准地填入对应的栏目中。

# Hexo Theme: Zebin-Theme 🖋️

![Hexo Version](https://img.shields.io/badge/Hexo->=7.0-blue.svg)
![Layout](https://img.shields.io/badge/Layout-CSS_Grid-orange.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

> **“保持热爱，奔赴山海。”**
>
> 这是一个基于 Hexo 构建的极简、沉浸式、响应式三栏博客主题。设计灵感来源于诸多优秀的独立博客（如喵神 OneV's Den），旨在提供最赏心悦目的中文阅读体验与功能扩展性。

## ✨ 核心特性 (Features)

* **📐 现代三栏布局**：基于原生的 `CSS Grid` 构建 `Left(200px) - Center(1fr) - Right(220px)` 的经典比例，配合 `1350px` 最大宽度，视野更开阔。
* **📱 完美响应式**：移动端自动折叠为单列流式布局，保证手机端的极佳阅读体验。
* **📖 沉浸式排版**：原生接入**思源宋体 (Noto Serif SC)**，提供纸质书级别的中文排版质感。
* **💻 极客代码高亮**：内置 `Atom One Dark` 深色代码高亮方案，搭配精致的 Mac 风格横向滚动条。
* **🛠️ 智能右侧挂件**：
    * **TOC 目录**：文章详情页专属，自动提取标题，滚动吸附。
    * **标签云**：根据热度自动生成大小不一、渐变配色的动态标签。
    * **日历**：极简设计的当月日历，高亮当前日期。
* **🗂️ 无限流归档页**：摒弃传统分页，按年份规整排列的“瀑布流”归档，搭配精美的虚线下划线。
* **🤝 专属友链网格**：读取本地 `YAML` 数据，自动生成带悬浮动效的友链卡片墙。

---

## 🚀 安装与启用 (Installation)

1. **获取主题**
   将本主题文件夹（`Zebin-Theme`）放入你 Hexo 根目录的 `themes/` 文件夹下。

2. **启用主题**
   打开 Hexo 根目录的 `_config.yml`，修改 `theme` 字段：
   ```yaml
   theme: Zebin-Theme
   ```

## ⚙️ 核心配置 (Configuration)
1. 全局配置 (Hexo 根目录 _config.yml)  
开启代码高亮：  
为了确保 Atom One Dark 样式生效，请确保你的代码高亮引擎配置如下：
``` yaml
syntax_highlighter: highlight.js
highlight:
  enable: true
  line_number: true
  auto_detect: true
  wrap: true
  hljs: true    # 必须为 true，以输出标准 class 类名
prismjs:
  enable: false
#开启归档无限瀑布流：
archive_generator:
  per_page: 0   # 0 表示归档页不分页
  yearly: true
  monthly: true
```

2. 主题配置 (主题目录 _config.yml)  
请在 themes/Zebin-Theme/_config.yml 中配置你的个人信息和左侧菜单：  
``` yaml
# 个人头像路径 (存放在 source/img/ 下)
avatar: /img/avatar.png

# 左侧导航菜单及路径
menu:
  首页: /
  归档: /archives
  友链: /links
  关于: /about
  番茄钟定时器: /pomodoro
  2048小游戏: /smallgame/2048
  恶作剧: /smallgame/trick

# 菜单对应的 Emoji 图标
menu_icons:
  首页: 🏠
  归档: 🗂️
  友链: 🤝
  关于: 🙋‍♂️
  番茄钟定时器: 🍅
  2048小游戏: 🎮
  恶作剧: 🤡
```

## 📄 独立页面指南 (Custom Pages)
1. 友情链接页面 (/links)
- 在 Hexo 根目录运行 hexo new page links。

- 将 source/links/index.md 的 layout 设置为 links：
```yaml
---
title: 友情链接
layout: links
---
```

- 在 Hexo 根目录新建 source/_data/links.yml，按照以下格式添加你的好友：
```yaml
- name: 某某的博客
  url: [https://example.com](https://example.com)
  avatar: [https://example.com/avatar.jpg](https://example.com/avatar.jpg)
  description: 这是一句很酷的网站签名。
```

2. 独立应用页面 (如 2048、恶作剧等)
如果你想在博客里嵌入纯静态的 HTML 页面（如游戏或定时器），并希望它们不被套用博客的头部和侧边栏：

在页面的头部 Front-matter 中加入 layout: false。

极度重要：必须在 HTML 的 <head> 标签中显式声明 <meta charset="UTF-8">，否则中文字符将显示为乱码！

## 👨‍💻 作者与鸣谢 (Credits)
Author: [Zebin Gao / Zebin-Theme]

Inspiration: 感谢 喵神 OneV's Den 极简优雅的布局启发，以及 Diaspora 主题 带来的创作契机。

Fonts: 本主题推荐使用 Google Fonts 提供的 Noto Serif SC (思源宋体)。
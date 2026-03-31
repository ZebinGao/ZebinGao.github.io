[![Hexo Deploy](https://github.com/ZebinGao/ZebinGao.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/ZebinGao/ZebinGao.github.io/actions/workflows/deploy.yml)
# 🏠 Zebin Gao's Personal Blog (数字花园)

![Framework](https://img.shields.io/badge/Framework-Hexo_7.0+-blue.svg)
![Theme](https://img.shields.io/badge/Theme-Zebin--Theme-orange.svg)
![Hosted](https://img.shields.io/badge/Hosted-GitHub_Pages-black.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

> **“保持热爱，奔赴山海。”**

欢迎来到我的个人博客源码仓库！这里是我记录技术沉淀、生活随笔的“数字花园”，同时也是我折腾前端、部署各种好玩工具的线上“实验室”。

🌐 **在线访问地址**：[https://zebingao.github.io](https://zebingao.github.io)

---

## 👨‍💻 关于我与博客内容 (About)

我是一名开发者，博客内容主要聚焦于以下领域：
* **💻 编程技术**：涵盖 C#、WPF、MongoDB 等后端与客户端技术栈。
* **🛠️ 架构与调优**：工业软件开发、架构解析、性能优化（如 Visual Studio 诊断工具避坑、内存泄漏排查实战）。
* **📝 日子与杂记**：生活随笔、读书笔记、以及那些“未能公开的文章”背后的思考。

---

## 🎨 博客主题 (Theme)

本站没有使用任何市面上的现成模板，而是由我基于 Hexo 从零手写构建的专属主题 —— **[Zebin-Theme]**。

* **极致排版**：采用现代化的 CSS Grid 三栏布局，引入思源宋体 (Noto Serif SC) 提供纸质书级别的阅读体验。
* **定制功能**：支持文章 TOC 目录吸附、标签云、日历组件，以及无缝滚动的“瀑布流”归档页。
* **极客高亮**：深度定制了 Atom One Dark 代码高亮主题与 Mac 风格滚动条。

如果你对这个主题的源码感兴趣，可以查看 `themes/Zebin-Theme` 目录。

---

## 🕹️ 实验室与隐藏彩蛋 (Easter Eggs)

博客不仅仅是用来阅读的，我还在这里藏了一些有趣的小工具：
* 🍅 **[番茄钟定时器](/pomodoro)**：沉浸式工作的好帮手。
* 🎮 **[2048 小游戏](/smallgame/2048)**：摸鱼必备，挑战一下你的大脑。
* 🤡 **[谢益辉的恶作剧](/smallgame/trick)**：愚人节专属，点开有“惊喜”。

---

## 🚀 部署与运行 (Development)

如果你是这台电脑的新主人（或者就是换了新电脑的我本人），请按照以下步骤让博客重新跑起来：

### 1. 环境准备
确保电脑已安装 [Git](https://git-scm.com/) 和 [Node.js](https://nodejs.org/)。

### 2. 克隆仓库与安装依赖
```bash
# 拉取源码
git clone [https://github.com/ZebinGao/ZEBINGAO.GITHUB.IO.git](https://github.com/ZebinGao/ZEBINGAO.GITHUB.IO.git)

# 进入目录
cd ZEBINGAO.GITHUB.IO

# 安装 Hexo 运行所需的全部依赖
npm install
```
### 3. 本地预览
``` bash
# 清除缓存并启动本地服务器
hexo clean && hexo server
```
打开浏览器访问 http://localhost:4000 即可预览效果。

### 4. 撰写与发布
``` bash
# 新建文章
hexo new "你的文章标题"

# 编译并一键部署到 GitHub Pages
hexo clean && hexo generate --deploy
```

## 🤝 友情链接 (Links)
如果你也是喜欢折腾独立博客的朋友，欢迎fork和点赞！
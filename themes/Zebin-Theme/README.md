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
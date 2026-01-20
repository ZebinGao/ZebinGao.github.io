[![Hexo Deploy](https://github.com/ZebinGao/ZebinGao.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/ZebinGao/ZebinGao.github.io/actions/workflows/deploy.yml)
# hexo new 文章标题
- hexo new 如何在hexo博客写作
- hexo new 文章标题 --path 路径/文件名.md
- 或者可以简写一下
- hexo new 文章标题 -p 路径/文件名.md
- hexo new "如何在hexo博客写作" -p 计算机科学/博客/如何在hexo博客写作.md
- tips：如果不设置路径的话，新建文章是默认存储在\source\_posts\这个路径下的。
- tips：一般在标题下有空格或者其他字符要给标题加上双引号
```
hexo clean
hexo g
hexo d
```
- 逐步输入以上三条指令，执行完再输入下一条
- 或者一次性输入三条也是可以的，但新手还不建议一次性输入，前期部署可能有时候容易出错
hexo clean && hexo g && hexo d
- 部署完了看一下窗口没有出现报错就可以去博客刷新一下内容了，一般需要几分钟才更新内容

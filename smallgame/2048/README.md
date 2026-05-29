# 2048
A small clone of [1024](https://play.google.com/store/apps/details?id=com.veewo.a1024), based on [Saming's 2048](http://saming.fr/p/2048/) (also a clone). 2048 was indirectly inspired by [Threes](https://asherv.com/threes/).

Made just for fun. [Play it here!](http://gabrielecirulli.github.io/2048/)

The official app can also be found on the [Play Store](https://play.google.com/store/apps/details?id=com.gabrielecirulli.app2048) and [App Store!](https://itunes.apple.com/us/app/2048-by-gabriele-cirulli/id868076805)

### Contributions

[Anna Harren](https://github.com/iirelu/) and [sigod](https://github.com/sigod) are maintainers for this repository.

Other notable contributors:

 - [TimPetricola](https://github.com/TimPetricola) added best score storage
 - [chrisprice](https://github.com/chrisprice) added custom code for swipe handling on mobile
 - [marcingajda](https://github.com/marcingajda) made swipes work on Windows Phone
 - [mgarciaisaia](https://github.com/mgarciaisaia) added support for Android 2.3

Many thanks to [rayhaanj](https://github.com/rayhaanj), [Mechazawa](https://github.com/Mechazawa), [grant](https://github.com/grant), [remram44](https://github.com/remram44) and [ghoullier](https://github.com/ghoullier) for the many other good contributions.

### Screenshot

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/1175750/8614312/280e5dc2-26f1-11e5-9f1f-5891c3ca8b26.png" alt="Screenshot"/>
</p>

That screenshot is fake, by the way. I never reached 2048 :smile:

## Contributing
Changes and improvements are more than welcome! Feel free to fork and open a pull request. Please make your changes in a specific branch and request to pull into `master`! If you can, please make sure the game fully works before sending the PR, as that will help speed up the process.

You can find the same information in the [contributing guide.](https://github.com/gabrielecirulli/2048/blob/master/CONTRIBUTING.md)

## License
2048 is licensed under the [MIT license.](https://github.com/gabrielecirulli/2048/blob/master/LICENSE.txt)

## Donations
I made this in my spare time, and it's hosted on GitHub (which means I don't have any hosting costs), but if you enjoyed the game and feel like buying me coffee, you can donate at my BTC address: `1Ec6onfsQmoP9kkL3zkpB6c5sA4PVcXU2i`. Thank you very much!

---

## 文件分析：2048 游戏

以下是对 2048-master 文件夹中文件进行的分析，以区分运行游戏所必需的文件和多余的文件。

### 运行游戏所必需的文件：

*   `index.html`：游戏的入口点，加载所有其他资源。
*   `favicon.ico`：网站在浏览器标签页或收藏夹中显示的图标。
*   `style/main.css`：主样式表，定义了游戏界面的视觉呈现。
*   `style/fonts/clear-sans.css`：由 `main.css` 导入的字体样式表，定义了游戏使用的 Clear Sans 字体。
*   `style/fonts/ClearSans-Bold-webfont.eot`：Clear Sans 粗体字体的 EOT 格式（用于旧版 IE 浏览器）。
*   `style/fonts/ClearSans-Bold-webfont.svg`：Clear Sans 粗体字体的 SVG 格式（用于旧版 iOS）。
*   `style/fonts/ClearSans-Bold-webfont.woff`：Clear Sans 粗体字体的 WOFF 格式（现代浏览器）。
*   `style/fonts/ClearSans-Light-webfont.eot`：Clear Sans 细体字体的 EOT 格式。
*   `style/fonts/ClearSans-Light-webfont.svg`：Clear Sans 细体字体的 SVG 格式。
*   `style/fonts/ClearSans-Light-webfont.woff`：Clear Sans 细体字体的 WOFF 格式。
*   `style/fonts/ClearSans-Regular-webfont.eot`：Clear Sans 常规字体的 EOT 格式。
*   `style/fonts/ClearSans-Regular-webfont.svg`：Clear Sans 常规字体的 SVG 格式。
*   `style/fonts/ClearSans-Regular-webfont.woff`：Clear Sans 常规字体的 WOFF 格式。
*   `js/animframe_polyfill.js`：提供 `requestAnimationFrame` 的兼容性填充，用于平滑动画。
*   `js/application.js`：游戏的初始化和主应用程序逻辑。
*   `js/bind_polyfill.js`：提供 `Function.prototype.bind` 的兼容性填充。
*   `js/classlist_polyfill.js`：提供 `Element.prototype.classList` 的兼容性填充。
*   `js/game_manager.js`：管理游戏的核心逻辑，如移动、合并和分数。
*   `js/grid.js`：处理游戏网格的结构和方块位置。
*   `js/html_actuator.js`：负责将游戏状态（如方块移动、分数更新）渲染到 HTML 界面。
*   `js/keyboard_input_manager.js`：处理用户的键盘输入，将其转换为游戏操作。
*   `js/local_storage_manager.js`：管理游戏数据（如最高分、当前游戏状态）在浏览器本地存储中的保存和加载。
*   `js/tile.js`：定义游戏中的单个数字方块对象及其属性。
*   `meta/apple-touch-icon.png`：用于 Apple 设备主屏幕图标。
*   `meta/apple-touch-startup-image-640x920.png`：用于 Apple 设备启动屏幕图像（640x920 分辨率）。
*   `meta/apple-touch-startup-image-640x1096.png`：用于 Apple 设备启动屏幕图像（640x1096 分辨率）。

### 多余文件（非运行游戏所必需）：

*   `.gitignore`：Git 版本控制系统使用的文件，指定哪些文件或目录应被忽略。
*   `.jshintrc`：JSHint 的配置文件，一个 JavaScript 代码质量工具，用于在开发过程中检查代码。
*   `CONTRIBUTING.md`：包含项目贡献指南的 Markdown 文件。
*   `LICENSE.txt`：项目的许可证信息。
*   `Rakefile`：Ruby Rake 构建自动化工具的配置文件，用于自动化开发任务。
*   `README.md`：项目的说明文件，您正在阅读的这个文件。
*   `style/helpers.scss`：Sass 辅助样式文件，通常包含可重用的 mixin 或变量，用于开发 `main.scss`。
*   `style/main.scss`：Sass 源文件，`style/main.css` 是其编译后的结果。

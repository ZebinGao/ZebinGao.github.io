---
title: Android 滑动翻页失效
date: 2026-06-30 21:40:00
categories: 技术笔记
tags: [Android, MAUI, 滑动翻页]
---

# Android 滑动翻页失效排查记录

> 日期：2026-06-26
> 涉及文件：[ReaderPage.xaml](ReadingTool/Views/ReaderPage.xaml)、[ReaderPage.xaml.cs](ReadingTool/Views/ReaderPage.xaml.cs)
> 平台：.NET MAUI 9.0.120 / net9.0-android（SDK 35，TargetSdk 34，Redmi K70 Pro）

## 一、现象

手机端阅读界面**左右滑动无法翻页**（"试了一天没效果"）。但底部工具栏的「◀ 上页 / 下页 ▶」按钮翻页正常。

> 关键信号：按钮和滑动绑的是**同一个** `NextPageCommand` / `PreviousPageCommand`。按钮能用 → Command 逻辑没问题；滑动不行 → 问题在手势识别层。

## 二、原本的实现

翻页手势写在 [ReaderPage.xaml](ReadingTool/Views/ReaderPage.xaml)，用的是 `SwipeGestureRecognizer`，挂在 canvas 区域的**外层 `Grid`** 上：

```xml
<!-- Canvas area -->
<Grid Grid.Row="1">
    <Grid.GestureRecognizers>
        <!-- 左滑（手指向左）→ 下页；右滑（手指向右）→ 上页 -->
        <SwipeGestureRecognizer Direction="Left" Command="{Binding NextPageCommand}"/>
        <SwipeGestureRecognizer Direction="Right" Command="{Binding PreviousPageCommand}"/>
    </Grid.GestureRecognizers>

    <GraphicsView x:Name="ReaderCanvas"/>
</Grid>
```

而 `NextPage` / `PreviousPage` 的命令实现在 [ReaderViewModel.cs](ReadingTool/ViewModels/ReaderViewModel.cs) 里（基于“前一页/当前页/后一页”三页缓存 + 偏移推进），逻辑健全、可被按钮正常触发。

## 三、排查过程

### 1. 第一层根因：SwipeGestureRecognizer 被 GraphicsView 吞掉

阅读界面是自定义绘制：`Grid` 里只有一个 `GraphicsView`（填满整个 Grid），由 `ReaderDrawable` 负责画字。

**问题**：`GraphicsView` 在 Android 上的平台控件会消费（`return true`）所有触摸事件，用来触发它自己那套交互回调（`StartInteraction` 等）。一旦触摸事件被它消费掉，挂在**父容器**上的 `SwipeGestureRecognizer` 就再也收不到手势 —— 于是滑动毫无反应。

这是 MAUI 的已知交互问题（[dotnet/maui#18417](https://github.com/dotnet/maui/issues/18417)：GraphicsView 的 interactions 与 gestures 不能同时工作，Android 上尤其明显）。

**结论**：`SwipeGestureRecognizer` 挂在父 `Grid` 上这条路在 Android 走不通。要换成 `GraphicsView` 自身的交互事件 —— 那是它消费触摸后**保证会触发**的回调，是 Android 上唯一可靠的触摸入口。

### 2. 第一次修复尝试（踩坑）：用了 `TouchEventArgs.Points`

把手势改成交互事件，code-behind 订阅：

```csharp
ReaderCanvas.StartInteraction += OnStartInteraction;
ReaderCanvas.DragInteraction += OnDragInteraction;
ReaderCanvas.EndInteraction += OnEndInteraction;
```

然后在处理函数里按记忆取触摸点坐标：

```csharp
private void OnStartInteraction(object? sender, TouchEventArgs e)
{
    if (e.Points.Length == 0) return;   // ❌ 编译报错
    ...
}
```

**编译失败**：

```
ReaderPage.xaml.cs(37,15): error CS1061: 'TouchEventArgs' does not contain a definition
for 'Points' and no accessible extension method 'Points' ...
```

### 3. `Points` 到底存不存在 —— 一连串环境踩坑

我的第一反应是 **using 命名空间冲突**（解析到了另一个同名 `TouchEventArgs`）。于是把签名改成全限定名再编译：

```csharp
private void OnStartInteraction(object? sender, Microsoft.Maui.Controls.TouchEventArgs e)
```

**仍然报 `Points` 不存在**。全限定名排除了命名空间歧义 → 结论变成：**MAUI 9.0.120 的 `TouchEventArgs` 真的没有 `Points` 属性**，文档（net-maui-10.0）和实际安装版本对不上。

于是想去实际程序集里读真实成员。但这个环境一路不顺：

- **想用 `MetadataReader` 精确读**：写了 PowerShell 脚本，但本机是 Windows PowerShell 5.1，没有内置 `System.Reflection.Metadata`（`Add-Type` 报 `ASSEMBLY_NOT_FOUND`）。
- **想换 PowerShell 7（`pwsh`）**：没装，`command -v pwsh` → `NO_PWSH`。
- **想建个最小 net9.0 控制台项目用 `MetadataReader`**：被否（不想为排查建一堆项目文件）。

最后用**最朴素的 `grep` 直接抠 dll 元数据里的标识符**（零依赖，git bash 自带）：

```bash
dll="/c/Users/admin/.nuget/packages/microsoft.maui.controls.core/9.0.120/lib/net9.0/Microsoft.Maui.Controls.dll"
grep -aoE '[A-Za-z][A-Za-z0-9_]+' "$dll" | grep -iE 'touch|points' | sort -u
```

输出里出现了：

```
TouchEventArgs
get_Points          ← 别的类型上的，不归 TouchEventArgs
set_Points
get_Touches          ← 这个才像是 TouchEventArgs 的
set_Touches
get_TouchPoints
...
```

`Points` 确实在 dll 里（属于别的类型），而 `TouchEventArgs` 自身的触摸点集合属性是 **`Touches`**。再交叉查 [TouchEventArgs 官方文档](https://learn.microsoft.com/en-us/dotnet/api/microsoft.maui.controls.toucheventargs) 得到确认：

> MAUI 9.0：`Touches` 返回 `PointF[]`；构造函数 `TouchEventArgs(PointF[] touches, bool isInsideBounds)`。

> ⚠️ `Touches` 在 9.0 是 `PointF[]`（用 `.Length` / `[0]`），10.0 起改为 `IReadOnlyList<PointF>`（用 `.Count`）。本项目锁 9.0.120，用数组写法。

### 4. 第二层隐患：GraphicsView 在 Android 的默认尺寸

在查 API 的同时，搜到一条关键经验（[SO 79018287](https://stackoverflow.com/questions/79018287)）：

> `GraphicsView` 在 Android 上默认 `WidthRequest`/`HeightRequest` 为 **-1**，会导致它不渲染、也不接收触摸事件，`StartInteraction` 不触发。

也就是说，**即使把手势方式改对了，如果 `GraphicsView` 尺寸不对，Android 上照样收不到触摸**。必须确保它占满 canvas 行、有有效尺寸。

## 四、最终修复

### ReaderPage.xaml.cs —— 用交互事件判定方向

[完整文件](ReadingTool/Views/ReaderPage.xaml.cs)，核心：

```csharp
// 滑动翻页追踪
private float? _downX;
private float? _downY;
private float _lastX, _lastY;
private bool _tracking;
private const float SwipeThreshold = 50f;

public ReaderPage(ReaderViewModel viewModel)
{
    InitializeComponent();
    _viewModel = viewModel;
    BindingContext = _viewModel;

    // GraphicsView 的交互事件：Android 上唯一可靠的触摸入口
    ReaderCanvas.StartInteraction += OnStartInteraction;
    ReaderCanvas.DragInteraction += OnDragInteraction;
    ReaderCanvas.EndInteraction += OnEndInteraction;
}

private void OnStartInteraction(object? sender, TouchEventArgs e)
{
    if (e.Touches.Length == 0) return;
    _downX = e.Touches[0].X;
    _downY = e.Touches[0].Y;
    _lastX = _downX.Value;
    _lastY = _downY.Value;
    _tracking = true;
}

private void OnDragInteraction(object? sender, TouchEventArgs e)
{
    if (!_tracking || e.Touches.Length == 0) return;
    _lastX = e.Touches[0].X;
    _lastY = e.Touches[0].Y;
}

private void OnEndInteraction(object? sender, TouchEventArgs e)
{
    if (!_tracking || _downX == null) { _tracking = false; return; }

    float dx = _lastX - _downX.Value;
    float dy = _lastY - _downY.Value;
    _tracking = false;

    // 仅“水平为主的明显滑动”才算翻页：忽略轻点和纵向拖动
    if (Math.Abs(dx) < SwipeThreshold) return;
    if (Math.Abs(dx) < Math.Abs(dy)) return;

    if (dx < 0)
        _viewModel.NextPageCommand.Execute(null);     // 手指向左 → 下页
    else
        _viewModel.PreviousPageCommand.Execute(null); // 手指向右 → 上页
}
```

判定逻辑要点：
- `StartInteraction` 记下按下点，`DragInteraction` 持续更新“最后位置”（比只看 `EndInteraction` 的 `e.Touches` 更稳，避免抬起时坐标丢失）。
- 抬起时算总位移 `dx/dy`。
- **三个过滤**：位移 < 50px（轻点）忽略；水平位移 < 垂直位移（主要是纵向拖动）忽略；最后才按 `dx` 正负定方向。
- 复用已有的 `NextPageCommand` / `PreviousPageCommand`，按钮和滑动行为完全一致。

### ReaderPage.xaml —— 移除 Swipe，确保 GraphicsView 填满

```xml
<!-- Canvas area。
     翻页手势改由 GraphicsView 自身的交互事件实现（见 ReaderPage.xaml.cs）。
     原来的 SwipeGestureRecognizer 挂在父 Grid 上，但 GraphicsView 在
     Android 上会吞掉触摸事件，导致 Swipe 永远不触发——这就是手机端
     左右滑动无法翻页的根因。 -->
<Grid Grid.Row="1">
    <GraphicsView x:Name="ReaderCanvas"
                  HorizontalOptions="Fill" VerticalOptions="Fill"/>
```

`HorizontalOptions="Fill" VerticalOptions="Fill"` 解决第二层隐患，保证 `GraphicsView` 在 Android 上占满 canvas 行、能正常接收触摸。

## 五、构建与产物

构建命令（Release / Android）：

```bash
dotnet build ReadingTool/ReadingTool.csproj -c Release -f net9.0-android
```

> ⚠️ **坑**：Android 的 `BuildApk` 任务把临时文件 rename 成最终 APK 时，若旧 APK 被 .NET build-server / VS 锁住，会报
> `XABBA7000: Xamarin.Tools.Zip.ZipException: Renaming temporary file failed: Permission denied`。
> 编译本身已成功（无 `error CS`），只是打包阶段卡住。
> **解法**：先 `dotnet build-server shutdown` 释放锁，删掉 `bin/Release/net9.0-android/*.apk`，再重建。

产物：`ReadingTool/bin/Release/net9.0-android/com.readingtool.app-Signed.apk`（~55.9 MB，签名沿用默认 debug keystore，可覆盖安装）。

## 六、关键要点 / 经验总结

1. **MAUI 触摸事件层级**：`SwipeGestureRecognizer` / `TapGestureRecognizer` 挂在父容器上，子元素若是 `GraphicsView` 会被吞触摸。**给 `GraphicsView` 自己用 `StartInteraction`/`DragInteraction`/`EndInteraction` 交互事件，是 Android 上唯一可靠的触摸来源。**

2. **API 以实际安装的 dll 为准**：MAUI 不同大版本（9.0 vs 10.0）的 `TouchEventArgs` 属性名从 `Points` 变成了 `Touches`（且类型从 `PointF[]` 变 `IReadOnlyList<PointF>`）。文档可能滞后，**以 NuGet 包里的 dll 为准**。

3. **没好工具时，grep dll 元数据能救命**：环境里 `pwsh`、`ildasm`、`MetadataReader`（5.1 内置版）都不可用时，
   ```bash
   grep -aoE '[A-Za-z][A-Za-z0-9_]+' "<package>/lib/<tfm>/<asm>.dll" | grep <keyword> | sort -u
   ```
   能快速抠出类型/方法/属性名，足够判断 API 是否存在。（局限：看不出成员归属哪个类型，必要时再用 `MetadataReader` 精读。）

4. **GraphicsView 在 Android 的尺寸坑**：默认 `-1` 会导致不收触摸。给 `Fill` 或显式尺寸。

5. **Build-server 文件锁**：Android Release 重新打包 APK 前若报 `Permission denied`，`dotnet build-server shutdown` + 删旧 APK 再重建。

## 七、参考资料

- [TouchEventArgs Class — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/api/microsoft.maui.controls.toucheventargs)
- [GraphicsView — .NET MAUI — Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/maui/user-interface/controls/graphicsview)
- [C# MAUI Event GraphicsView StartInteraction not working — Stack Overflow](https://stackoverflow.com/questions/79018287/c-sharp-maui-event-graphicsview-startinteraction-not-working)
- [GraphicsView interactions and gestures stop working together — dotnet/maui#18417](https://github.com/dotnet/maui/issues/18417)

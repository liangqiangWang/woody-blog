---
name: OpenCode VSCode 插件
desc: 在 VSCode 侧边栏嵌入 OpenCode 的 Web 模式，支持多种模式切换，不离开编辑器也能使用 AI 编程。
icon: code
tags: [OpenCode, VSCode, AI编程]
accent: '#0066b8'
kind: doc
---

## 这是什么

OpenCode 是 Claude Code 的开源平替，TUI、桌面端、Web 端都比较完善，唯独 VSCode 插件比较简陋——只有集成一个启动 CLI 的入口。

这款插件把 OpenCode 的 **Web 模式直接嵌入 VSCode 侧边栏**，支持多种模式切换，适用于不习惯使用终端的同学。插件已开源：

- 仓库地址：https://github.com/liangqiangWang/opencode-web-for-vscode

## 核心功能

**侧边栏与主窗口使用**

在 VSCode 侧边栏内直接使用 OpenCode Web 模式，也可以在主窗口打开。

![侧边栏与主窗口使用](/images/articles/opencode-ide-plugin/opencode-ide-plugin-1.png)

**TUI 模式与文本添加**

支持切换到 TUI 模式，并可向对话直接添加文本内容。

![TUI 模式与文本添加功能](/images/articles/opencode-ide-plugin/opencode-ide-plugin-2.png)

**进程启停管理**

内置 OpenCode 后台进程的启停管理，方便在编辑器内控制插件的运行状态。

## 适合谁用

- 不习惯命令行 / 终端操作，希望像普通编辑器扩展一样使用 AI 编程的同学；
- 想在 VSCode 工作流里无缝调用 OpenCode 的开发者。

## 相关文章

- [花 1 天时间给 OpenCode 写了一款 IDE 插件，我总结了 10 条 AI 编程心得](/articles/opencode-ide-plugin) —— 这款插件的完整开发过程，以及 10 条 Vibe Coding 实战心得。

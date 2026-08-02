---
title: "花 1 天时间给 OpenCode 写了一款 IDE 插件，我总结了 10 条 AI 编程心得"
date: 2026-03-15
desc: "经历了一天的 Vibe Coding，我总结了 10 条 AI 编程真实心得"
category: "技术分享"
tags: ["OpenCode", "VSCode", "Vibe Coding", "Claude Code", "AI编程"]
layout: "standard"
cover: "/images/articles/opencode-ide-plugin/cover.jpg"
readTime: 5
draft: false
---

> 花 1 天时间给OpenCode写了一个 VSCode 插件，人工编码为 0，却在修 Bug 中挣扎了 80% 的时间。本文简单聊聊 Vibe Coding 的真实心得。

OpenCode 作为 ClaudeCode 的开源平替，近期也是非常火热。它的 TUI、桌面端、Web 端都已经比较完善。唯独 vscode 插件有点简陋，仅仅集成了一个启动 cli 的入口。

于是，我尝试 Vibe Coding 了一款插件，支持在 vscode 中使用 OpenCode 的 Web 模式。

---

## 插件功能速览

插件的核心功能比较简单：提供一个侧边栏，直接嵌入 OpenCode 的 Web 模式，支持多种模式切换。适用于不习惯用终端的同学。

- 侧边栏与主窗口使用

![侧边栏与主窗口使用](/images/articles/opencode-ide-plugin/opencode-ide-plugin-1.png)

- TUI 模式，与文本添加功能

![TUI 模式，与文本添加功能](/images/articles/opencode-ide-plugin/opencode-ide-plugin-2.png)

- 进程启管理

插件已开源。有需要的同学可以安装尝试。

- 仓库地址：https://github.com/liangqiangWang/opencode-web-for-vscode

---

## 整体感受

我之前也有积累一些 vscode 插件开发经验。这次借助 `ClaudeCode + GLM4.7`，一天就完成了原本至少三天的活儿，人工编码为 0。

但是，整个过程其实没有预想中那么丝滑。跑了近7千万 Token 才完成。

事实上，在前2个小时 CC 就帮我完成了插件 90% 的代码与功能。而剩下80% 的时间都是在反复修 bug、推翻重构。这个过程其实比较痛苦。

下面，我就真实的 Coding 体验，总结了一些 AI 编程的心得。

---

## 十个实战心得

### 1. 先做产品经理，再做开发者

做个人项目时，自己最核心的角色应该是产品经理。功能的细节描述越丰富，AI 的表现越可控。否则就是在**抽卡**，后期会面临不断打补丁。

如果你和我一样是非专业产品经理。建议先写一份草稿列出需求，然后让 AI 作为辅助角色帮你完善文档。

比如我就是不断的提问，最终才明确了功能细节。

> - 模块划分够是否合理？
> - 技术上是否成熟？
> - 交互上有哪些建议？
> - 流程上还有没有遗漏？
> - 先写个 Demo 看看？

### 2. 多用 Plan 模式

Plan 模式的重要性不用多说。这里就补充两点：

- 一定要完整阅读 AI 给出的 Plan 文档，不断完善
- 涉及多模块的改动、复杂 bug 修复，尽量用 Plan 模式

在修复 bug 过程中，我的感受是，**Plan 模式下 AI 会获取更全的上下文**，从而能设计出更完善修复方案。

我最初让 CC 修 bug 时，因为非 Plan 模式仅读取了部分代码片段，经常陷入`改一个 bug 又引入新 bug 的循环中`。非常崩溃。

### 3. 需求变更，一定要维护文档

每次做了大的代码变更，逻辑变更，都应该及时让 AI 更新 `CLAUDE.md`、`设计文档`，防止后续的工作方向偏离。

### 4. 提供可验证的流程或方法

AI 对于产品的理解其实没有想象中深，尤其在经历多轮对话后，注意力会被分散。给出一些验证场景就非常重要。

每次改为代码，可以让它自己按照流程检查，避免遗漏一些逻辑。

vscode 插件开发，AI 其实是无法主动调试或者验证的，但是也可以给出一些核心流程的 checklist，让它检查代码逻辑是否符合。

### 5. 及时清理上下文

上下文的积累会导致 AI 注意力分散，不仅反应更慢，也`更笨`。

如果一直在处理同一个模块的变更（比如AI总是在持续改新引入的 bug）。此时应该保持连续会话，让它记得前面修改过什么。感觉模型变慢后，就及时 compact 压缩一下会话。

如果是针对新模块做修改，就可以直接新开对话，避免上下文干扰。但是可以让它先让它了解项目全貌，再去修改代码。

### 6. 遇到玄学 bug，先加日志

- 简单的 UI 问题，直接给 AI 描述或截图，通常容易解决。
- 如果是复杂的逻辑bug，建议让 AI 优先加日志。把日志反馈给它，能够更精确的定位到问题。

我遇到一个状态同步的 bug，反复沟通了四五轮都没改好，后面增加日志后，一次性就解决了。

![状态同步 bug 的日志排查](/images/articles/opencode-ide-plugin/opencode-ide-plugin-3.png)

### 7. AI 也需要复盘与反思

如果 AI 在改代码过程中总是犯错、改不对，就需要持续的给它一些反馈。过程也是很痛苦的。

建议让 AI 自己`总结前面犯的错误，沉淀到 CLAUDE.md 中`，比如：一定要考虑跨平台兼容性、改完代码需要先编译 等。

当然，充值更强的模型，也许会更简单。

![AI 复盘与反思](/images/articles/opencode-ide-plugin/opencode-ide-plugin-4.png)

### 8、全局的代码清洁整理，非常重要

AI 在编码过程中经常会过度设计，引入一些未使用的代码。再加上续持续的代码迭代，很大概率会引入一些重复、无用代码，甚至是不合理的设计。

所以，在开发完成后，一定要`让 AI 进行全局的代码检查`，对冗余代码做清理、局部代码优化、补充注释、清理调试 log 等。不仅仅是让代码更整洁，也能让 AI 后续更好发挥。

在该插件开发过程中，一次性就清理了几百行无效代码。

![全局代码清理](/images/articles/opencode-ide-plugin/opencode-ide-plugin-5.png)

### 9. 让 AI 提交代码

vibe conging 过程中，一定要做好代码版本管理，建议完成一个比较满意的本就提交一次，避免累计一些垃圾代码后无法回退。

代码提交也建议让 AI 自己控制，这样写出的 commit message 是非常全面的，有利于后续的分析和回退。

![让 AI 提交代码](/images/articles/opencode-ide-plugin/opencode-ide-plugin-6.png)

### 10. 别放弃主动思考

虽然 vibe coding 让个人的技术显得不那么重要，但是仍然有很多环节是 AI 无法主动涉足的（比如 vscode 插件的调试），这部分需要利用我们自身的主观性，给 AI 提供更多的信息。

比如，在插件开发过程中遇到一个 windows 系统的 bug，执行 terminal 命令结果不符合预期。AI 从代码层面始终未找到问题，修改了几轮都未解决。

后来我自己观察了一下 vscode 的配置，推测是默认的终端配置导致。AI 得到这个信息后，立马就顿悟了。

![windows 系统 bug 排查](/images/articles/opencode-ide-plugin/opencode-ide-plugin-7.png)

---

## 小结

以上就是我在经历了一天的 bug 折磨后，得到的一点经验。

也许采用更强的模型、更科学的开发范式，就能够避免大量的问题，欢迎大家交流

---

## 延伸阅读

- [Andrej 大神力荐的 NanoClaw 怎么用？20 分钟安装上手，并对接飞书](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483871&idx=1&sn=c8e2979ca5af4880977c057a24ec37ba&scene=21#wechat_redirect)
- [Agent Skills 又是什么神器？能取代 MCP 吗？](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483754&idx=1&sn=a8c9bb6cfa584e40cfc11e021520f10c&scene=21#wechat_redirect)
- [写了一个免费的AI出图 skill，分享给你](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483845&idx=1&sn=f31b1c188e21b8bcb86218e7263275df&scene=21#wechat_redirect)
- [拒绝幻觉与失控：AI Agent 建设的 17 种架构](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483800&idx=1&sn=a2f3c586f64ebc5481e504cda0c11c69&scene=21#wechat_redirect)
- [深入解析：Claude 官方 Skill 的设计思路](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483827&idx=1&sn=0b3dbc7f33003d59fd2cd6a5cebce91d&scene=21#wechat_redirect)

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
>
> 关注我：一起学习 AI 技术

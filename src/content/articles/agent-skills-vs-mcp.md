---
title: "Agent Skills 又是什么神器？能取代 MCP 吗？"
date: 2025-12-01
desc: "Anthropic 最近又推出了 Agent Skills，它和 MCP 有什么区别？如何自己制作一个 Skill ？"
category: "AI工具"
tags: ["Agent", "Skill", "MCP", "Claude Code", "Anthropic"]
layout: "standard"
cover: "/images/articles/agent-skills-vs-mcp/cover.jpg"
readTime: 3
draft: false
---

> Anthropic 的创新能力总是让人眼前一亮，MCP 的热度还未散去，最近又推出了 **Agent Skills**。
>
> 它又是什么黑科技？让我们一探究竟，并尝试制作一个 Skill。

## Agent Skills 是什么？

### 概念

**Agent Skills** 是 Anthropic 应用在 10 月推出的新能力，它将**程序性知识**封装成可重用的"技能包"。每个技能（skill）都是封装在一个**文件夹**中，主要包含：

- **知识说明书（SKILL.md）：**告诉AI何时及如何执行技能
- **执行脚本（可选）：**Python、bash等可执行文件
- **参考资料：**文档、模板、配置
- **多媒体资源：**图片、示例代码

所以通俗地讲，**一个 skill 就是一个SOP**（标准作业程序），不仅包含了某个技能的说明，还有配套的工具、参考说明等。

官方提供了一些常用的 Skills，可以教会 Agent 如何使用 ppt、pdf，如何对 web应用测试等。都是非常标准且通用的能力。

![官方常用的 Skills](/images/articles/agent-skills-vs-mcp/agent-skills-vs-mcp-1.png)

### 如何使用

很显然，Skills 的使用需要客户端支持，因为至少需要从本地读取 Skills 文件夹，并有能力执行工具。**目前只有 Anthropic 自家的产品支持。**

以 Claude Code 为例，我们可以通过它的 plugin 模块直接安装官方的 Skills。

![通过 plugin 安装官方 Skills](/images/articles/agent-skills-vs-mcp/agent-skills-vs-mcp-2.png)

安装完成后，其实就是在指定目录下载了一些工具文件夹：

![下载的工具文件夹](/images/articles/agent-skills-vs-mcp/agent-skills-vs-mcp-3.png)

这样 Claude Code 在后续就可以自主访问使用这些技能，和 MCP 非常类似。

## 有了MCP，还需要 Skills 吗？

**概念对比**

| 维度 | Agent Skills | MCP |
| --- | --- | --- |
| 设计哲学 | 教AI**如何**做事 | 给AI**连接**外部世界 |
| 本体定位 | 程序性知识容器 | 标准化接口协议 |
| 部署方式 | 文件夹即服务 | 服务器部署 |
| 使用场景 | 内部工作流程 | 外部系统集成 |

**性能对比**

| 指标 | Agent Skills | MCP |
| --- | --- | --- |
| 启动开销 | ~50 tokens | ~15,000 tokens |
| 响应延迟 | 50-200ms | 500-2000ms |
| 内存占用 | 低（按需） | 高（全量） |
| 适用规模 | 轻量级任务 | 重量级集成 |

为什么Skills 的性能更出色？这得益于其三层渐进加载的设计。默认情况下，AI 不会加载全部技能包，只会携带极少的元数据信息。只有当 AI 决定使用某个技能时，才会加载详细内容到上下文中。

我们可以做一个形象的类比：

> **MCP 就好比一个工具箱**，AI 会随身携带这些工具，并且需要 AI 自行决策如何使用这些工具。所以消耗 token 较多，效率更低。

> **而 Skills 就像一本指导手册**，当需要使用时才去查看详细的教程与工具，并且有一套标准的教程指导 AI，理论上效果会更好。

从某种意义上说，Skills 其实是包含了 MCP 的能力的，它同样能允许 AI 调用工具链接外部环境。 当然，两者也是可以共存使用的。

![Skills 与 MCP 共存](/images/articles/agent-skills-vs-mcp/agent-skills-vs-mcp-4.png)

## 快速制作一个 Skill

上面安装的是官方提供的 Skills，如果要自己制作一个 Skill 呢？

非常简单，因为官方已经提供了一个**制作 Skill 的 Skill**，它能教会 AI 制作一个 Skill 的标准流程。

### 制作 Skill

下面看看 ClaudeCode 如何制作一个使用 puppeteer 的 Skill。

![制作 puppeteer Skill](/images/articles/agent-skills-vs-mcp/agent-skills-vs-mcp-5.png)

这样就拥有了自己的 Skill，只需要放置到默认目录，重启 Claude Code 即可使用。

![拥有自己的 Skill](/images/articles/agent-skills-vs-mcp/agent-skills-vs-mcp-6.png)

### 调用Skill

下面尝试让 Claude Code 使用上面制作的 Skill。

![调用 Skill](/images/articles/agent-skills-vs-mcp/agent-skills-vs-mcp-7.png)

可以看到非常顺利，Claude Code 按照 Skill 的教程、工具，完成了一次网页访问。

## 小结

无论是 MCP 还是 Skills，它们本质是都是**上下文工程化**的深度实践。

在处理复杂任务时，单纯的提示词是很难支撑的。我们不可能为每个任务都设计一套复杂的提示词，或是向 AI 投喂超长的背景知识。因此，这类工具应运而生，它们让 AI 能够**动态构建上下文**，从而输出更高质量的结果。

以 AI 编程为例，当下主流 LLM 的核心能力差距正在缩小，但像 Cursor、Claude Code 这类工具的体验却仍然遥遥领先，其关键就在于背后的上下文工程做得极为出色——**它们精准地知道，在何时、应该向 AI 输入什么内容。**

Agent Skills 的出现，一定会更好的支撑 Vibe Coding，也期待更多的客户端也能加入这个生态，见证 AI 工作方式的下一次进化。

## 参考

- Agent Skills 官方介绍：https://claude.com/blog/skills
- 官方 Skill 仓库：https://github.com/anthropics/skills

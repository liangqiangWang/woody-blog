---
title: "我的 Skill 管理技巧：解决目录混乱、无法更新的痛点"
date: 2026-07-06
desc: "三个技巧，解决 Skill 管理的痛点"
category: "AI工具"
tags: ["Skill", "Agent", "Claude", "AI工具"]
layout: "standard"
cover: "/images/articles/skill-management-tips/cover.jpg"
readTime: 8
draft: false
---

Skill 固然是好用，可一旦装多了，Skill 的管理就让人头疼：分散在多个目录、装完就忘记更新、挤占宝贵的上下文。

本篇主要分享几个我日常在用的 Skill 管理技巧，包括 `如何集中管理 skill`、`让 skill 实现自动更新`、`减少 token 消耗`。

## 一、Skill 分散在多个目录，如何集中管理？

如果你日常同时使用多个 Agent，大概率遇到过这种情况——同一个 Skill 要在不同目录里各放一份：

- 使用 Claude Code，要放到 `.claude/skills/`
- 换到 Cursor，要放到 `.cursor/skills/`
- Codex 又要求放在 `.agents/skills/`
- ......

光看这些路径就头大。

但其实，看过官方文档的同学应该知道，__绝大多数 Agent 现在都已经兼容 `.agents/skills/` 这个统一目录了__。

![兼容多个目录](/images/articles/skill-management-tips/skill-management-tips-1.png)

OpenCode 甚至兼容 Claude Code 的目录：

![OpenCode 兼容](/images/articles/skill-management-tips/skill-management-tips-2.png)

唯一特立独行的只有 Claude Code 了，仍然不兼容 `.agents/skills/`，不兼容 `AGENTS.md`。😈 

### ▎技巧：借助软链接实现 Skill 共享

软链接（symlink）是系统层面的基础能力，可以简单理解成系统级的"快捷方式"。

__> 实际做法很简单：__

把 Skill 的真实文件存放在 `.agents/skills/xxx`，再在 `.claude/skills/xxx` 建一个软链接，指向前面那份文件。这样一来，两个目录访问的其实是同一份内容，日常只需要维护一份 Skill 即可。

![软链接共享](/images/articles/skill-management-tips/skill-management-tips-3.png)

不过软链接的操作在不同操作系统下命令不一样：macOS / Linux 用 `ln -s`，Windows 要用 `mklink` 或开启开发者模式。但手动敲还是有点麻烦，__直接交给 Agent 帮执行就行__。

__> 借助工具：__

如果嫌命令行麻烦，此处强烈推荐开源工具 __CC-Switch__。

它不仅能管理模型供应商路由，也支持可视化管理 Skills、MCP，而它管理 Skill 的底层方式，用的正是软链接。

![CC-Switch界面](/images/articles/skill-management-tips/skill-management-tips-4.png)

## 二、让 Skill 实现自动更新

Skill 的本质是静态文本集合（一堆 Markdown 文件和脚本），并没有通用的版本管理和更新机制。经常是装完一个 Skill 后，就再也没感知过它的更新。

### ▎技巧：借助 skills 工具实现定期更新

__> skills 管理工具__

很多人安装 Skill 时一定用过这个命令：

```bash
npx skills add xxx-skill
```

这里的 `skills`，其实是 Vercel Labs 推出的一个开源 Skill 包管理工具，支持查找、安装、更新 Skill，定位上有点像 Skill 生态的 npm。

常用命令举例：

![skills命令](/images/articles/skill-management-tips/skill-management-tips-5.png)

__> 针对本地全局 Skill__

对于一些公开的 Skill，日常借助 `npx skills update --all` 就能实现一键更新。

（应该是从 https://www.skills.sh/  拉取的更新，未仔细研究过）

如果是私有地址的 skill，也可以重复执行 add 安装命令，会覆盖安装，起到更新的效果。

![更新Skill](/images/articles/skill-management-tips/skill-management-tips-6.png)

更进一步，如果担心自己忘记定期检查，完全可以配一个定时任务（macOS 的 cron / launchd，Windows 的任务计划）定期跑一遍更新命令。配置过程交给 Agent 处理即可。

__> 针对团队项目中的 Skill__

很多团队会把 Skill 直接放进代码仓库，跟随 git 做版本管理。好处是大家共享同一份 Skill 配置，拉取代码后就自动完成安装和更新。

不过我之前实践过另一种方式：__不把 Skill 直接提交进代码仓库，而是借助 hook 实现自动安装/更新__。

以前端项目为例：
1. 写一个安装 skill 的脚本（仍然是利用 npx skills add 命令，仅本地执行）
2. 把脚本挂到 `postinstall` 钩子里
3. 把项目的 skills 路径加进 `.gitignore`

这样一来，团队每个人在本地__执行 `yarn` 或 `npm install` 时，都会自动拉取并更新 Skill__，无需单独维护。

## 三、特定 Skill 不要全局安装，尽量放进项目里

之前观察到，有团队成员习惯把所有 Skill 都塞进全局目录 `~/.agents/skills/`。好处是在任何目录下打开 Agent 都能直接加载。

__但这种方式也存在代价。__

全局安装意味着 Agent 每次对话都会把这些 Skill 的 describe 信息带上，不仅浪费 token，还会挤占宝贵的上下文窗口，稀释模型注意力。

Skill 装得越多，效果反而越差，得不偿失。

### ▎技巧：按工作场景拆分目录

我的习惯是，__按工作场景建立不同的工作目录，每个目录只放它真正需要的 Skill__。全局目录里只留那些"随时可能用到"的少量通用 Skill。

> 简单示意：

![目录结构](/images/articles/skill-management-tips/skill-management-tips-7.png)

这样 Agent 在不同场景下，只会加载当前工作场景相关的 Skill，上下文干净，也能节省 token。

## 后话

AI 的发展太快了，随着 Codex、WorkBuddy 这类 Agent 工具的普及，上述 Skill 的问题其实也在逐渐减少，因为这些工具本身就提供了比较好的管理机制。

我相信 Skill 仍只是一个过渡态，也许用不到多久，Skill 也会逐步淡出，又会有新的概念和技术出现。

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
> 
> 关注我：一起学习 AI 技术
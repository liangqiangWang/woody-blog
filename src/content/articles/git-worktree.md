---
title: "Git worktree，让 ClaudeCode  并行开发不冲突"
date: 2026-03-22
desc: "Claude Code 原生支持了 worktree ，它的原理是什么"
category: "技术分享"
tags: ["Git", "worktree", "Claude Code", "并行开发"]
layout: "standard"
cover: "/images/articles/git-worktree/cover.jpg"
readTime: 2
draft: false
---

Claude Code 上个月更新了一个能力，`--worktree` 参数可以让多个 Claude Code 实例在同一个项目中并行开发，而不冲突。背后使用的是 git 的 worktree 能力。

下面简单梳理下 git worktree 的用法。

## 一、并行开发的冲突

假设一个场景：当你正用 Claude Code 开发一个新功能做到一半时，突然有个线上 Bug 要立刻修。

这种情况，常规的解决方式是什么？

```bash
git stash                # 暂存当前修改
git checkout main        # 切换到 main
# 新开 terminal 和 claude code 修 Bug ...
git add . && git commit  # 提交 Bug 修复
git checkout feature-a   # 切回功能分支
git stash pop            # 恢复暂存的修改
```

来回切换两次，中途状态还容易乱。核心的问题是：**切换分支时，当前目录的状态会被覆盖。**

更理想的方式是：两个任务同时跑在各自的目录里，互不干扰。

**这就是 git worktree 要解决的问题。**

## 二、同一个仓库，多个工作目录

Git 很早就想到了这个问题。`git worktree` 可以让你在同一个 Git 仓库下，创建多个独立的工作目录，每个目录指向不同的分支。

简单说：**一份代码，多个文件夹，互不干扰。**

### 工作原理

普通的 Git 仓库只有一个工作目录，就是你 clone 下来的那个：

```
my-project/           ← 你的工作目录（main 分支）
├── src/
├── package.json
└── .git/
```

用 worktree 可以这样：

```
my-project/           ← 主工作目录（main 分支）
├── src/
└── .git/

my-project-feature/   ← 新工作目录（feature-a 分支）
├── src/
└── .git/             ← 不存在，共享父仓库的 .git
```

两个目录共用同一个 `.git` 仓库，但文件系统和 HEAD 是完全独立的。**在 feature-a 分支上的操作，不会影响 main 分支。**

### 基础操作

#### 创建 worktree

```bash
# 核心命令
git worktree add <dir> -b <newBranch>

# 举例：
# 1.基于现有分支创建
git worktree add ../feature-a -b feature-a

# 2.基于某个 commit 创建（临时测试用）
git worktree add ../temp-checkout abc1234
```

执行后，Git 会自动创建新目录并切换到对应分支。

![创建 worktree](/images/articles/git-worktree/git-worktree-1.png)

#### 查看所有 worktree

```bash
git worktree list
```

#### 删除 worktree

```bash
git worktree remove ../feature-a
```

如果目录有未提交的修改，加 `-f` 强制删除：

```bash
git worktree remove ../feature-a -f
```

## 三、Claude Code 中使用 worktree

### 创建 worktree

回到开头的问题：怎么让两个 Claude Code 实例同时工作？

在之前，需要手动创建 worktree，再分别在两个目录里启动 Claude Code、配置环境。过程繁琐，容易出错。

但是如今，只需增加一个启动参数 `--worktree`（或 `-w`）即可：

```bash
# 终端1：开发新功能。在默认目录下进行
claude

# 终端2：修复紧急 Bug，临时创建 worktree 目录修改，改完后提交到对应的分支即可
claude -w bugfix-a
```

Claude Code 会自动：

1. 在 `.claude/worktrees/` 下创建新的 worktree
2. 基于当前 HEAD 创建新分支 bugfix-a
3. 切换工作目录到这个新的 worktree
4. 启动独立的 Claude Code 会话

**两个 Claude Code 实例各自在自己的目录里工作，完全隔离，互不干扰。**

![Claude Code 并行开发](/images/articles/git-worktree/git-worktree-2.png)

### 清理 worktree

在退出 Claude Code 时，会根据 worktree 是否存在代码修改而提醒用户：

- **无更改：**自动删除 worktree
- **存在更改或提交：**提示用户保留 或 删除 worktree

![清理 worktree 提示](/images/articles/git-worktree/git-worktree-3.png)

当然，在 Claude 之外，也可以手动使用 `git worktree` 命令继续管理。

![手动管理 worktree](/images/articles/git-worktree/git-worktree-4.png)

---

参考：

- https://code.claude.com/docs/zh-CN/common-workflows

**延伸阅读**：

- [Andrej 大神力荐的 NanoClaw 怎么用？20 分钟安装上手，并对接飞书](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483871&idx=1&sn=c8e2979ca5af4880977c057a24ec37ba&scene=21#wechat_redirect)
- [Agent Skills 又是什么神器？能取代 MCP 吗？](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483754&idx=1&sn=a8c9bb6cfa584e40cfc11e021520f10c&scene=21#wechat_redirect)
- [写了一个免费的AI出图 skill，分享给你](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483845&idx=1&sn=f31b1c188e21b8bcb86218e7263275df&scene=21#wechat_redirect)
- [拒绝幻觉与失控：AI Agent 建设的 17 种架构](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483800&idx=1&sn=a2f3c586f64ebc5481e504cda0c11c69&scene=21#wechat_redirect)
- [深入解析：Claude 官方 Skill 的设计思路](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483827&idx=1&sn=0b3dbc7f33003d59fd2cd6a5cebce91d&scene=21#wechat_redirect)

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
> 
> 关注我：一起学习 AI 技术

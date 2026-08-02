---
title: "推荐新人掌握的 Claude Code 使用技巧，以及一个彩蛋"
date: 2026-04-07
desc: "Claude Code 的实用技巧和经验分享，从权限配置到高级命令的使用"
category: "开发工具"
tags: ["Claude Code","AI工具","开发技巧","自动化"]
layout: "standard"
readTime: 8
draft: false
---

最近几个月我已经把 Claude Code 当成了主力开发工具，即便搭配国产模型，也基本满足日常的测试工具开发、自动化脚本工作。同时，也顺利安利团队成员都从 Cursor 切换到了 Claude Code。

对于刚接触 Claude Code 的同学来说，上手还是比较容易的，但是要想用好它，其实有很多隐藏的技巧和经验。比如，我看到有成员现在都还在不停的给 Claude Code 授权命令，而不知道怎么让它默认允许。也不知道如何回退某次对话的代码修改。

其实 Claude 官网上有非常详细的使用说明，但一般确实很难全部啃完。所以，本文整理了一部分我认为比较有用经验或技巧，大部分是自己踩坑后学习的。

## 一、工具权限（permissions）

对于初次接触 Claude Code 的同学，不知道有没有这种烦恼：**每次 Claude Code 执行工具都要让你手动确认。**即便选择了 allow，下次还会弹出来。

其实，只要理解了配置文件 `.claude/settings.local.json` 就很容易解决。

以 Bash 工具举例。当你允许它执行 `npm run compile` 后，它就会在配置文件中记录下来 `Bash(npm run compile)`，下次使用就无需再申请。但是它仅仅只是记录这一个命令，下次遇到其它命令（比如 `npm run test`）还是需要申请权限。

所以解决办法也很简单——只要**在配置文件中改为允许所有 Bash 即可**，不再匹配具体的某个指令。

**举例：**
- 允许：web检索、网页数据获取、所有 Bash 命令执行
- 拒绝：读取 env 文件

```json
{
  "permissions": {
    "allow": [
      "WebSearch",
      "WebFetch",
      "Bash"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)"
    ],
    "ask": []
  },
  "enabledMcpjsonServers": [],
  "enableAllProjectMcpServers": true
}
```

需要注意的是，项目目录下的 `.claude/settings.local.json` 只对该项目生效。如果希望全局生效，需要修改全局配置文件：`~/.claude/settings.json`。

具体可参考官方说明：https://code.claude.com/docs/zh-CN/settings

当然，也有一劳永逸的方法，启动 claude 时带上参数： `--dangerously-skip-permissions` ，但风险也是比较大的。

## 二、控制检索范围，节省 token（.claudeignore）

Claude Code 获取上下文全全靠自动搜索。**但有时候它搜得太多了**。

- 有时候会搜索敏感的 **.env** 文件，让人不放心。
- 有时也会在 node_modules、dist 目录下搜索。不仅仅是无效搜索，也会导致 token 大量浪费。

解决方案是在项目根目录创建 **.claudeignore** 文件，让它不再检索指定的目录或文件。**用法和 .gitignore 一样**。

```
# .claudeignore 文件示例
node_modules/
dist/
```

## 三、临时执行终端命令（感叹号）

Claude Code 中默认是无法在执行终端命令的。比如和它对话了一半，你突然想执行命令查询文件，常规情况下是要新开一个终端窗口去执行。

其实 Claude Code 早就想到了，可以在命令**前面加个感叹号**，这样就是去执行终端命令，而不是和 AI 对话。

**说明：**命令的输出会直接显示在 Claude Code 窗口里，Claude 能看到，你也能看到。

## 四、后悔药（/rewind ）

在开发一个复杂项目时，我常遇到的一个问题：**Claude Code 理解错了需求，把代码改崩了**。由于是在多轮对话中发生的，不仅把原本正常的代码改错了，由于对话已经进行了一大段，上下文也被污染了。

我之前还只会用 `git` 配合 `撤销`去恢复代码，再重开对话。其实内置的 `/rewind` 指令 （或 `双击 ESC`）就能做到 **回退代码 + 回退会话**。真的是救命能力。

当然，仍然建议大家时刻用 git 管理好代码版本，这个是最稳妥的。

## 五、临时插入对话（/btw ）

有时候当 Claude Code 在跑任务会持续好几分钟，这个过程中是无法再和它对话的，除非中断当前任务。

3月的版本增加了一个 `/btw` 命令，就可以做到不影响前面的任务，单独开一个临时会话，并且不会污染之前的会话。（这个命名也很简明——by the way）

用完后按下空格、Enter 或 ESC，这段临时对话就直接消失了！历史对话列表中也不会存在。

## 六、导出会话（/export ）

有时候想分享一下和 Claude Code 的对话过程，或者存档，不需要再手动截图了。直接使用 `/export` 就行。

## 七、任务管理（/tasks）

当 Claude Code 在开发一个后端任务时，它可能会直接你启动这个项目。如果此时想再继续管理这个服务，就可以使用`/tasks`。

它会列出当前在后台启动的任务，通过命令可以直接停止对应的进程。

## 八、自定义指令（command）

Claude Code 中通过斜杠`/`唤起的命令一般是内置命令（command），或者 skill。

其实也支持自定义 command。只需要在`.claude/command/`目录下定义一个md文件即可， 直接就能执行该文件中定义好的提示词。

比如，可以把一些常用的 code review 提示词或流程封装成一个 command，它没有 skill 那么重。

## 九、彩蛋：电子宠物（/buddy ）

Claude Code 这次源码泄露让很多业内人士狂欢，不仅学到了优秀的 Agent 实践，有人还提前发现了一个彩蛋功能 `/buddy`。（4月1日已上线）

简单说，可以像拆盲盒一样，认领自己的电子宠物。它有名字有形象，有属性。

开启之后，电子宠物就会常驻在终端右侧。执行 `/buddy pet` 还能触发它的特效。

据说有十几种不同的宠物形象。看看你抽到的电子宠物是什么？

**注**：Claude Code 的 vscode 插件存在较多差异，一些命令还未支持。如：btw、export、buddy 等。

## 延伸阅读

- [Git worktree，让 ClaudeCode  并行开发不冲突](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483941&idx=1&sn=ce01f2159c7af48a06c9eb95f4f070a9&scene=21#wechat_redirect)
- [Andrej 大神力荐的 NanoClaw 怎么用？20 分钟安装上手，并对接飞书](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483871&idx=1&sn=c8e2979ca5af4880977c057a24ec37ba&scene=21#wechat_redirect)
- [Agent Skills 又是什么神器？能取代 MCP 吗？](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483754&idx=1&sn=a8c9bb6cfa584e40cfc11e021520f10c&scene=21#wechat_redirect)
- [写了一个免费的AI出图 skill，分享给你](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483845&idx=1&sn=f31b1c188e21b8bcb86218e7263275df&scene=21#wechat_redirect)
- [拒绝幻觉与失控：AI Agent 建设的 17 种架构](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483800&idx=1&sn=a2f3c586f64ebc5481e504cda0c11c69&scene=21#wechat_redirect)

---

如果这篇文章对你有帮助，欢迎点赞、转发！

关注我：一起学习 AI 技术
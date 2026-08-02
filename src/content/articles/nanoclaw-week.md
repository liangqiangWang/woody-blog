---
title: "NanoClaw 养虾一周体验：我的四个真实使用场景"
date: 2026-03-08
desc: "Claw 小龙虾的真实体验"
category: "AI应用"
tags: ["NanoClaw", "OpenClaw", "AI助理", "Skill", "飞书"]
layout: "standard"
cover: "/images/articles/nanoclaw-week/cover.jpg"
readTime: 3
draft: false
---

> 上一篇简单介绍了 `NanoClaw` 的安装流程，不到 20 分钟就拥有了一只 `AI 小龙虾`。本篇就简单分享下，我过去一周都用 AI 小龙虾做了哪些事情。

单从 Agent 能力来看，`OpenClaw`、`NanoClaw` 这类 AI 助理与 `ClaudeCode` 的核心差异并不大——不少 Claw 产品本身就是基于 `ClaudeCode` 搭建。所以在添加 Skill、开放系统权限后，能力基本没什么差别。

真正的差异化在于 Claw 打通了**社交渠道沟通**，实现了**全天候的任务托管**。这种模式确实带来了一种新的体验。

浅浅体验了一周，下面介绍几类我所尝试的场景，涉及 `学习提升`、`资讯推送`、`AI刷微博`、`远程开发`。

---

## 场景一：我的学习搭子

尽管 AI 时代学习的价值越来越低，但是人类的探索欲是没有边界的，借助 AI 能帮助我们高效学习。Claw + 主动推送，确实能解决一部分学习主动性问题。

我所尝试的实践路径：

- 与 Claw 共同制定学习计划
- 每日定时推送学习材料
- 学完后即时反馈
- 自动沉淀结构化笔记

![学习搭子](/images/articles/nanoclaw-week/nanoclaw-week-1.jpg)

**具体操作**：先与 Claw 明确学习目标，生成阶段性计划，随后每天定时接收 AI 整理好的学习文档。完成后再反馈学习情况，Claw 会自动总结并归档我学习过的内容，写入Obsidian，之后就能随时回顾查看。

### 感受

目前的流程都是通过对话完成，还不太完善，整理的文档内容不是很好。其实可以优化流程，封装成一个学习交换 Skill。

---

## 场景二：RSS 订阅推送

Claw 具备网络访问能力，可直接解析 RSS 源的信息。所以让它来推送新闻也非常简单。

我目前订阅的主要是 AI 领域动态，让Claw 定时查询新闻，并按规则过滤一些主题，再推送到飞书。不要太高效。

![RSS 订阅推送](/images/articles/nanoclaw-week/nanoclaw-week-2.jpg)

---

## 场景三：AI 刷微博

刷微博是我的日常习惯，但信息流其实包含了大量无趣的内容，容易遗漏我感兴趣的话题。

所以写了一个基于`微博官方API`的 Skill，让 Claw 每隔一段时间抓取我的微博时间线，按特定规则过滤后推送。

![AI 刷微博](/images/articles/nanoclaw-week/nanoclaw-week-3.jpg)

**注**：Skill 代码已整理，后台回复【skill】获取。

---

## 场景四：随时待命的开发小助理

这是目前体验过最惊喜的场景：

前几天下班时突然想到一个点子：希望实现一个 Chrome 插件帮我解决工作中一个痛点。 手机上先咨询了千问，验证了可行性。随后直接将对话转发给 Claw。

还没到家，Claw 就帮我完成了2个 Demo开发。我需要做的事情只是验收。

![开发小助理](/images/articles/nanoclaw-week/nanoclaw-week-4.jpg)

### 感受

这种随时随地有个助手待命、还不用关注它的情绪的体验，是未曾感受过的。

当然，实际这类编码场景并不多，白天在公司迸发的想法，当场就会让 ClaudeCode 实现了。

---

## 小结

以上只是过去一周的简单体验，Claw 的能力确实没有带来什么惊喜，感觉只是 ClaudeCode 的场景拓展。但它通过社交软件的沟通方式，确实带来了一种前所未有的体验。有种窥探到未来的科幻感。

接下来，准备再研究下 Claw 的自我进化 和 热门 skill。

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

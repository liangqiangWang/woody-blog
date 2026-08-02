---
title: "Andrej 大神力荐的 NanoClaw 怎么用？20 分钟安装上手，并对接飞书"
date: 2026-03-01
desc: "Andrej Karpathy 大神推荐的 NanoClaw，如何安装？"
category: "AI应用"
tags: ["NanoClaw", "OpenClaw", "飞书", "Claude Code", "安装教程"]
layout: "standard"
cover: "/images/articles/nanoclaw-quickstart/cover.jpg"
readTime: 3
draft: false
---

OpenClaw 爆火后，也诞生了很多新的个人助理应用。

前两天看到 `Andrej Karpathy 大神`在吐槽 OpenClaw 的安全性很差，并且模块臃肿。反而力捧另一款更小巧的"龙虾"--`NanoClaw`。

![Andrej Karpathy 力捧 NanoClaw](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-1.png)

下面就带你安装 NanoClaw，并对接飞书，接入国产大模型。

安装过程不到20分钟。

---

## 一、NanoClaw 简介

NanoClaw 是一个开源的个人 AI 助手，定位为 OpenClaw 的轻量级更安全的替代品。

核心设计理念是 "小到可以理解" —— 整个代码库仅约 4,000 行（核心引擎约 500 行 TypeScript），相比 OpenClaw 的 40 万+ 行代码，减少了 99% 以上。代码量少到 "8分钟就能看懂"。

官方说明：

- https://github.com/qwibitai/nanoclaw/blob/main/README_zh.md
- https://nanoclaw.dev/

## 二、环境准备

### 环境清单

- **操作系统：**macOS or Linux。（官方未支持 windows系统，但理论上也可以通过 WSL2 安装）
- **Node.js 环境：**需要安装 22 版本。（推荐使用 NVM 管理 node 版本）
- **ClaudeCode：**它的作用主要是帮助我们安装、配置并启动 NanoClaw。大大减轻了复杂的手工操作。
- **大模型 key：**NanoClaw 默认只支持 Claude 模型。当然，也有办法让它支持国产模型（GLM、kimi 等），后面会说到。

---

## 三、20分钟安装 NanoClaw

### 步骤1：代码下载

```bash
# 克隆仓库
git clone https://github.com/openclaw/openclaw.git

# 如果本地没有git环境，也可以直接下载 Zip 包自行解压
```

#### 安装飞书渠道 skill（可选）

在 OpenClaw、NanoClaw 这类工具中，通信的应用称为渠道，比如 Telegram、feishu、Gmail 等。

由于 NanoClaw 默认不支持飞书渠道，所以需要借助一个第三方skill--`add-feishu`

```bash
# 安装skill
# 方法一：
直接告诉 ClaudeCode：“帮我安装这个 add-feishu skill：https://github.com/sugarforever/01coder-agent-skills/tree/main/skills/add-feishu”

# 方法2:
手动下载 https://github.com/sugarforever/01coder-agent-skills/tree/main/skills/add-feishu
把 add-feishu 文件夹拷贝到 NanoClaw 项目的 .claude/skills/ 目录下即可。
```

**注**：安装完新的 skill，通常需要重启下 ClaudeCode

### 步骤2：启动安装命令

```bash
# 进入代码主目录
cd nanoclaw

# 启动 Claude Code
claude

# 在 claude 中通过斜杠命令，触发setup skill
/setup
```

![setup skill 界面](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-2.png)

**说明**：看 NanoClaw 的目录可以发现，`.claude/skills` 目录下包含了很多 skill，其中 setup 就是用于安装配置 NanoClaw 环境

![.claude/skills 目录](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-3.png)

#### 等待安装

之后，就按照 ClaudeCode 的指令操作就行了。中间会引导你安装 Docker 环境、配置模型、配置渠道 等。

**关于模型配置**：

由于 NanoClaw 默认只支持 Claude 模型，中间会引导你配置 Claude 模型。如果你本身就用的Claude 模型，按照提示操作即可。 如果你想用国产模型，可以选择第二种方式，在`.env`文件中新建 ANTHROPIC_API_KEY。

![模型配置](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-4.png)

**关于渠道安装**：

在安装过程中，ClaudeCode 会引导你安装 WhatsApp 渠道。如果你不需要可以直接拒绝：“我不需要 whatsapp”。

![WhatsApp 渠道安装](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-5.png)

不出意外，CluadeCode 会让你选择安装其它渠道。

![其它渠道选择](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-6.png)

如果没有提示安装其它渠道也没关系，可以通过 `/add-feishu`、`/add-gmail` 这些 skill，安装对应的渠道。

安装feishu时，会有比较详细的提示：

![feishu 安装提示](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-7.png)

### 可选：切换国产模型

在配置完上述操作后，就可以在飞书中给应用发消息了。 但如果你之前配置的是国产大模型 key，就会遇到提示 Invalid API key。

这时候，可以在`.env`文件中新增 ANTHROPIC_BASE_URL 变量，填入对应的国产模型地址。我这里用的是 GLM。

![.env 配置 ANTHROPIC_BASE_URL](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-8.png)

然后，再告诉 ClaudeCode，让它分析 NanoClaw 是否支持切换国产模型，不支持就让他修改。不出意外的话，它只需要修改下对于 BASE_URL 的兼容就行了。

![切换国产模型](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-9.png)

## 四、测试与执行

完成以上操作，就可以在飞书中和机器人发消息了。（如果有异常，就让 ClaudeCode 帮助解决，并重启 NanoClaw）

常规的对话、文件处理、定时任务都支持。

![飞书对话测试](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-10.jpg)

小助理自称为 Andy，是由内置的提示词控制，也可以自行修改。

![小助理 Andy](/images/articles/nanoclaw-quickstart/nanoclaw-quickstart-11.png)

## 感受

skill 的体验真的太棒了，把软件安装、配置全部交给 AI 处理，人工只需要做确认，提供少量的后台配置，大幅降低了门槛。相比 OpenClaw 要简洁太多。

NanoClaw 把本体塞进了一个 docker 容器中，也可以通过目录映射，让它访问更多的文件，可控性确实好了不少。 功能上的确比 OpenClaw 少一些，但是核心能力基本都不缺。

后面，我会再分享一些 AI 小助理的日常使用案例。

---

## 延伸阅读

- [Agent Skills 又是什么神器？能取代 MCP 吗？](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483754&idx=1&sn=a8c9bb6cfa584e40cfc11e021520f10c&scene=21#wechat_redirect)
- [写了一个免费的AI出图 skill，分享给你](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483845&idx=1&sn=f31b1c188e21b8bcb86218e7263275df&scene=21#wechat_redirect)
- [拒绝幻觉与失控：AI Agent 建设的 17 种架构](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483800&idx=1&sn=a2f3c586f64ebc5481e504cda0c11c69&scene=21#wechat_redirect)
- [深入解析：Claude 官方 Skill 的设计思路](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483827&idx=1&sn=0b3dbc7f33003d59fd2cd6a5cebce91d&scene=21#wechat_redirect)

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
>
> 关注我：一起学习 AI 技术

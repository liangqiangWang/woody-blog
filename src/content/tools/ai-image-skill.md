---
name: AI 出图 Skill
desc: 基于魔搭（ModelScope）与豆包（Doubao）API 的 AI 图像生成 Skill，接入 Claude Code 即可出图，魔搭默认每天 2000 次免费调用。
icon: paintbrush
tags: [AI图像生成, Skill, Claude Code, 魔搭]
accent: '#8b5cf6'
kind: doc
---

## 这是什么

一个基于 **魔搭（ModelScope）** 与 **豆包（Doubao）** API 封装的 AI 图像生成 Skill，可直接接入 Claude Code。Agent 辅助写作时，能在 `话题 > 大纲 > 细节 > 插图 > 发表` 的全流程里补齐插图这一环，省去 `banana` 等工具的访问门槛与价格成本。

## 核心功能

**双 API 出图**

同时支持魔搭与豆包两家图像生成 API，环境变量二选一或两者都配置即可切换。

- **魔搭（推荐，免费）**：阿里开源模型社区，每天 **2000 次免费调用**。默认模型 `Z-Image-Turbo`，效果勉强够用，主打免费；官网还有大量免费模型可自行切换。
- **豆包（收费）**：默认模型 `doubao-seedream-4-5-251128`，效果在国内算不错，价格也实惠。

![魔搭API出图效果](/images/articles/ai-image-skill/ai-image-skill-1.png)

![豆包API出图效果](/images/articles/ai-image-skill/ai-image-skill-3.png)

**灵活配置**

- 提供默认配置，可手动指定默认 API、模型、尺寸，也可以让 AI 自行调整；
- 支持自定义图像尺寸与输出路径。

![个性化配置](/images/articles/ai-image-skill/ai-image-skill-5.png)

### 使用前提

需设置环境变量（二选一或两者都设置）：

```bash
# 魔搭 API（推荐，免费）
export MODELSCOPE_API_TOKEN=你的token
# 访问魔搭官网（https://www.modelscope.cn/）注册账号并获取 API Token

# 豆包 API（收费）
export DOUBAO_API_TOKEN=你的token
# 访问豆包开发者平台（https://www.volcengine.com/）注册账号并获取 API Token
```

> 注意：魔搭目前无法指定图像尺寸，尝试多种方式未果。

### 获取方式

后台回复【出图skill】，自动获取 skill 下载地址。

## 适合谁用

- 写文章 / 公众号需要配图，又不想用 `banana` 等付费出图服务的同学；
- 在 Claude Code 里做 Agent 辅助写作，想把插图环节也自动化的开发者。

## 相关文章

- [写了一个免费的AI出图 skill，分享给你](/articles/ai-image-skill) —— 这个 skill 的完整介绍与实际效果。

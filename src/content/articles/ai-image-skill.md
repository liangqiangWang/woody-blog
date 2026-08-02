---
title: "写了一个免费的AI出图 skill，分享给你"
date: 2026-01-31
desc: "一个能免费出图的 skill"
category: "AI工具"
tags: ["Skill", "AI图像生成", "Claude Code", "魔搭"]
layout: "standard"
cover: "/images/articles/ai-image-skill/cover.jpg"
readTime: 1
draft: false
---

最近在尝试 Agent 辅助写作，研究了许多大佬分享的 skill，基本实现了从 `话题 > 大纲 > 细节 > 插图 > 发表` 的全流程，效果还是比较满意的。

其中，做插图通常会建议用 `banana`。但是考虑到访问门槛和价格，还是很不方便。所以搓了一个 AI 出图 skill。

## 文本生成图像skill

基于 **魔搭**(ModelScope)和 **豆包**(Doubao) API 封装的 AI 图像生成 skill 。

### 实际效果

#### 魔搭API（完全免费）

![魔搭API出图效果](/images/articles/ai-image-skill/ai-image-skill-1.png)

![魔搭API出图效果](/images/articles/ai-image-skill/ai-image-skill-2.png)

魔搭是阿里的开源模型社区，每天 `2000` 次免费调用！！

模型默认用的 `Z-Image-Turbo`，效果勉强够用，主要是免费。

官网有非常多免费模型，可以自己改用其它模型。（存在一个问题：魔搭好像没法指定尺寸，尝试了多种方式未果）

#### 豆包API（收费）

![豆包API出图效果](/images/articles/ai-image-skill/ai-image-skill-3.png)

![豆包API出图效果](/images/articles/ai-image-skill/ai-image-skill-4.png)

默认用的 `doubao-seedream-4-5-251128`，效果在国内算不错了，价格也实惠。

### 特点

- 支持多个图像生成 API（魔搭、豆包）
- 多种参数可选，也可以手动配置
- 可自定义图像尺寸和输出路径

#### 使用前提

需设置环境变量（二选一或两者都设置）：

```bash
# 魔搭 API（推荐，免费）
export MODELSCOPE_API_TOKEN=你的token
# 访问魔搭官网(https://www.modelscope.cn/) 注册账号并获取 API Token。免费

# 豆包 API （收费）
export DOUBAO_API_TOKEN=你的token
# 访问豆包开发者平台（https://www.volcengine.com/）注册账号并获取 API Token
```

#### 个性化配置

提供了部分默认配置，可以改默认API、模型、尺寸等。也可以让AI自行调整。

![个性化配置](/images/articles/ai-image-skill/ai-image-skill-5.png)

### 地址

后台回复【出图skill】，自动获取 skill 下载地址~

> 如果对你有帮助，欢迎 star ✨

---

**延伸阅读**：

- [深入解析：Claude 官方 Skill 的设计思路](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483827&idx=1&sn=0b3dbc7f33003d59fd2cd6a5cebce91d&scene=21#wechat_redirect)
- [拒绝幻觉与失控：AI Agent 建设的 17 种架构](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483800&idx=1&sn=a2f3c586f64ebc5481e504cda0c11c69&scene=21#wechat_redirect)
- [Agent Skills 又是什么神器？能取代 MCP 吗？](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483754&idx=1&sn=a8c9bb6cfa584e40cfc11e021520f10c&scene=21#wechat_redirect)

---
title: "Google 和 Anthropic 的 Skill 实践经验"
date: 2026-06-21
desc: "💡 短短半年，Agent Skill 已经成了各种 Agent 的标配能力。但「如何写好 Skill」，似乎还没有一个标准的答案。"
category: "AI工具"
tags: ["Skill", "Agent", "Google", "Anthropic", "最佳实践"]
layout: "standard"
cover: "/images/articles/google-anthropic-skill-practice/cover.jpg"
readTime: 10
draft: false
---

> 💡 
> 
> 短短半年，Agent Skill 已经成了各种 Agent 的标配能力。但「如何写好 Skill」，似乎还没有一个标准的答案。

最近读到两篇文章，来自 Google 和 Anthropic 两个团队各自的 Skill 实战经验文章：

- 《5 Agent Skill design patterns every ADK developer should know》：介绍了 5 种 Skill 设计模式。（2026.03.18）
- 《Lessons from building Claude Code: How we use skills》：介绍了 Anthropic 内部 Skill 实践的经验。（2026.06.03）

结合两篇文章一起看，对于 Skill 的设计会有一些启发。

本文主要提炼了这两篇文章的核心观点。

推荐有条件的同学阅读原文。

---

## 一、回顾：Skill 的结构

Skill 的概念之前已经介绍过，简单回顾下 Skill 的结构，便于原文内容。

```
my-skill/
├── SKILL.md     # 入口：告诉 agent 何时用、怎么用
├── references/  # 按需加载的详细文档
│   ├── conventions.md
│   └── gotchas.md
├── assets/       # 模板、示例产出
│   └── template.md
└── scripts/      # 可复用的脚本、工具函数
    └── helper.py
```

Skill 不仅仅是一个文档，而是一个完整的"技能包"。`SKILL.md` 只是__入口__，真正的内容拆在 `references/`、`assets/`、`scripts/` 里，由 agent 在需要时才去读。

它的设计精髓是 __渐进式披露（Progressive Disclosure）__。并不会把所有东西塞进 agent 的上下文，而是让它按需取用。

---

## 二、Anthropic 的经验：先想清楚「用 Skill 做什么」

Anthropic 针对内部几百个 Skill 做了总结归类，按照 __「Skill 的职能」__ 划分了 9 个类别：

📁 **库与 API 参考**

用于讲清楚某个库、CLI 或 SDK 该怎么正确用，附带代码片段和一份「踩坑」的清单。

✅ **产品验证**

描述怎么测试、怎么验证代码是不是真的工作，常配合 Playwright 这类外部工具。

📊 **数据获取与分析**

接上数据与监控体系，带上凭证、API、取数方式。

⚙️ **业务流程自动化**

把重复的工作流压成一条命令（比如自动生成周会汇报）。

🏗️ **代码脚手架**

给某个具体功能生成框架样板代码。

🔍 **代码质量与审查**

在组织内强制执行代码规范、辅助 code review。

🚀 **CI/CD 与部署**

拉代码、推代码、部署、出问题自动回滚。

📘 **运行手册（Runbooks）**

输入一个症状（告警、报错），走完多工具调查流程，输出结构化报告。

🛠️ **基础设施运维**

日常维护和运维，部分涉及破坏性操作，最需要护栏。

---

Anthropic 给出了一个结论：

- 优秀的 Skill 通常都属于这 9 类中的某一种
- 而那些想干太多事、横跨好几个类别的，反而会让 agent 表现不佳

所以，当你发现一个 Skill 开始什么都往里塞、跨了好几类，就该考虑拆分了。

原文还重点提及了 __产品验证__。

在 Anthropic 内部，验证类 Skill 对 Claude 输出质量的可衡量影响__最为显著__。原文还给出一个观点——「让一位工程师花一整周时间，只把验证类 Skill 做到极致，都是值得的」。

---

## 三、Google 的经验：想清楚「Skill 怎么搭」

Google 这篇解决的是另一个问题：__Skill 内部该怎么组织逻辑。__

文章给出了 5 种设计模式：

🔹 **工具封装（Tool Wrapper）**

把某个库的最佳实践打包成 Skill，让 agent 成为某个库的专家。

🔹 **生成器（Generator）**

把产出结果总结成可服用的模板，agent 产出时只需要面向模板填空。能解决「agent 每次产出结构都不一样」的问题。

它比较适合一些需要确定输出格式的场景，比如 汇报文档、测试报告 等。

🔹 **审查者（Reviewer）**

把「检查什么」和「怎么检查」分开。检查项单独放在 checklist 文件里，指令保持不变。换个 checklist 就是个全新的审查工具。

这种设计的好处，是能够快速让一个 Skill 适配多种场景，比如针对 python、js 代码可以给出不同的 checklist 模板。

🔹 **流水线（Pipeline）**

面对复杂任务，可以用工作流的思路定义 Skill。在每一步流程结束后，增加"门禁"校验（可以是验证手段，也可以是人工确认）。Pipeline 确保 agent 无法绕过复杂任务、直接抛出一个未经校验的最终结果。

🔹 **角色反转（Inversion）**

Agent 天生倾向于"先猜、再立刻生成"，对于一些指令不明确的输入，很容易跑偏。

Inversion 的思路是不让用户下指令、agent 直接执行，而是反过来——让 agent 先采访你，让你补充完关键信息后再开始动手。

这个实践比较适合很难明确需求的场景，比如 编写文章、技术方案设计。

---

## 四、5 个关键技巧

前面解决了 Skill 的设计思路，下面是原文中提到的几类关键技巧。

### 技巧一：SKILL.md 只是入口

__SKILL.md 只放入口必读的内容，详细的全部拆到 `references/`、`assets/`、`scripts/`。__

如果一段内容只有特定场景才用，就应该拆出去。

常见的误区是把规范、指南、注意事项全写进 SKILL.md，结果导致 skill 加载时上下文塞得过满，Agent 的注意力被分散。

### 技巧二：建一个「坑」小节

两篇文章都提到同一个技巧：__专门留一个小节记录「坑」（Gotchas）__，也就是一些常见错误/问题。

这部分内容不该凭空编，而是从 skill 实践的失败点里积累，随着使用不断往里扩充，让 Skill 也能成长。

### 技巧三：description 写给模型看，不是写给人看

__SKILL.md 顶部的 `description` 字段，是写给模型看的「触发条件」，不是写给人看的摘要。__

写 description 时可以在里面堆一长串同义触发词，目的是让 agent 在各种场景下都能命中该 Skill，不要嫌弃它冗余。

### 技巧四：给 Agent 留出发挥空间

Skill 的目的是可复用，指令一旦写得太具体，反而会限制 agent 的灵活性。可以__给 agent 需要的信息，但同时给它根据情境调整的空间。__

📌 举例：

与其写死「必须把汇报发到 xx 邮箱」，不如写成：

> 「如果 config.json 中没有指定发送邮箱，就向用户询问发到哪个邮箱」

这样既保证了流程，又把可变项留给了运行时。

### 技巧五：不要往 Skill 里塞通用知识

LLM 已经训练了所有公开的知识，所以 Skill 中尽量避免定义通用知识（比如某个 python 公共库要怎么使用）。

重点应该放在 Skill 的流程设计，以及补充一些内部的领域知识。这样不仅能降低 token 消耗，也能避免注意力分散。

---

### 📌 参考

1. https://x.com/GoogleCloudTech/status/2033953579824758855

2. https://claude.com/blog/lessons-from-building-claude-code-how-we-use-skills

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
> 
> 关注我：一起学习 AI 技术
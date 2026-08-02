---
title: "深入解析：Claude 官方 Skill 的设计思路"
date: 2026-01-19
desc: "学习下 Claude 官方是如何编写 Skill 的"
category: "技术分享"
tags: ["Claude", "Skill", "Agent", "MCP", "Claude Code"]
layout: "standard"
cover: "/images/articles/claude-skill-design/cover.jpg"
readTime: 10
draft: false
---

> 在前面的文章《Agent Skills 又是什么神器？能取代 MCP吗？》中，我们初步了解了Skill 的组成与作用，并尝试生成了一个 skill。现在，让我们更进一步，看看官方的 Skill 是如何实现的，有哪些可借鉴的经验。

不出所料，不到一个月，Skill 的概念又开始大火。不仅出现了 OpenSkill 这种适配器，CodeX、OpenCode 都已支持 Skill，就连字节的 TRAE 也开始支持 Skill 了。

你是否好奇，一个优秀的 Skill 到底要如何实现？

今天，我们就来深入分析两个 Claude 官方 Skill，看看 Anthropic 的工程师们是如何设计这些优雅的"技能包"的。

## 官方 Skills 全景

Claude 官方提供了 16 种 Skill Demo，涉及开发、设计、创意、办公等多个领域。

![官方 Skills 全景](/images/articles/claude-skill-design/claude-skill-design-1.png)

下面，我们分别挑选一个简单和一个复杂的 Skill 进行分析。

## 案例一：brand-guidelines skill 解析

### Skill 介绍

`brand-guidelines` 这个 Skill 的作用很简单：**让 AI 掌握 Anthropic 官方品牌的风格**，让 AI 能轻松写出相同风格的网站。

这个 Skill 仅由一个 `SKILL.md` 文件组成，其实就是一段提示词。为了方便理解，我把它翻译成了中文。

### SKILL.md 内容

```markdown
---
name: brand-guidelines
description: 将Anthropic官方品牌颜色和排版应用到任何可能受益于Anthropic外观的工件中。在需要品牌颜色或样式指南、视觉格式化或公司设计标准时使用。
license: 完整条款见LICENSE.txt
---

# Anthropic 品牌样式

## 概述

要访问Anthropic官方品牌标识和样式资源，请使用此技能。

**关键词**: 品牌建设，企业形象，视觉识别，后期处理，样式设计，品牌色彩，排版，Anthropic品牌，视觉格式化，视觉设计

## 品牌指南

### 颜色

**主色调:**

- 深色: `#141413` - 主要文字和深色背景
- 浅色: `#faf9f5` - 浅色背景及深色上的文字
- 中灰: `#b0aea5` - 次要元素
- 浅灰: `#e8e6dc` - 柔和背景

**强调色:**

- 橙色: `#d97757` - 主强调色
- 蓝色: `#6a9bcc` - 次强调色
- 绿色: `#788c5d` - 第三强调色

### 排版

- **标题**: Poppins (备选Arial)
- **正文**: Lora (备选Georgia)
- **注意**: 字体应在您的环境中预装以获得最佳效果

## 功能

### 智能字体应用

- 将Poppins字体应用于标题（24磅及以上）
- 将Lora字体应用于正文
- 如果自定义字体不可用，则自动回退到Arial/Georgia
- 在所有系统上保持可读性

### 文字样式

- 标题（24磅以上）：Poppins字体
- 正文：Lora字体
- 基于背景的智能颜色选择
- 保持文本层次结构和格式

### 形状和强调色

- 非文本形状使用强调色
- 循环使用橙色、蓝色和绿色强调色
- 在保持品牌风格的同时维持视觉趣味

## 技术细节

### 字体管理

- 使用系统安装的Poppins和Lora字体（如果可用）
- 自动回退到Arial（标题）和Georgia（正文）
- 无需安装字体 - 可与现有系统字体配合使用
- 为了获得最佳效果，请在您的环境中预装Poppins和Lora字体

### 颜色应用

- 使用RGB颜色值进行精确的品牌匹配
- 通过python-pptx的RGBColor类应用
- 在不同系统间保持颜色保真度
```

最前面的 `name`、`description` 属于**元信息**,也就是 AI 每次对话都会携带的信息，让 AI 知道存在该技能。

**概述**部分则声明了该 skill 的使用场景与匹配关系，从而让AI准确地理解什么时候才需要使用该 Skill。

再下面就是介绍了 Anthropic 品牌的色彩风格、排版、样式等，这些基本就构成了它的核心审美，足以指导 AI 复刻 Anthropic 品牌风格。

### 实际效果

下面简单尝试使用下这个 Skill。

![使用 brand-guidelines skill 生成的效果](/images/articles/claude-skill-design/claude-skill-design-2.png)

![使用 brand-guidelines skill 生成的效果](/images/articles/claude-skill-design/claude-skill-design-3.png)

可以看到，借助该 Skill 实现的网站风格，非常有 Anthropic 官网的味道。

### 设计亮点

这个 Skill 虽然简单，也有值得学习的设计思路：

**触发机制**：不是简单的关键词匹配，而是基于语义理解的场景识别。不需要刻意强调"使用xx技能"，让 AI 在做设计时，也能让AI匹配到该 Skill。

**错误预防**：内置了常见的错误检查逻辑，比如防止颜色对比度过低影响可读性。

## 案例二：mcp-builder skill 解析

### Skill 介绍

如果说 `brand-guidelines` 是"应用型"Skill 的代表，那么 `mcp-builder` 就是"技术型"Skill 的典范。它要解决一个更复杂的问题：**如何让 AI 理解并有能力创建 MCP 工具**？

按照之前的经验，可以复制一段 MCP 官方介绍，先让 AI 理解，再告诉它实现什么样的 MCP。而该 Skill 则实现了一个更为通用且强大的 SOP。

### Skill 组成

从目录结构看，它的设计显然更复杂。不仅有系统提示词，还有配套的参考文件、代码工具。

![mcp-builder skill 目录结构](/images/articles/claude-skill-design/claude-skill-design-4.png)

### SKILL.md 内容

为了方便理解，仍然将其翻译为中文。

````markdown
---
name: mcp-builder
description: 创建高质量 MCP（模型上下文协议）服务器的指南，使 LLM 能够通过设计良好的工具与外部服务进行交互。在构建 MCP 服务器以集成外部 API 或服务时使用，无论是在 Python（FastMCP）还是 Node/TypeScript（MCP SDK）中。
license: 完整条款见 LICENSE.txt
---

# MCP 服务器开发指南

## 概述

创建 MCP（模型上下文协议）服务器，使 LLM 能够通过设计良好的工具与外部服务进行交互。MCP 服务器的质量由其使 LLM 完成现实世界任务的能力来衡量。

---

# 流程

## 🚀 高级工作流程

创建高质量的 MCP 服务器涉及四个主要阶段：

### 第一阶段：深入研究和规划

#### 1.1 了解现代 MCP 设计

**API 覆盖率与工作流工具：**

在全面的 API 端点覆盖和专门的工作流工具之间取得平衡。工作流工具可能更适合特定任务，而全面覆盖则为代理提供了组合操作的灵活性。性能因客户端而异——一些客户端受益于结合基本工具的代码执行，而其他客户端在使用更高级别的工作流时表现更好。不确定时，优先考虑全面的 API 覆盖。

**工具命名和可发现性：**

清晰、描述性的工具名称帮助代理快速找到正确的工具。使用一致的前缀（例如，`github_create_issue`、`github_list_repos`）和面向动作的命名。

**上下文管理：**

代理受益于简洁的工具描述以及过滤/分页结果的能力。设计返回集中、相关数据的工具。一些客户端支持代码执行，这可以帮助代理高效地过滤和处理数据。

**可操作的错误消息：**

错误消息应通过具体建议和后续步骤引导代理走向解决方案。

#### 1.2 学习 MCP 协议文档

**浏览 MCP 规范：**

从站点地图开始查找相关页面：`https://modelcontextprotocol.io/sitemap.xml`

然后使用 `.md` 后缀获取特定页面的 Markdown 格式（例如，`https://modelcontextprotocol.io/specification/draft.md`）。

需要查看的关键页面：

- 规范概述和架构
- 传输机制（可流式 HTTP、stdio）
- 工具、资源和提示定义

#### 1.3 学习框架文档

**推荐技术栈：**

- **语言**：TypeScript（高质量的 SDK 支持和在许多执行环境中具有良好的兼容性，如 MCPB。此外，AI 模型擅长生成 TypeScript 代码，受益于其广泛使用、静态类型检查和良好的 linting 工具）
- **传输**：远程服务器使用可流式 HTTP，使用无状态 JSON（比有状态会话和流响应更容易扩展和维护）。本地服务器使用 stdio。

**加载框架文档：**

- **MCP 最佳实践**：[📋 查看最佳实践](./reference/mcp_best_practices.md) - 核心指导原则

**对于 TypeScript（推荐）：**

- **TypeScript SDK**：使用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md`
- [⚡ TypeScript 指南](./reference/node_mcp_server.md) - TypeScript 模式和示例

**对于 Python：**

- **Python SDK**：使用 WebFetch 加载 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md`
- [🐍 Python 指南](./reference/python_mcp_server.md) - Python 模式和示例

#### 1.4 规划您的实现

**了解 API：**

查看服务的 API 文档以识别关键端点、认证要求和数据模型。根据需要使用网络搜索和 WebFetch。

**工具选择：**

优先考虑全面的 API 覆盖。列出要实现的端点，从最常见的操作开始。

---

### 第二阶段：实施

#### 2.1 设置项目结构

参见特定语言的指南进行项目设置：

- [⚡ TypeScript 指南](./reference/node_mcp_server.md) - 项目结构、package.json、tsconfig.json
- [🐍 Python 指南](./reference/python_mcp_server.md) - 模块组织、依赖项

#### 2.2 实现核心基础设施

创建共享实用程序：

- 带认证的 API 客户端
- 错误处理助手
- 响应格式化（JSON/Markdown）
- 分页支持

#### 2.3 实现工具

对于每个工具：

**输入模式：**

- 使用 Zod（TypeScript）或 Pydantic（Python）
- 包含约束和清晰描述
- 在字段描述中添加示例

**输出模式：**

- 在可能的情况下定义 `outputSchema` 以获得结构化数据
- 在工具响应中使用 `structuredContent`（TypeScript SDK 功能）
- 帮助客户端理解和处理工具输出

**工具描述：**

- 功能的简洁摘要
- 参数描述
- 返回类型模式

**实现：**

- 对 I/O 操作使用 async/await
- 适当的错误处理，提供可操作的消息
- 在适用时支持分页
- 使用现代 SDK 时返回文本内容和结构化数据

**注释：**

- `readOnlyHint`: true/false
- `destructiveHint`: true/false
- `idempotentHint`: true/false
- `openWorldHint`: true/false

---

### 第三阶段：审查和测试

#### 3.1 代码质量

审查以下方面：

- 无重复代码（DRY 原则）
- 一致的错误处理
- 全面的类型覆盖
- 清晰的工具描述

#### 3.2 构建和测试

**TypeScript：**

- 运行 `npm run build` 验证编译
- 使用 MCP Inspector 测试：`npx @modelcontextprotocol/inspector`

**Python：**

- 验证语法：`python -m py_compile your_server.py`
- 使用 MCP Inspector 测试

参见特定语言的指南，了解详细的测试方法和质量检查清单。

---

### 第四阶段：创建评估

实现 MCP 服务器后，创建全面的评估来测试其有效性。

**加载 [✅ 评估指南](./reference/evaluation.md) 获取完整的评估指导。**

#### 4.1 了解评估目的

使用评估测试 LLM 是否能有效使用您的 MCP 服务器回答现实、复杂的问题。

#### 4.2 创建 10 个评估问题

要创建有效的评估，请按照评估指南中概述的过程进行：

1. **工具检查**：列出可用工具并了解其功能
2. **内容探索**：使用只读操作探索可用数据
3. **问题生成**：创建 10 个复杂、现实的问题
4. **答案验证**：自己解决每个问题以验证答案

#### 4.3 评估要求

确保每个问题都是：

- **独立的**：不依赖于其他问题
- **只读的**：仅需非破坏性操作
- **复杂的**：需要多次工具调用和深度探索
- **现实的**：基于人类关心的真实用例
- **可验证的**：单一、明确的答案，可通过字符串比较验证
- **稳定的**：答案不会随时间变化

#### 4.4 输出格式

创建具有此结构的 XML 文件：

```xml
<evaluation>
  <qa_pair>
    <question>寻找关于以动物代号命名的 AI 模型发布的讨论。一个模型需要特定的安全标识，使用 ASL-X 格式。名为斑点野猫模型的 X 数字是多少？</question>
    <answer>3</answer>
  </qa_pair>
<!-- 更多 qa_pairs... -->
</evaluation>
```

---

# 参考文件

## 📚 文档库

在开发过程中根据需要加载这些资源：

### 核心 MCP 文档（首先加载）

- **MCP 协议**：从 `https://modelcontextprotocol.io/sitemap.xml` 的站点地图开始，然后使用 `.md` 后缀获取特定页面
- [📋 MCP 最佳实践](./reference/mcp_best_practices.md) - 通用 MCP 指导原则，包括：
  - 服务器和工具命名约定
  - 响应格式指南（JSON 与 Markdown）
  - 分页最佳实践
  - 传输选择（可流式 HTTP 与 stdio）
  - 安全和错误处理标准

### SDK 文档（在第 1/2 阶段加载）

- **Python SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/python-sdk/main/README.md` 获取
- **TypeScript SDK**：从 `https://raw.githubusercontent.com/modelcontextprotocol/typescript-sdk/main/README.md` 获取

### 特定语言实现指南（在第 2 阶段加载）

- [🐍 Python 实现指南](./reference/python_mcp_server.md) - 完整的 Python/FastMCP 指南，包括：
  - 服务器初始化模式
  - Pydantic 模型示例
  - 使用 `@mcp.tool` 注册工具
  - 完整的工作示例
  - 质量检查清单

- [⚡ TypeScript 实现指南](./reference/node_mcp_server.md) - 完整的 TypeScript 指南，包括：
  - 项目结构
  - Zod 模式
  - 使用 `server.registerTool` 注册工具
  - 完整的工作示例
  - 质量检查清单

### 评估指南（在第 4 阶段加载）

- [✅ 评估指南](./reference/evaluation.md) - 完整的评估创建指南，包括：
  - 问题创建指南
  - 答案验证策略
  - XML 格式规范
  - 示例问题和答案
  - 使用提供的脚本运行评估
````

### 核心设计理念

可以看到，这个 Skill 的设计非常完善。通过**渐进式学习思路**，将创建 MCP 服务器的过程拆解为四个阶段：

1. **深入研究和规划：**了解 MCP 设计原则、学习协议文档、选择技术栈
2. **实施：**项目结构搭建、核心基础设施实现、工具开发
3. **审查和测试：**代码质量检查、构建和测试
4. **创建评估：**评估框架设计和验证

**评估策略**：该 skill 内置了完整的**评估流程**与**评估工具**，确保 AI 在完成 MCP 服务器后能够验证其质量和有效性。属于是完整闭环了。

**一些细节**

- 多语言支持：Skill 同时提供 TypeScript 和 Python 的完整实现指南，适应不同技术栈的开发者。
- 设计原则：Skill 中还详细说明了 MCP 设计的几个关键原则，包括工具命名、上下文管理、错误消息设计、技术选型 等。

## 对比分析

通过分析这两个 Skill，我们可以总结一些官方 Skill 设计的核心原则：

### 1. 明确的问题边界

- `brand-guidelines：` 专注于视觉样式规范化
- `mcp-builder：` 专注于 MCP 服务器开发指导

**启示**：好的 Skill 应该有清晰的功能边界，避免"大而全"。

### 2. 分层知识组织

```text
概念层（是什么） → 流程层（怎么做） → 工具层（用什么）
```

**启示**：复杂任务需要分层次、渐进式的指导。

### 3. 场景化触发机制

- 基于语义理解而非关键词匹配
- 考虑用户的真实使用场景

**启示**：Skill 应该"聪明地"知道何时该出场。

### 4. 丰富的参考文档与工具

```text
推荐材料清单：
- ✅ 核心概念说明
- ✅ 标准作业流程
- ✅ 代码模板示例
- ✅ 常见问题解答
- ✅ 最佳实践指南
```

### 5. 错误预防

两个 Skill 都体现了"预防优于修复"的设计思想：

- 预判常见错误场景
- 提供验证和检查机制
- 给出错误恢复建议

---

这些官方 Skills 的确很值得学习深究，在我们总是抱怨 "AI 返回不稳定"、"提示词质量不高" 时，不妨学习下这些官方文档的设计思路，总能有所启发。

当前，如果要设计一个Skill，也不必亲自动手，使用官方的 Skill-creater 就能创建一个优秀的 Skill。前文已经做过介绍。

## 参考

- 官方 Skill 仓库：https://github.com/anthropics/skills
- Agent Skills 官方介绍：https://claude.com/blog/skills

---

**延伸阅读**：

- [拒绝幻觉与失控：AI Agent 建设的 17 种架构](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483800&idx=1&sn=a2f3c586f64ebc5481e504cda0c11c69&scene=21#wechat_redirect)
- [Agent Skills 又是什么神器？能取代 MCP 吗？](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483754&idx=1&sn=a8c9bb6cfa584e40cfc11e021520f10c&scene=21#wechat_redirect)
- [如何微调一个自动化测试 AI 模型？门槛超低，无需写代码](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483731&idx=1&sn=cdf536e787e7af6563d610db9f74b65b&scene=21#wechat_redirect)
- [AI 如何操控你的浏览器？能否代替传统自动化测试？](https://mp.weixin.qq.com/s?__biz=MzkwNTIyMTQ1Mw==&mid=2247483703&idx=1&sn=a94bac63514a4fa93cef4d65d34aac64&scene=21#wechat_redirect)

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
> 
> 关注我：一起学习 AI 技术

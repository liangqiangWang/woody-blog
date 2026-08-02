---
title: "Claude Agent SDK 实践——搭建一个测试用例生成 agent，支持 skill"
date: 2026-04-12
desc: "利用 Claude Agent SDK 制作一个用例生成系统。"
category: "AI应用"
tags: ["Claude", "Agent SDK", "测试自动化", "Skill", "Python"]
layout: "standard"
cover: "/images/articles/claude-agent-sdk-practice/cover.jpg"
readTime: 18
draft: false
---

![Claude Agent SDK](/images/articles/claude-agent-sdk-practice/claude-agent-sdk-practice-1.jpg)

# Claude Agent SDK 实践——搭建一个测试用例生成 agent，支持 skill

> AI 转型已经是国内 IT 企业的共识，我司也不例外。目前已经建设了多种通用 AI 能力，如 用例生成、代码分析、测试数据统计 等。背后核心的能力是 Claude Agent SDK 。

Claude Code 已经成了很多人编码的标配。你是否想过：__如何能把它集成到自己的系统里？__

Claude Agent SDK 一定是首选——Anthropic 官方 SDK，让你用不到百行代码，就能搭建一个生产级的 Agent。

本文将从概念、API 和实战三个角度，带你快速上手。

## 一、Claude Agent SDK 是什么

### 概念

__Claude Agent SDK__ 是 Anthropic 推出的开发工具包。

简单来说，它把 Claude Code 的核心能力——__Agent 循环、工具执行、上下文管理__——封装成了可编程的 Python/TypeScript 库。可以作为 __生产级 Agent 的基础设施__。

能用非常简单的代码，就拥有一个完整的"数字员工"能力：自主读取文件、执行命令、搜索网络、编辑代码，支持 Skill、MCP，甚至协调多个子 Agent 并行工作。

相比 langchain 这类框架而言，你无需自己实现 agent 内部逻辑，开箱即用。

### 典型应用场景

- __代码审查__：集成到代码工作流，通过 `Read`、`Grep` 扫描代码库，审查代码质量与风险
- __测试生成__ ：结合代码分析自动生成测试用例，并在代码变更时智能更新
- __CI/CD 集成__：在 GitHub Actions/GitLab CI 中实现从 Issue → 代码 → PR 的自动化流程
- __多 Agent 协作__ ：主 Agent 拆解任务，派生子 Agent 并行处理，提供强大的任务执行能力
- __企业知识库__：通过 MCP 连接内部系统，构建具备工具调用能力的 Agent

## 二、开箱即用的 API

SDK 提供两套 API，满足不同使用场景：__函数式 API（`query`）__ 和 __客户端类 API（`ClaudeSDKClient`）__。

### API 对比

| 特性 | `query()` | `ClaudeSDKClient` |
| --- | --- | --- |
| 会话管理 | 每次创建新会话 | 复用同一会话 |
| 对话模式 | 单次交互 | 多轮持续对话 |
| 连接管理 | 自动管理 | 手动控制 |
| 流式输入 | ✅ 支持 | ✅ 支持 |
| 中断能力 | ❌ 不支持 | ✅ 支持 |
| 使用场景 | 一次性任务、独立脚本 | 交互式应用、对话系统 |

### 1. query() - 函数式 API

适合__一次性任务__，每次调用都创建全新会话，无上下文记忆。

```python
from claude_agent_sdk import query, ClaudeAgentOptions
  
async for msg in query(
    prompt="分析这个代码库的安全漏洞",
    options=ClaudeAgentOptions(
        system_prompt="你是安全专家",
        allowed_tools=["Read", "Grep", "WebSearch"],
        permission_mode="acceptEdits",
        cwd="."
    )
):
    # 处理返回的消息流
    print(msg)
```

### 2. ClaudeSDKClient - 客户端类 API

最适合__多轮对话__，维护会话上下文，支持更精细的控制。

```python
from claude_agent_sdk import ClaudeSDKClient, ClaudeAgentOptions
  
async def main():
    client = ClaudeSDKClient(
        options=ClaudeAgentOptions(
            system_prompt="你是编程助手",
            permission_mode="acceptEdits"
        )
    )
      
    await client.connect()
      
    # 发送消息
    await client.send_message("帮我创建一个用户注册接口")
      
    # 接收响应
    async for msg in client.receive_messages():
        print(msg)
        if msg.type == "end":
            break
      
    # 继续对话（保留上下文）
    await client.send_message("再添加登录验证")
    async for msg in client.receive_messages():
        print(msg)
      
    await client.disconnect()
```

### 3. 会话管理函数

SDK 提供了完整的会话生命周期管理：

```python
from claude_agent_sdk import (
    list_sessions,      # 列出所有会话
    get_session_info,   # 获取会话详情
    get_session_messages, # 获取会话历史消息
    rename_session,     # 重命名会话
    tag_session         # 为会话添加标签
)
  
# 列出所有活跃会话
sessions = await list_sessions()
  
# 获取特定会话的信息
info = await get_session_info(session_id="xxx")
  
# 获取会话的完整消息历史
messages = await get_session_messages(session_id="xxx")
```

### 配置选项详解

`ClaudeAgentOptions` 的核心参数：

```python
options = ClaudeAgentOptions(
    # 权限模式
    permission_mode="acceptEdits",  # acceptEdits | dontAsk | auto | bypassPermissions | default
      
    # 行为配置
    system_prompt="你是资深开发者",  # 系统提示词
    allowed_tools=["Read", "Edit"],  # 允许的工具白名单
    cwd=".",                         # 工作目录
      
    # 扩展能力
    mcp_servers={},                 # MCP 服务器配置
    hooks={},                       # 生命周期钩子
    custom_tools=[],                # 自定义工具
)
```

### 权限模式

| 模式 | 行为 | 适用场景 |
| --- | --- | --- |
| `acceptEdits` | 自动批准文件编辑和常见文件系统命令 | 可信的开发工作流 |
| `dontAsk` | 拒绝白名单外的所有操作 | 锁定的无头 Agent |
| `auto` | 模型分类器自动决策（仅 TypeScript） | 带安全护栏的自主 Agent |
| `bypassPermissions` | 无需批准运行所有工具 | 沙箱化 CI、完全可信环境 |
| `default` | 需要提供 `canUseTool` 回调 | 自定义审批流程 |

### SDK 开箱即用，内置多种工具集：

| 类别 | 工具 |
| --- | --- |
| __文件操作__ | `Read` 、`Write`、`Edit` |
| __代码搜索__ | `Grep` 、`Glob` |
| __命令执行__ | `Bash` （支持超时） |
| __网络能力__ | `WebSearch` 、`WebFetch` |
| __Agent 协作__ | `Agent` （子 Agent）、`TodoWrite`（任务追踪） |
| __交互能力__ | `AskUserQuestion` 、`ScheduleWakeup` |

## 三、实战: 搭建一个用例生成 Agent

下面看看如何利用 Claude Agent SDK 搭建一个用例生成的 Agent，支持调用 skill。

以下 Demo 实现了两个基础能力，并封装成了 http 接口：

- 根据需求文本生成用例
- 分析代码变更生成用例

__注：__ 该演示项目也是由 ClaudeCode 完成，提示词放在文末。

### 项目结构

```
case-generator-demo/
├── main.py                  # 服务入口
├── pyproject.toml          # 依赖配置
├── api/
│   └── server.py           # FastAPI 接口
├── agent/
│   └── case_agent.py        # Agent 核心逻辑
| 
├── 📁 .claude/                       
│   ├── settings.local.json           
│   └── skills/                      # Claude Skills 定义
│       ├── requirement-analyzer/    # 需求分析 Skill
│       │   └── SKILL.md            
│       └── case-generator/          # 用例生成 Skill
│           └── SKILL.md             
├── prompts/
├── utils/
│   ├── logger.py            # 日志（基于 Hooks）
│   └── git_reader.py        # Git 变更读取
└── static/index.html        # 一个简单的 H5 页面，用于演示
```

### 核心代码

整个项目中，核心的只有这一个函数。

它已经集成了 agent 能力，支持执行 Skill、读取文件、网络搜索等。

```python
""" 
Claude Agent SDK 最小化示例 - 测试用例生成 
"""
from claude_agent_sdk import query, ClaudeAgentOptions
  
  
async def generate_test_case(requirement: str) -> str:
    """
    使用 Claude Agent SDK 生成测试用例
    
    Args:
        requirement: 需求描述
        
    Returns:
        生成的测试用例文本
    """
    # 1. 配置 Agent 选项
    options = ClaudeAgentOptions(
        permission_mode="acceptEdits",    # 自动接受文件编辑权限
        system_prompt="你是测试用例生成专家，输出格式：用例编号 | 标题 | 步骤 | 预期结果",
        allowed_tools=["Skill", "Read", "WebSearch"],  # 允许使用的工具
        cwd=".",                           # 工作目录
    )
      
    # 2. 构造提示词
    prompt = f"为以下需求生成测试用例：\n{requirement}"
      
    # 3. 调用 query 并收集响应
    messages = []
    async for msg in query(prompt=prompt, options=options):
        messages.append(msg)
      
    # 4. 提取文本内容
    content = []
    for msg in messages:
        if hasattr(msg, "content"):
            for block in msg.content:
                if hasattr(block, "text"):
                    content.append(block.text)
      
    return "\n".join(content)
  
  
# 使用示例
if __name__ == "__main__":
    import asyncio
      
    requirement = "用户登录功能：支持邮箱/手机号登录，密码长度6-20位"
    result = asyncio.run(generate_test_case(requirement))
    print(result)
```

### 功能演示

#### 1. 根据需求文本，生成测试用例

调用接口生成用例，生成质量取决于 skill 的质量。耗时会比较长，和本地使用 ClaudeCode 类似。

注：图中为一个临时的H5页面，用于演示调用接口

![用例生成界面](/images/articles/claude-agent-sdk-practice/claude-agent-sdk-practice-2.png)

生成用例的过程，会自动加载对应的 skill。

![Skill加载](/images/articles/claude-agent-sdk-practice/claude-agent-sdk-practice-3.png)

#### 2. 根据代码变更，生成测试用例

![代码变更分析](/images/articles/claude-agent-sdk-practice/claude-agent-sdk-practice-4.png)

自动加载 skill，获取git 变更信息。

![Git变更处理](/images/articles/claude-agent-sdk-practice/claude-agent-sdk-practice-5.png)

## 四、小结

以上虽然只是一个示例项目，但其实已经是一个比较完整的 agent。只需要__持续建设对应的 Skill、MCP__，就能让用例生成功能变得更加强大。

比如：

- 增加意图识别、集成业务知识查询
- 根据url读取需求文档、交互文档
- 生成更多格式的用例，对接用例管理系统

Claude Agent SDK 的意义是能够低成本搭建属于自己的 BS 架构 agent，能够把一些通用 Agent 能力从本地转移到线上，提供标准且统一的服务端 Agent 能力。

### 附录

以下是该项目的生成指令。交给 Claude Code 就能得到一份相类似的用例生成功能。

```markdown
# 需求规格说明书：基于 Claude Agent SDK 的用例生成服务

## 1. 项目概述
基于 Claude Agent SDK 构建一套测试用例生成服务。用户通过输入需求文档或代码变更信息，由 AI Agent 自动分析并输出标准化的测试用例。

## 2. 项目范围
本次仅实现 API 接口层，不包含前端交互界面。

## 3. 功能需求
### 3.1 输入管理

支持以下输入源：

| 输入类型 | 说明 | 支持格式 |
|---------|------|---------|
| 需求文档 | 上传业务需求作为用例生成依据 | text |
| 代码变更 | 提交 MR 或 Commit 信息，基于代码变更生成用例（对应的代码仓库目录固定，可直接访问） | MR 链接、Commit Hash |

### 3.2 用例生成

- 根据输入内容，调用 Claude Agent 进行分析并自动生成测试用例。
- 生成的用例应覆盖主要业务场景和边界条件。

### 3.3 输出管理

支持指定输出格式：
| 输出格式 | 说明 |
|---------|------|
| 文本格式 | 输出结构化的纯文本用例 |
| XMind 格式 | 输出 `.xmind` 文件，可直接导入用例管理工具 |

## 4. 非功能需求
### 4.1 格式化日志输出
服务运行过程中需输出格式化日志，清晰展示 Agent 的完整执行过程，包括但不限于：
- Agent 的思考/推理过程
- 各工具（Tool）的调用名称、入参与返回结果
- 各步骤的耗时信息
日志应具备良好的可读性，便于直观呈现 Agent 的工作流程。

## 5. 技术要求
- 基于 Claude Agent SDK 构建 Agent 服务。
- 支持内置 Skill 机制，预置若干用例生成相关 Skill，用于引导生成流程。

## 6. 参考文档

https://code.claude.com/docs/en/agent-sdk/quickstart
```

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
> 
> 关注我：一起学习 AI 技术和测试自动化

延伸阅读：

- 推荐新人掌握的 Claude Code 使用技巧，以及一个彩蛋
- Git worktree，让 ClaudeCode  并行开发不冲突
- Andrej 大神力荐的 NanoClaw 怎么用？20 分钟安装上手，并对接飞书
- Agent Skills 又是什么神器？能取代 MCP 吗？
- 拒绝幻觉与失控：AI Agent 建设的 17 种架构
---
name: 微博 API Skill
desc: 查询微博热搜（免登录）、用户微博、首页时间线和分组微博的 API 工具，支持命令行与代码两种用法。
icon: at-sign
tags: [微博, API, Skill, Claude Code]
accent: '#e6162d'
kind: doc
---

## 这是什么

一个查询微博内容的 API Skill，基于微博开放平台 OAuth2.0 鉴权，覆盖**热搜、用户微博、首页时间线、分组微博**四类场景。最大的亮点是**热搜完全免登录**——不走官方鉴权接口，而是直接抓取微博网页端内部的热搜 ajax 接口，开箱即用。开源地址：

- 仓库地址：https://github.com/liangqiangWang/woody-skills

## 核心功能

**热搜免登录（最推荐）**

通过 `weibo.com` 网页端的内部热搜接口直接抓取，带浏览器 User-Agent 伪装，**不需要任何 token**。返回实时热搜（热度、标签、分类）与政务热搜，热度数字自动换算为可读的 `M`/`W`（万）格式。

```bash
node scripts/index.js hot_search           # 获取完整热搜榜
node scripts/index.js hot_search --limit 20  # 只看前 20 条
```

**五种查询模式**

| 命令 | 功能 | 权限要求 |
|------|------|---------|
| `hot_search` | 微博热搜榜（含政务热搜） | 🔥 **免登录** |
| `home_timeline` | 首页时间线（关注的人） | ✅ 基础权限 |
| `user_timeline` | 指定用户的微博 | ⚠️ 仅限当前用户 |
| `groups` | 关注分组列表 | ⚠️ 特殊权限 |
| `group_timeline` | 分组内的微博 | ⚠️ 特殊权限 |

**分组微博的巧妙实现**

微博官方 API 并没有「按分组拉取微博」的接口。这个 skill 的做法是：先调 `friendships/groups/members` 拿到分组内的用户列表，再逐个批量抓取每个用户最近的微博，最后按时间戳排序合并输出；单个用户抓取失败会自动跳过，不影响整体结果。

**可读的格式化输出**

微博列表以清晰易读的文本呈现：时间、用户昵称、内容、转发/评论/点赞数、图片张数、转发来源，配 emoji 标注。

**CLI 与代码双用法**

既可以命令行直接查询：

```bash
# 查询指定用户的微博（uid 与昵称二选一）
node scripts/index.js user_timeline --uid 123456789
node scripts/index.js user_timeline --screen_name "用户昵称"

# 首页时间线，只看原创微博
node scripts/index.js home_timeline --count 30 --feature 1
```

也可以在代码中调用：

```javascript
const WeiboClient = require('./scripts/lib/weiboClient');
const client = new WeiboClient(); // token 自动读环境变量
const timeline = await client.getHomeTimeline({ count: 20 });
```

**通用参数**

- `count`：返回条数，默认 20，最大 100
- `page`：页码，从 1 开始
- `feature`：过滤类型，`0` 全部 / `1` 原创 / `2` 图片 / `3` 视频 / `4` 音乐
- `--debug`：调试模式，打印请求 URL 与响应数据

### 使用前提

设置访问令牌（**热搜功能不需要**）：

```bash
export WEIBO_ACCESS_TOKEN="your_token"
```

令牌获取：访问[微博开放平台](https://open.weibo.com/)创建应用，完成 OAuth2.0 授权。运行环境需 Node.js 18+（使用原生 fetch，低版本自动回退 node-fetch）。

### 权限与错误码

不同接口对 token 的权限要求差异较大，建议按权限梯度选用：

- 🌟 **优先 `hot_search`**：完全免登录，无鉴权成本；
- **`home_timeline`**：关注动态最稳定的获取方式，所有 token 可用；
- `user_timeline` 只能查自己，查他人返回 `21335`；
- `groups` / `group_timeline` 需要高级权限，普通 token 返回 `21330 (access_denied)`。

常见错误码：

| 错误码 | 含义 | 处理建议 |
|--------|------|---------|
| `21332` | token 无效或已过期 | 重新授权 |
| `21330` | token 缺少接口权限 | 该接口需要高级权限，换用低权限接口 |
| `21335` | 只能查询当前用户 | `user_timeline` 传自己的 uid |

## 适合谁用

- 想免登录刷微博热搜、做热点监控与分析的开发者；
- 在 Claude Code / NanoClaw 等 Agent 里做「AI 刷微博」，定时抓取时间线并按规则过滤推送的人。

## 相关文章

- [NanoClaw 养虾一周体验：我的四个真实使用场景](/articles/nanoclaw-week) —— 场景三「AI 刷微博」就是用这个 skill 定时抓取时间线、过滤后推送。

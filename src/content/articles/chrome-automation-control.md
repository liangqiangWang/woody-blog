---
title: "Agent 终于能实时控制 Chrome 了！还能集成到 UI自动化中"
date: 2026-04-27
desc: "Agent 可以直连你在用的 Chrome 了？探究下原理"
category: "浏览器自动化"
tags: ["Chrome", "Agent", "MCP", "Puppeteer", "UI自动化"]
layout: "standard"
cover: "/images/articles/chrome-automation-control/cover.jpg"
readTime: 15
draft: false
---

> Chrome 在3月的正式版中支持了 MCP 直连能力，方便 Agent 直接访问页面。其实，也能接入到 puppeteer 中，提高 UI 自动化调试效率。

OpenClaw 在3月中旬更新了一个新功能——__`直连 Chrome`__。

什么意思？之前小龙虾要操控浏览器，往往是要新启动一个 Chrome 实例，再去操作。

现在不同了，它可以__直接连接并操作你正在用的 Chrome__。

这意味着，Agent 可以直接复用你正在使用的 Chrome，保留登录态、保留 cookie 等所有用户信息。

![直连Chrome](/images/articles/chrome-automation-control/chrome-automation-control-1.png)

接下来，我们一起探究下它的实现机制，以及如何接入到 UI 自动化项目中（puppeteer）。

## 一、上手体验：让 Agent 直连上你的 Chrome

通过 Openclaw 的日志可以发现，其实是默认集成了 `chrome-devtools-mcp`，它是 Chrome 官方的 MCP 工具，所以核心能力也是它提供的。

它本身的能力也很强大，支持 获取网页内容、操作Chrome页面、截图、监控网络、访问控制台 等等。

![Chrome MCP能力](/images/articles/chrome-automation-control/chrome-automation-control-2.png)

下面就实操一下 `Claude Code` + `chrome-devtools-mcp`，看看体验如何。

### 前置条件

1. __Chrome 升级到 146__
2. __启用远程调试__

打开 `chrome://inspect/#remote-debugging`，勾选允许调试即可。

![启用远程调试](/images/articles/chrome-automation-control/chrome-automation-control-3.png)

### 安装 Chrome Dev MCP

Claude Code 用户可以一键安装。

```bash
claude mcp add chrome-devtools -- npx chrome-devtools-mcp@latest --autoConnect

# 注：autoConnect 就表示直连已启动的 Chrome。
```

或 自行配置：

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest", "--autoConnect"]
    }
  }
}
```

安装完成后，Agent 就能通过 MCP 直接访问、操作你当前打开的标签页、读取页面内容。

出于安全考虑，Agent 在使用 MCP 连接浏览器时必须要人工确认。

![确认调试](/images/articles/chrome-automation-control/chrome-automation-control-4.png)

允许调试后，页面上方会提示正在被自动化程序控制。

Agent 就能实时访问、操作当前的页面，无需启动额外的 Chrome。

![实时操作](/images/articles/chrome-automation-control/chrome-automation-control-5.png)

__和传统方式的区别：__

| 传统方式 | 直连方式 |
| --- | --- |
| 启动新浏览器实例 | 连接已有实例 |
| 需要重新登录 | 复用登录态 |
| 独立环境 | 真实用户环境 |

---

## 二、深入了解直连 Chrome 的原理

### Puppeteer 的 connect 模式

熟悉 Puppeteer 的同学应该知道，其内部提供了一个 Connect 函数，就是用于连接 Chrome 实例的。

常规使用方式分为3步：

__步骤1: 通过 debug 参数启动 Chrome__

```bash
/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222  --user-data-dir xxx
```

__步骤2: 获取 WebSocket 信息__

访问该端口地址(`http://127.0.0.1:9222/json/version`)，就能得到调试信息。 数据格式如下：

```json
{
  "Browser": "Chrome/146.0.6814.46",
  "Protocol-Version": "1.3",
  "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/..."
}
```

__步骤3: 通过 Connect 方法连接__

```javascript
const browser = await puppeteer.connect({
    browserWSEndpoint: webSocketDebuggerUrl,
    defaultViewport: null,
  });
```

但是，通过`user-data-dir`参数启动的 Chrome 有独立的用户数据，和我们自己用的 Chrome 数据完全隔离，所以无法访问你的 cookie、共享登录状态。

所以，这个直连的功能又是怎么实现的？我非常好奇。

因为直接访问端口地址会404，无法获取到 websocket 信息。

### 让 ClaudeCode 分析源码

于是，我把 `chrome-devtools-mcp` 的源码丢给 Claude Code，让它帮我分析 `autoConnect` 的实现逻辑。

![源码分析](/images/articles/chrome-automation-control/chrome-automation-control-6.png)

__核心结论：__

__1. DevToolsActivePort 文件__

Chrome 启用远程调试后，会在用户数据目录下生成一个文件：`DevToolsActivePort`

内容只有两行：

```
9222
/devtools/browser/abc123-def456-...
```

第一行是端口号，第二行是 WebSocket 路径。

有了这两个信息，就能得到 Connect 函数的参数。

__2. 连接流程__

Chrome MCP 仍然是使用 Puppeteer 实现连接 Chrome的。

一张图说清楚：

![连接流程](/images/articles/chrome-automation-control/chrome-automation-control-7.png)

---

## 三、实战：在 Puppeteer 自动化项目中实现直连 Chrome

既然了解了它的原理，就能把它引入到我们的 UI自动化测试项目了。

通过直连已启动的 Chrome，能大幅降低调试成本。

### 场景

在自动化测试调试过程中，如果需要操作一个已登录的网站：

- 传统做法：
  - 脚本中需要执行完整的前置登录逻辑，再开始操作。
  - 或者，通过命令行启动一个独立的 Chrome 实例，手动操作登录后，然后connect 到这个独立进程。

- 现在：直接连接已经登录的 Chrome，跳过这一步。

### 核心代码

获取用户数据目录，并读取 DevToolsActivePort 文件中的端口和ws地址：

```javascript
/**
 * 根据操作系统和 Chrome 通道获取用户数据目录
 */
function getUserDataDir(channel = 'stable') {
  const platform = os.platform();
  const channelMap = {
    'stable': 'Chrome',
    'beta': 'Chrome Beta',
    'dev': 'Chrome Dev',
    'canary': 'Chrome Canary'
  };

  const chromeName = channelMap[channel] || channelMap['stable'];

  if (platform === 'darwin') {
    // macOS
    return path.join(
      os.homedir(),
      'Library',
      'Application Support',
      'Google',
      chromeName
    );
  } else if (platform === 'win32') {
    // Windows
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return path.join(localAppData, 'Google', chromeName, 'User Data');
  } else {
    // Linux
    return path.join(
      os.homedir(),
      '.config',
      'google-chrome' + (channel !== 'stable' ? `-${channel}` : '')
    );
  }
}

/**
 * 读取并解析 DevToolsActivePort 文件
 * 
 * Chrome 会在用户数据目录中创建这个文件，包含：
 * - 第一行：调试端口号
 * - 第二行：WebSocket 路径
 */
async function readDevToolsActivePort(userDataDir) {
  const portPath = path.join(userDataDir, 'DevToolsActivePort');

  console.log(`📂 读取文件: ${portPath}`);

  try {
    const fileContent = await fs.readFile(portPath, 'utf8');
    const lines = fileContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error(`DevToolsActivePort 文件格式无效，需要至少两行（端口和路径）`);
    }

    const [rawPort, rawPath] = lines;
    const port = parseInt(rawPort, 10);

    if (isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(`无效的端口号: ${rawPort}`);
    }

    console.log(`✅ 解析成功:`);
    console.log(`   端口: ${port}`);
    console.log(`   路径: ${rawPath}`);

    return { port, path: rawPath };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `DevToolsActivePort 文件不存在。\n` +
        `请确保:\n` +
        `1. Chrome 正在运行\n` +
        `2. 远程调试已启用（访问 chrome://inspect/#remote-debugging）\n` +
        `3. 已允许调试连接\n` +
        `4. 用户数据目录正确: ${userDataDir}`
      );
    }
    throw error;
  }
}

/**
 * 连接到已运行的 Chrome 实例
 */
async function connectToChrome(channel = 'stable') {
  console.log(`🔌 连接到 Chrome (${channel} 通道)...\n`);

  // 1. 获取用户数据目录
  const userDataDir = getUserDataDir(channel);
  console.log(`📁 用户数据目录: ${userDataDir}`);

  // 2. 读取 DevToolsActivePort 文件
  const { port, wsPath } = await readDevToolsActivePort(userDataDir);

  // 3. 构建 WebSocket 端点 URL
  const browserWSEndpoint = `ws://127.0.0.1:${port}${wsPath}`;
  console.log(`🔗 WebSocket 端点: ${browserWSEndpoint}\n`);

  // 4. 使用 Puppeteer 连接
  console.log(`⚡ 正在连接...`);
  const browser = await puppeteer.connect({
    browserWSEndpoint,
    defaultViewport: null,
  });

  console.log(`✅ 连接成功！\n`);

  return browser;
}
```

下面就是常规的 puppeteer 代码，连接到 Chrome 之后，就能正常操作它了。

```javascript
/**
 * 主函数：连接和页面操作
 */
async function main() {
  const channel = process.env.CHROME_CHANNEL || 'stable';
  const targetUrl = process.env.TARGET_URL || 'https://example.com';

  // 连接到 Chrome
  const browser = await connectToChrome(channel);

  // 获取所有页面
  const pages = await browser.pages();
  console.log(`📄 当前打开的页面数量: ${pages.length}`);

  // 创建新页面或使用现有页面
  let page;
  if (pages.length === 0) {
    console.log(`🆕 创建新页面...`);
    page = await browser.newPage();
  } else {
    console.log(`🔄 使用现有页面...`);
    page = pages[0];
  }

  // 访问目标页面
  console.log(`🌐 访问页面: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });
}
```

## 总结

Agent 直连 Chrome 其实并没有什么黑科技，仍然沿用的 Puppeteer Connect 这套逻辑。只是 Chrome 最近放开了标准用户的 debug 权限，不用再开启独立的，也是为了更好的服务于 Agent。

对于龙虾用户、开发者来说，都是非常便利的功能：

- __复用登录态：省去每次登录的麻烦__
- __真实环境测试：不再是隔离的干净环境__
- __减少环境准备成本：直接用现有的浏览器，开发者调试神器__

---

> 如果这篇文章对你有帮助，欢迎点赞、转发！
> 
> 关注我：一起学习 AI 技术和浏览器自动化
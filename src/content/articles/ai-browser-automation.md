---
title: "AI 如何操控你的浏览器？能否代替传统自动化测试？"
date: 2025-07-07
desc: "有没有想过，AI 是如何操作浏览器的？"
category: "浏览器自动化"
tags: ["AI", "MCP", "Playwright", "Midscene", "浏览器自动化"]
layout: "standard"
cover: "/images/articles/ai-browser-automation/cover.jpg"
readTime: 4
draft: false
---

在 25 年的 AI 领域， MCP 技术一定是上半年最火爆的技术之一。其中有一类MCP工具，可以让 AI 操作浏览器，仅需给定任务目标，AI 便能自主启动浏览器并完成任务操作。

除了 MCP 工具外，一些独立框架比如 browser_use、字节的 Midscene也实现了类似的功能。为自动化测试等领域带来了新的可能性。

那么，这些框架是如何实现操作浏览器的？

下面我尝试针对 playwright-mcp 和 Midscene，通过抓包、分析源码的方式，简单探究下它们的机制与原理。

## 一、从 MCP 原理看 playwright-mcp

熟悉 UI 自动化测试的同学应该对 playwright 不陌生，它是微软推出的开源自动化测试框架，提供了强大的浏览器操控能力。

```javascript
// 举例：打开google搜索关键字
const { chromium } = require('playwright'); 
(async () => {
    // 启动浏览器
    const browser = await chromium.launch({ 
        headless: false });
    // 创建新页面
    const page = await browser.newPage();
    // 导航到Google首页
    await page.goto('https://www.google.com');
    // 等待搜索框出现并输入"AI 技术"
    await page.waitForSelector('textarea[name="q"]');
    await page.fill('textarea[name="q"]', 'AI 技术');
    // 按下Enter键执行搜索
    await page.press('textarea[name="q"]', 'Enter');
    // 等待搜索结果页面加载完成
    await page.waitForSelector('#search');
    console.log('搜索"AI 技术"成功！');
    
})();
```

而 playwright-mcp 的核心思路正是将 playwright的能力“MCP化”——其核心在于开放 API 接口，让 AI 担任决策者，决定调用哪个 API 及相应参数。

我们看一个实际任务：利用 playwright-mcp通过 RooCode 客户端，让 AI 在 12306 网站查询车次信息。流程如下：

1、**任务规划**：AI 接收任务指令并进行初步拆解。

2、**API 决策与调用**：AI 根据任务上下文和当前状态，从客户端提供的playwright API 列表（如 browser_navigate）中选择合适的 API，并构造参数。

![任务规划示意图](/images/articles/ai-browser-automation/ai-browser-automation-1.png)

> 注：首次对话时，客户端已将 MCP 信息（包括 Playwright 的 API）提供给 AI。通过抓包工具能看到完整提示词。

![API 调用抓包示意](/images/articles/ai-browser-automation/ai-browser-automation-2.png)

3、**执行与反馈**：本地客户端执行 AI 指定的 API 调用，并将结果（通常处理为 简化的 YML 格式的页面元素信息）反馈给 AI。

![页面元素信息示例](/images/articles/ai-browser-automation/ai-browser-automation-3.png)

![执行结果反馈示例](/images/articles/ai-browser-automation/ai-browser-automation-4.png)

4、**迭代决策**：AI 根据反馈结果决定后续操作步骤，重复上述流程。

所以，整个流程就是 MCP 工具的运行原理，和其他工具无异。

可以看到 playwright-mcp 会把页面数据解析成 YML 格式供给AI。优点是数据量小，应付常规的任务没什么问题，但是复杂页面判断失误的概率比较大。不过，playwright-mcp 其实也提供了视觉方案，需要使用多模态模型，效果应该会更好。下面的 Midscene 就以视觉方案为主。

## 二、探究一下 Midscene 的提示词

Midscene 的定位是**AI驱动的自动化测试框架**。下图代码可见它并不是一个独立框架，而是需要构建在 Puppeteer 或 Playwright 之上。所以仍需要编写脚本代码，但具体行为则可以通过**自然语言描述**，交给 AI 处理。

```javascript
const { Midscene } = require('@midscene/web');
const puppeteer = require('puppeteer');
(async () => {
    // 1. 启动浏览器
    const browser = await puppeteer.launch({ 
        headless: false });
    const page = await browser.newPage();
    // 2. 初始化 Midscene 实例
    const midscene = new Midscene(page, {
        apiKey: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'});
    // 3. 打开 Bing 首页
    await midscene.aiAction('打开 Bing 首页', { url: 'https://cn.bing.com/'});
    // 4. 执行搜索
    await midscene.aiAction('在搜索框中输入"AI 技术"并按回车');
})();
```

话不多说，直接从源码入手，看看它与 AI 的交互原理：

1、先借助 agent 分析下源码的目录结构：

![源码目录结构](/images/articles/ai-browser-automation/ai-browser-automation-5.png)

2、根据代码结构，定位到框架与 AI 交互的核心模块 `service-caller`。其中 `call` 函数负责 AI 请求。可以添加调试代码，记录入参和出参。

![核心模块定位](/images/articles/ai-browser-automation/ai-browser-automation-6.png)

3、以 bing 搜索为例，我们来分析下请求数据。

请求体包含：系统提示词、一张图片（Base64编码）、简化过的页面 HTML 数据。

![请求体示例](/images/articles/ai-browser-automation/ai-browser-automation-7.png)

将图片还原，可以看到是一张带标记的截图。元素标记编号与 HTML 中的 `markid` 属性一致。

![带标记的截图](/images/articles/ai-browser-automation/ai-browser-automation-8.png)

> 注：标记的原理也并不复杂，是通过 js 在前端实现。在 shared/src/extractor 中可以找到。

再看看 AI 的响应。核心字段为 `actions`，指示框架需执行的操作及其参数。

![AI 响应示例](/images/articles/ai-browser-automation/ai-browser-automation-9.png)

**原理分析：**

Midscene 主要利用了多模态模型的视觉能力，通过截图打标+关键HTML数据，能让AI更准确的识别页面，找到需要操作的目标元素。同时也会告诉客户端需要执行什么指令，以及对应的参数。

Midscene 的返回值格式更为复杂，所以单独给了一个 `responseFormat`数据，避免AI返回非期望的格式数据。

本质上，`Midscene` 的实现原理与 MCP 工具相似，相当于构建了一个 MCP 客户端，内置操作 API，由 AI 决策调用方式。

## 三、对比小结

可见，无论是 MCP 工具（如 playwright-mcp）还是面向特定领域的工具（如 Midscene），其核心机制都遵循 “客户端执行 + AI 决策” 的模式。就这两个工具而言：

- playwright-mcp：架构更简单高效，便于 AI 快速进行浏览器操作。但其适应性有限，难以应对复杂场景，也无法确保多次执行路径一致性，在自动化测试领域应用存疑。
- Midscene：配合视觉模型在识别能力上更具优势；更细致的步骤拆分有助于提高回归路径一致性。但代价是更高的使用复杂度和成本。

因此，虽然都能实现 AI 操作浏览器的效果，但两者的设计目标、实现路径和适用场景存在显著差异。

## 四、AI 工具会替代传统的自动化测试吗？

目前如果想用 AI 工具进行自动化测试，还存在很多瓶颈，最主要是 AI 执行的 AI 使用成本、执行速度、排查成本 还远远无法满足测试诉求。但是就目前 AI 领域发展速度来看，也只是时间问题。

传统自动化的门槛和成本太高了，也非常需要 AI 带来一些革新。

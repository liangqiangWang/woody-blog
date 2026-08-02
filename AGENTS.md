# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

「墨白」—— 部署在 **GitHub Pages 子路径**（`/woody-blog/`）的 Astro 7 静态博客。纯原生技术栈：无 React/MDX/sharp/astro-icon，图标手写在 `src/components/Icons.astro`（内联 lucide SVG），交互用原生 `<script>`。视觉基准是 `design/prototype.html`（暖纸张风、衬线中文）。

核心模型：**一个 Markdown 文件 = 一篇文章**；一个工具 = 一个目录（交互页）+ 一个 md；一个教程 = 一个目录内含多个章节 md。

## 常用命令

```sh
astro dev --background   # 启动后台开发服务器（务必用此方式）
astro dev stop|status|logs   # 管理后台服务器
npm run build            # 生产构建到 ./dist/
npm run preview          # 本地预览 —— 验证子路径(base)正确性的唯一可信方式
npm run check            # astro check 类型检查
npm run new:article|new:tool|new:tutorial   # 内容脚手架（scripts/ 目录目前为空，尚未实现）
```

注意：`astro dev` 走 dev server，`astro preview` 才完整模拟 GitHub Pages 子路径。dev 正常 ≠ 子路径正常。

## 架构

```
src/
├─ content.config.ts        # 三个集合 articles / tutorials / tools 的 schema + loader
├─ consts.ts                # SITE 常量（base/url 取自 astro.config.mjs，改仓库名/域名无需动这里）
├─ lib/
│  ├─ rehype-base.mjs       # 关键：给 md 内 /img /a 绝对路径加 base 前缀
│  ├─ tutorials.ts          # 教程分组/排序/落地页/上下一篇
│  └─ format.ts             # 日期格式化、阅读时长估算、卡片渐变
├─ components/              # Nav / Hero / ArticleCard / ToolCard / TutorialCard / Icons / Toc / Lightbox 等
├─ layouts/                 # BaseLayout / ArticleLayout / TutorialLayout
├─ pages/
│  ├─ index.astro  404.astro  rss.xml.js
│  ├─ articles/index.astro  articles/[slug].astro
│  ├─ tutorials/index.astro  tutorials/[...slug].astro   # rest 参数路由
│  └─ tools/index.astro  tools/[slug].astro  tools/<app>/index.astro
├─ scripts/                 # site.ts（导航/回顶/reveal） lightbox.ts（<dialog> 图片放大）
└─ styles/                  # global.css  article.css  tutorial.css
```

## 内容模型（`content.config.ts`）

三个集合都用 `glob()` loader，且**必须保留 `generateId: (entry) => entry.replace(/\.md$/, '')`**——glob loader 默认 slugify 会吃掉中文文件名。配套约定：**文件名用 ASCII slug，frontmatter 的 `title` 用中文**。路由一律用 `entry.id`（Astro 5+ 无 `entry.slug`）。

- **articles**：`title/date/desc/category/tags/layout(standard|mosaic|immersive)/cover/readTime/draft`。`layout` 控制三种排版模式。
- **tutorials**：`title/desc/level(beginner|intermediate|advanced)/draft`。章节文件命名 `01-xxx.md`、`02-xxx.md`，按文件名（即编辑器可见序）排序。
- **tools**：`name/desc/icon(Icons.astro 中图标名)/tags/accent(hex)/kind(app|doc)/draft`。

## GitHub Pages 子路径部署（最容易踩坑）

- `base: '/woody-blog'`、`site` 含子路径，`output: 'static'`、`trailingSlash: 'always'`。仓库名必须 ASCII 且与 base 一致；**换仓库名/自定义域名/根站点只改 `astro.config.mjs` 里的 `USER`/`REPO`**。
- **md 里的 `/images/...` 和 `/文章链接` 不会自动加 base** → 由 `rehype-base.mjs` 在构建期补前缀（以 `/` 开头且非 `//`、`/#` 才处理）。**不要用 `<base>` 标签**（破坏锚点与相对链接）。
- `.astro` 组件里引用 public 资源统一 `import.meta.env.BASE_URL + 'images/...'`。
- **图片一律放 `public/images/`**——放 `src/` 里不会被发布。
- `base` 不影响 `dist/` 目录结构：`dist/` 顶层不应嵌套仓库目录。

## 文章三态排版（`ArticleLayout.astro`）

按 frontmatter `layout` 给根节点加 class 切换：

- `standard`：衬线正文，图居中带题注。
- `mosaic`：正文用 CSS 多列图墙（`columns: 2 320px; p/figure { break-inside: avoid }`），`pre/table { display:none }` 兜底。多列下图片被截断，lightbox 是刚需。
- `immersive`：`max-width` 放宽到 ~1000px，大图全宽、文字居中。

## 教程结构

每个教程 = `src/content/tutorials/<t>/index.md`（落地页）+ 若干 `NN-xxx.md` 章节。路由是 **`tutorials/[...slug].astro`**：rest 参数把 `id` 拆成 `[教程名, 章节]`，落地页 param 为教程名本身，章节页为 `教程名/章节`。文内 TOC 直接用 `render(entry)` 返回的 `headings`（零依赖），侧栏/上下一篇由 `lib/tutorials.ts` 计算。`tutorials/index.astro` 按 `id.split('/')[0]` 分组出列表页。

> **当前状态：首页「教程」区块已隐藏**（2026-08 起，因暂无合适内容）。改动点在 `src/pages/index.astro`（`id="tutorials"` 的 `<section>` 被注释）与 `src/components/Hero.astro`（「篇教程」统计被注释），**数据计算与 `TutorialCard` import 均保留**。注意本目录**不是 git 仓库**，恢复只能靠代码注释 + 本说明：放开时取消上述两处注释即可。教程内容（`src/content/tutorials/`）与 `/tutorials/` 列表页不受影响，可先行累积。

## 工具模块

- **索引只由 tools collection 驱动**（页面不参与聚合）。
- `kind: 'app'` = 交互页：`src/pages/tools/<slug>/index.astro`，自包含，用 `getEntry` 取元信息做页头 + 内联 `<script>` 实现。
- `kind: 'doc'` = 纯介绍：只有 md，由动态路由 `tools/[slug].astro` 生成，`getStaticPaths` **只枚举 doc 型**。静态目录天然优先于 `[slug]` 动态路由，二者零冲突。

## 开发约束

- `tsconfig.json` extends `astro/tsconfigs/strict`；`.nvmrc` 固定 Node 22。
- 内容 schema 用 zod（Astro 7 中 `astro:content` 的 `z` 已弃用，从 `zod` 直接导入）。
- 类型检查走 `npm run check`，改动后应确保通过。
- `.github/workflows/` 与 `scripts/` 目前为空：部署 workflow（upload-pages-artifact → deploy-pages）与 `new:*` 脚手架脚本尚未实现，属后续工作。

## 文档

完整文档：https://docs.astro.build

相关指南：[路由](https://docs.astro.build/en/guides/routing/) · [Astro 组件](https://docs.astro.build/en/basics/astro-components/) · [内容集合](https://docs.astro.build/en/guides/content-collections/) · [样式](https://docs.astro.build/en/guides/styling/)

---
title: 一键部署到 GitHub Pages
---

## 子路径部署是最大的坑

GitHub Pages 的项目站点跑在 `https://<user>.github.io/<repo>/`，base 必须等于仓库名：

```js
const BASE = '/<repo>';
export default defineConfig({
  site: `https://<user>.github.io${BASE}`,
  base: BASE,
});
```

记住两条：

1. `site` 必须含子路径，否则 sitemap / RSS / canonical 全错；
2. `astro preview` 才是验证子路径正确性的唯一可信本地方式。

## GitHub Actions

工作流三步：`build` → `upload-pages-artifact` → `deploy-pages`。Pages 来源选 **GitHub Actions**，推送 main 分支即自动发布。

## 验证清单

- 首页、文章、工具、教程的图片/链接都带 `/repo/` 前缀；
- 浏览器 Console 无 404；
- `rss.xml` 与 `sitemap-index.xml` 存在。

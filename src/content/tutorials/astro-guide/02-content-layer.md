---
title: 内容层实战：三个集合与路由
---

## 三个集合

一个博客通常有三类内容：文章、教程、工具。分别建三个 collection：

```ts
export const collections = { articles, tutorials, tools };
```

## 生成 ID：别让中文被 slugify

`glob()` 默认会把文件名 slugify，中文文件名会丢失。必须显式关掉：

```ts
generateId: ({ entry }) => entry.replace(/\.md$/, ''),
```

配套约定：**文件名用 ASCII，`title` 用中文**。

## 动态路由

```astro
// articles/[slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('articles');
  return posts.map((post) => ({ params: { slug: post.id } }));
}
```

子路径部署时，md 里的绝对链接（`/images/...`）不会自动加 base 前缀，需要一个 rehype 插件在构建期统一处理。

---
title: 为什么是 Astro
---

## 内容模型：文件即内容

传统博客框架里，「一篇文章」通常对应数据库里的一行记录。Astro 把这一行记录换成了**一个 Markdown 文件**。

```txt
src/content/articles/hello-world.md   ← 一篇文章
```

这意味着：

- 写作 = 建文件，删文章 = 删文件；
- 不用登录后台，任何编辑器都能写；
- git 天然帮你管理版本历史。

## Content Layer：类型安全的集合

Astro 5+ 的 Content Layer 用 `glob()` 加载文件，并用 Zod 校验 frontmatter：

```ts
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
  }),
});
```

写错的字段会在构建期直接报错，而不是到了线上才 404。

## 为什么不用 SSG 全家桶？

Astro 只产出纯 HTML，默认零 JavaScript。对于「以文字为主」的博客，这是性能上最省心的选择——你的读者只需要下载几 KB。

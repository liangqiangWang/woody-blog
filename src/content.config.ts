import { defineCollection } from 'astro:content';
// Astro 7 中 astro:content 的 `z` 已弃用，直接从 zod 导入（zod v4）
import { z } from 'zod';
import { glob } from 'astro/loaders';

/**
 * 三个内容集合：articles / tutorials / tools。
 * 关键：generateId 保留原始文件名（不做 slugify），
 * 因此文件名必须用 ASCII slug，`title` 用中文。
 */

const articles = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/articles',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    desc: z.string(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    /** 排版模式：标准 / 瀑布流图墙 / 大图沉浸 */
    layout: z.enum(['standard', 'mosaic', 'immersive']).default('standard'),
    /** 封面图，md 内绝对路径写法：/images/articles/<slug>/cover.svg */
    cover: z.string().optional(),
    readTime: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
  }),
});

const tutorials = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/tutorials',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    desc: z.string().default(''),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
    draft: z.boolean().default(false),
  }),
});

const tools = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/tools',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    name: z.string(),
    desc: z.string(),
    /** Icons.astro 中定义的图标名 */
    icon: z.string().default('sparkles'),
    tags: z.array(z.string()).default([]),
    /** 主题色，如 #2d6a4f */
    accent: z.string().default('#bf4a37'),
    /** app = 交互页（src/pages/tools/<id>/index.astro）；doc = 纯介绍 md */
    kind: z.enum(['app', 'doc']).default('doc'),
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, tutorials, tools };

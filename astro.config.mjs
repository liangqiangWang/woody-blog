// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeBase from './src/lib/rehype-base.mjs';

/**
 * ===== GitHub Pages 子路径配置 =====
 * 仓库名(ASCII) = base；换仓库名 / 换自定义域名 / 换根站点时只需改这里。
 * USER 待你建仓时改成真实 GitHub 用户名。
 */
const USER = 'liangqiangWang';
const REPO = 'woody-blog';
const BASE = `/${REPO}`;
const SITE = `https://${USER}.github.io${BASE}`;

// https://astro.build/config
export default defineConfig({
  site: SITE, // 必须含子路径，否则 sitemap / canonical / RSS 全错
  base: BASE,
  output: 'static',
  trailingSlash: 'always',
  // Astro 7 默认用 satteri 处理器；自写 rehype 插件走经典 unified 管线。
  // unified 会以 (processor, ...options) 调用工厂，故用 [工厂, 参数] 元组形式。
  markdown: {
    processor: unified({ rehypePlugins: [[rehypeBase, BASE]] }),
  },
  integrations: [sitemap()],
});

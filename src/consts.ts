/** 站点全局常量。base 跟随 astro.config.mjs 的 BASE_URL，换仓库/域名无需改这里。 */

export const SITE = {
  title: 'woody 的博客',
  description: '记录思考，分享创造',
  tagline: '',
  /** 子路径，如 /woody-blog（无尾部斜杠） */
  base: import.meta.env.BASE_URL.replace(/\/$/, ''),
  /** 完整站点地址，如 https://hudi.github.io/woody-blog */
  url: import.meta.env.SITE.replace(/\/$/, ''),
  author: 'hudi',
  locale: 'zh-CN',
};

export const NAV_LINKS = [
  { href: '/articles/', label: '文章', icon: 'feather' },
  { href: '/tools/', label: '工具', icon: 'layout-grid' },
  // 教程导航暂时隐藏（内容尚未就绪）；恢复时取消注释即可
  // { href: '/tutorials/', label: '教程', icon: 'book-open' },
] as const;

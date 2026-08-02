import { visit } from 'unist-util-visit';

/**
 * 给 Markdown 渲染后的 HTML 中，以 `/` 开头的绝对路径加 base 前缀。
 *
 * 背景：站点部署在子路径（如 /woody-blog/）下，md 里写的
 * `/images/...`、`/文章链接` 不会自动带 base，必须构建期补。
 *
 * 规则：路径以 `/` 开头，且不以 `//`（协议相对 URL）或 `/#`（纯锚点）开头。
 *
 * @param {string} base 例如 '/woody-blog'（首尾斜杠均可，内部会规范化）
 */
export default function rehypeBase(base = '/') {
  const prefix = base.replace(/\/$/, '');
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img' && node.tagName !== 'a') return;
      const props = node.properties || {};
      const url = node.tagName === 'img' ? props.src : props.href;
      if (typeof url !== 'string' || !url.startsWith('/')) return;
      if (url.startsWith('//') || url.startsWith('/#')) return;
      const fixed = prefix + url;
      if (node.tagName === 'img') props.src = fixed;
      else props.href = fixed;
    });
  };
}

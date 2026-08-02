/** 文本哈希（用于卡片占位渐变等稳定选择） */
export function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * 莫兰迪暖色色块池 —— 低饱和、带灰度，呼应「胡迪」的暖纸张 + 砖红主色。
 * 同色系极轻渐变：视觉上是纯色块，但比 flat 纯色更有纸张质感。
 * 文章封面不再展示真实图片，统一用色块 + 水印。
 */
const GRADIENTS = [
  'linear-gradient(135deg, #d8a896 0%, #c08977 100%)', // 赭红
  'linear-gradient(135deg, #d8c4a3 0%, #c2a577 100%)', // 暖驼
  'linear-gradient(135deg, #a8c0a6 0%, #88a284 100%)', // 鼠尾草绿
  'linear-gradient(135deg, #a6b8cc 0%, #7e95b0 100%)', // 雾蓝
  'linear-gradient(135deg, #bda8c4 0%, #9c84a8 100%)', // 藕紫
  'linear-gradient(135deg, #ddc69a 0%, #c2a266 100%)', // 暮金
];

/** 按关键词取一个稳定的色块 */
export function gradientFor(key: string): string {
  return GRADIENTS[hashCode(key) % GRADIENTS.length];
}

/** 2026.07.18 风格日期 */
export function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** 中文按字数粗估阅读时长（分钟） */
export function readTimeOf(text: string): number {
  const cjk = text.match(/[一-鿿]/g)?.length ?? 0;
  const other = text.length - cjk;
  return Math.max(1, Math.round(cjk / 350 + other / 500));
}

/** #hex → rgba() */
export function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

/** 根据文章类别选择合适的图标 */
export function iconFor(category: string, title: string): string {
  const categoryIcons: Record<string, string[]> = {
    '技术': ['code', 'terminal', 'wrench', 'file-code'],
    '开发': ['code', 'terminal', 'git-branch', 'file-code'],
    '设计': ['palette', 'paintbrush', 'pen-line', 'layers'],
    '思考': ['book-open', 'sparkles', 'at-sign', 'list'],
    '生活': ['sparkles', 'at-sign', 'calendar'],
    '笔记': ['file-text', 'book-open', 'layers'],
  };

  // 根据标题哈希选择该类别下的某个图标
  const icons = categoryIcons[category] || ['file-text', 'hash', 'link'];
  return icons[hashCode(title) % icons.length];
}

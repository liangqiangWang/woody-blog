/**
 * 贴图模式 lightbox（零依赖）：
 * 点击 mosaic / immersive 正文内的图片，用原生 <dialog> 弹大图。
 * 支持 Esc 关闭、点击遮罩关闭、右上角按钮关闭。
 */

const dialog = document.getElementById('lightbox') as HTMLDialogElement | null;
const img = document.getElementById('lightboxImg') as HTMLImageElement | null;
const closeBtn = document.getElementById('lightboxClose') as HTMLButtonElement | null;

// 只在贴图模式正文中启用
const HOST_SELECTOR = '.article-mosaic, .article-immersive';

if (dialog && img) {
  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    if (!(target instanceof Element)) return;
    const clicked = target.closest('img');
    if (!clicked) return;
    // 排除 lightbox 自身的图片，避免循环触发
    if (dialog.contains(clicked)) return;
    // 只在贴图模式正文内开灯
    const host = clicked.closest(HOST_SELECTOR);
    if (!host) return;
    img.src = clicked.src;
    img.alt = clicked.alt || '';
    dialog.showModal();
  });

  const close = () => dialog.close();

  closeBtn?.addEventListener('click', close);
  dialog.addEventListener('click', (e) => {
    // 点击遮罩（dialog 自身）关闭
    if (e.target === dialog) close();
  });
  dialog.addEventListener('close', () => {
    img.src = '';
    img.alt = '';
  });
  // Esc 由原生 <dialog> 处理
}

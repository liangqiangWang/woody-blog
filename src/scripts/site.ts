/**
 * 站点级交互脚本（原型的 4 个脚本移植 + 移动端菜单）：
 * 导航滚动效果 / 回顶按钮 / 滚动渐显 / 锚点平滑滚动 / 移动端抽屉菜单。
 */

const nav = document.querySelector('.nav');
const backToTop = document.getElementById('backToTop');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

const onScroll = () => {
  const y = window.scrollY;
  nav?.classList.toggle('scrolled', y > 50);
  backToTop?.classList.toggle('visible', y > 600);
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 滚动渐显
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// 锚点平滑滚动（TOC 等页内链接）
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// 移动端抽屉菜单
mobileMenuBtn?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
  mobileMenuBtn.classList.toggle('active');
});
mobileMenu?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => mobileMenu?.classList.remove('open')),
);

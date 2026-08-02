import type { CollectionEntry } from 'astro:content';

export type TutorialEntry = CollectionEntry<'tutorials'>;

/** 条目 id 形如 `<t>/index`（落地页）或 `<t>/01-xxx`（章节） */
export function tutorialNameOf(id: string): string {
  return id.split('/')[0];
}

/** 是否教程落地页 */
export function isLanding(id: string): boolean {
  return id.endsWith('/index');
}

/** 是否章节页 */
export function isChapter(id: string): boolean {
  return !isLanding(id);
}

/** 章节名（如 `01-why-astro`） */
export function chapterSlugOf(id: string): string | undefined {
  const parts = id.split('/');
  return parts.length > 1 ? parts[1] : undefined;
}

/** 教程落地页 URL（如 /tutorials/astro-guide/） */
export function landingUrl(name: string): string {
  return `/tutorials/${name}/`;
}

/** 章节 URL（如 /tutorials/astro-guide/01-why-astro/） */
export function chapterUrl(name: string, chapter: string): string {
  return `/tutorials/${name}/${chapter}/`;
}

/** 按教程名分组，组内落地页在前、章节按文件名（字典序）排序 */
export function groupByTutorial(entries: TutorialEntry[]): Map<string, TutorialEntry[]> {
  const map = new Map<string, TutorialEntry[]>();
  for (const e of entries) {
    const name = tutorialNameOf(e.id);
    const list = map.get(name) ?? [];
    list.push(e);
    map.set(name, list);
  }
  for (const [, list] of map) {
    list.sort((a, b) => {
      const aLand = isLanding(a.id) ? 0 : 1;
      const bLand = isLanding(b.id) ? 0 : 1;
      return aLand - bLand || a.id.localeCompare(b.id);
    });
  }
  return map;
}

/** 教程落地页条目 */
export function landingOf(entries: TutorialEntry[], name: string): TutorialEntry | undefined {
  return entries.find((e) => e.id === `${name}/index`);
}

/** 教程章节列表（不含落地页，按文件名排序） */
export function chaptersOf(entries: TutorialEntry[], name: string): TutorialEntry[] {
  return entries
    .filter((e) => e.id.startsWith(name + '/') && isChapter(e.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** 当前章节的上/下一篇（跨章节循环） */
export function adjacentOf(
  entries: TutorialEntry[],
  currentId: string,
): { prev?: TutorialEntry; next?: TutorialEntry } {
  const name = tutorialNameOf(currentId);
  const chapters = chaptersOf(entries, name);
  const idx = chapters.findIndex((c) => c.id === currentId);
  if (idx < 0) return {};
  return {
    prev: chapters[idx - 1],
    next: chapters[idx + 1],
  };
}

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';

export async function GET() {
  const articles = (await getCollection('articles'))
    .filter((a) => !a.data.draft)
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: `${SITE.title} · 文章`,
    description: SITE.description,
    site: SITE.url,
    items: articles.map((a) => ({
      title: a.data.title,
      pubDate: a.data.date,
      description: a.data.desc,
      link: `${SITE.url}/articles/${a.id}/`,
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}

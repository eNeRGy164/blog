import { SITE_TITLE, SITE_DESCRIPTION } from '@/config.ts'
import { getCollection } from 'astro:content';
import { buildFeed } from '@/utils/rss.js';

export async function GET (context) {
  const posts = await getCollection('posts')

  return buildFeed(SITE_TITLE, SITE_DESCRIPTION, context.site, context.request.url, posts);
}

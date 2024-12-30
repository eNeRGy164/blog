import { SITE_TITLE } from '@/config.ts'
import { getCollection } from 'astro:content';
import { urlifyToken, getTagsWithPosts } from '@/js/util.js'
import { buildFeed } from '@/utils/rss.js';

export async function getStaticPaths() {
  const tagsMap = getTagsWithPosts(await getCollection('posts'));

  return Array.from(tagsMap.entries()).map(([tag, tagPosts]) => ({
    params: {
      slug: urlifyToken(tag)
    },
    props: {
      tag: tag,
      posts: tagPosts,
    },
  }));
}

export async function GET (context) {
  const description = `Posts tagged ‘${context.props.tag}’`;

  return await buildFeed(`${context.props.tag} | ${SITE_TITLE}`, description, context.site, context.request.url, context.props.posts);
}

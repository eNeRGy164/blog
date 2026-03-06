import { SITE_TITLE } from '@/config.ts'
import { getCollection } from 'astro:content';
import { urlifyToken, getSeriesWithPosts } from '@/js/util.js';
import { buildFeed } from '@/utils/rss.js';

export async function getStaticPaths() {
  const seriesMap = getSeriesWithPosts(await getCollection('posts'));

  return Array.from(seriesMap.entries()).map(([series, seriesPosts]) => ({
    params: {
      slug: urlifyToken(series)
    },
    props: {
      series: series,
      posts: seriesPosts,
    },
  }));
}

export function GET(context) {
  const description = `Posts in the '${context.props.series}' series`;

  return buildFeed(`${context.props.series} | ${SITE_TITLE}`, description, context.site, context.request.url, context.props.posts);
}

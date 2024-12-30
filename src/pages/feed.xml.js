import rss from '@astrojs/rss'
import { SITE_TITLE, SITE_DESCRIPTION } from '../config.ts'
import { sortedPosts } from '@/js/util.js'
import { getCollection } from 'astro:content';

export async function GET (context) {
  const posts = sortedPosts(await getCollection('posts'))

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData:
      '<language>en-us</language>' +
      `<atom:link href="${context.request.url}" rel="self" type="application/rss+xml" />`,
    items: posts.map((post) => ({
      link: post.data.permalink,
      title: post.data.title,
      pubDate: post.data.date,
      description: postSummary(post),
      categories: [...post.data.tags, ...post.data.categories],
      customData:
        '<language>en-us</language>' +
        `<dc:creator>${post.data.author}</dc:creator>`
    })),
    trailingSlash: false,
    xmlns: {
      content: 'http://purl.org/rss/1.0/modules/content/',
      wfw: 'http://wellformedweb.org/CommentAPI/',
      dc: 'http://purl.org/dc/elements/1.1/',
      atom: 'http://www.w3.org/2005/Atom',
      sy: 'http://purl.org/rss/1.0/modules/syndication/',
      slash: 'http://purl.org/rss/1.0/modules/slash/',
    }
  });
}

function postSummary (post) {
  return post.rendered.html
    // you can delete the below if you want to include
    // the entire blog post in your RSS feed. Note that
    // many RSS readers cache results, so readers who read
    // via RSS only won't see post edits.
    .slice(0, 1000)
    .split(' ')
    .slice(0, 100) // about 100 words
    .join(' ')
    // remove unclosed tags so that the 'Read more' link renders correctly
    .replace(/<\/[a-zA-Z]+$/, '')
    + ` &hellip; <a href="${post.data.permalink.replace(/(\/$)/, "")}">Read more</a>`
}

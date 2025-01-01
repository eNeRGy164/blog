import rss from '@astrojs/rss'
import { sortedPosts } from '@/js/util.js'

export function buildFeed(title, description, site, requestUrl, posts) {
  const orderedPosts = sortedPosts(posts)

  return rss({
    title: title,
    description: description,
    site: site,
    customData:
      '<language>en-us</language>' +
      `<atom:link href="${requestUrl}" rel="self" type="application/rss+xml" />`,
    items: orderedPosts.map((post) => ({
      link: post.data.permalink,
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt.trim().replace(/\n/g, '<br/>'),
      categories: [...post.data.tags, ...post.data.categories],
      customData:
        '<language>en-us</language>' +
        `<dc:creator>${post.data.author}</dc:creator>`
    })),
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

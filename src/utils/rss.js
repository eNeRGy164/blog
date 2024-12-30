import rss from '@astrojs/rss'
import { sortedPosts } from '@/js/util.js'

export async function buildFeed(title, description, site, requestUrl, posts) {
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
    .slice(0, 1000)
    .split(' ')
    .slice(0, 100) // about 100 words
    .join(' ')
    // remove unclosed tags so that the 'Read more' link renders correctly
    .replace(/<\/[a-zA-Z]+$/, '')
    + ` &hellip; <a href="${post.data.permalink.replace(/(\/$)/, "")}">Read more</a>`
}

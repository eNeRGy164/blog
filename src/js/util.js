'use strict'

// alternative: https://github.com/mdevils/html-entities
import { decodeHTML } from 'entities'

// if you need a fancier one, you could use https://github.com/sindresorhus/slugify
export function urlifyToken (s) {
  return s.toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll(':', '')
    .replaceAll('#', 'sharp')
}

// https://github.com/DylanPiercey/strip
const htmlReg = /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi
const commentReg = /<!--.+-->/gi
export function stripHTML (html = '') {
  return decodeHTML(html.replace(htmlReg, '').replace(commentReg, '')).trim()
}

export function sortedPosts (paths) {
  return paths
    .filter(p => !p.frontmatter.draft)
    .sort(
    (a, b) => new Date(b.frontmatter.date).valueOf() - new Date(a.frontmatter.date).valueOf()
  )
}

export function getTagsWithPosts(paths) {
  const posts = sortedPosts(paths);
  const tagsMap = new Map(); // Use Map to preserve the order and avoid duplicates

  posts.forEach(post => {
    post.frontmatter.tags?.forEach(tag => {
      if (!tagsMap.has(tag)) {
        tagsMap.set(tag, []);
      }
      tagsMap.get(tag).push(post);
    });
  });

  return tagsMap;
}
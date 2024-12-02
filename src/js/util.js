'use strict'

export function urlifyToken (s) {
  return s.toLowerCase()
    .replaceAll(' ', '-')
    .replaceAll('/', '-')
    .replaceAll(':', '')
    .replaceAll('#', 'sharp')
}

export function sortedPosts(paths) {
  return paths
    .filter(p => !p.frontmatter.draft)
    .sort(
      (a, b) => new Date(b.frontmatter.date).valueOf() - new Date(a.frontmatter.date).valueOf()
    );
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
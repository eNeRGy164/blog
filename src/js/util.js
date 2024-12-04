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
    .filter(p => !p.data.draft)
    .sort(
      (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
    );
}

export function getTagsWithPosts(paths) {
  const posts = sortedPosts(paths);
  const tagsMap = new Map(); // Use Map to preserve the order and avoid duplicates

  posts.forEach(post => {
    post.data.tags?.forEach(tag => {
      if (!tagsMap.has(tag)) {
        tagsMap.set(tag, []);
      }
      tagsMap.get(tag).push(post);
    });
  });

  return tagsMap;
}
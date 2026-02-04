"use strict";

export function urlifyToken(s) {
  return s
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll("/", "-")
    .replaceAll(":", "")
    .replaceAll("#", "sharp");
}

export function sortedPosts(paths) {
  return paths
    .filter((p) => !p.data.draft)
    .sort(
      (a, b) =>
        new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf(),
    );
}

export function getTagsWithPosts(paths) {
  const posts = sortedPosts(paths);
  const tagsMap = new Map(); // Use Map to preserve the order and avoid duplicates

  posts.forEach((post) => {
    post.data.tags?.forEach((tag) => {
      if (!tagsMap.has(tag)) {
        tagsMap.set(tag, []);
      }
      tagsMap.get(tag).push(post);
    });
  });

  return tagsMap;
}

export function getPreviousAndNextPosts(currentPost, allPosts) {
  const posts = sortedPosts(allPosts);
  const currentIndex = posts.findIndex(
    (p) => p.data.permalink === currentPost.data.permalink,
  );

  // sortedPosts returns posts in descending order (newest first)
  // previous = chronologically earlier = higher index (older)
  // next = chronologically later = lower index (newer)
  return {
    previous: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    next: currentIndex > 0 ? posts[currentIndex - 1] : null,
  };
}

export function getSeriesWithOldestPosts(paths) {
  const posts = sortedPosts(paths);
  const seriesMap = new Map();

  posts.forEach((post) => {
    const series = post.data.series;
    if (series) {
      if (!seriesMap.has(series)) {
        seriesMap.set(series, post);
      } else {
        // Keep the oldest post (lower date value means older)
        const existing = seriesMap.get(series);
        if (
          new Date(post.data.date).valueOf() <
          new Date(existing.data.date).valueOf()
        ) {
          seriesMap.set(series, post);
        }
      }
    }
  });

  // Sort series by the date of their oldest post (oldest series first)
  return Array.from(seriesMap.entries()).sort(
    (a, b) =>
      new Date(a[1].data.date).valueOf() - new Date(b[1].data.date).valueOf(),
  );
}

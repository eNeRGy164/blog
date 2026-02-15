"use strict";

const displayNames = {
  csharp: "C#",
  "machine-learning": "Machine Learning",
  "microsoft-365": "Microsoft 365",
  "dynamics-crm": "Dynamics CRM",
  "project-server": "Project Server",
  "visual-studio": "Visual Studio",
  "windows-phone": "Windows Phone",
  "hyper-v": "Hyper-V",
};

/**
 * Returns a human-readable display name for a category slug.
 * If no custom mapping exists, returns the original value with
 * hyphens replaced by spaces and title-cased.
 */
export function getCategoryDisplayName(slug) {
  if (displayNames[slug]) return displayNames[slug];
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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

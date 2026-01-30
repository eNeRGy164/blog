import { getCollection } from "astro:content";
import Fuse from "fuse.js";

export interface ProcessedPost {
  body: string;
  title: string;
  tags: string[];
  categories: string[];
  permalink: string;
  image: string | null;
}

let fuseInstance: Fuse<ProcessedPost> | null = null;

/**
 * Gets a cached Fuse instance for searching posts.
 * During build time, this ensures we only create one Fuse instance
 * per worker thread that's shared across all pages, rather than
 * creating a new instance for each blog post page.
 * 
 * Note: Astro's build process uses multiple worker threads (configured via
 * build.concurrency), so each thread will have its own cached instance.
 */
export async function getFuseInstance(): Promise<Fuse<ProcessedPost>> {
  if (fuseInstance === null) {
    const posts = await getCollection("posts");

    const processedPosts: ProcessedPost[] = posts.map((post) => ({
      title: post.data.title,
      body: post.rendered?.html ?? "",
      tags: post.data.tags,
      categories: post.data.categories,
      permalink: post.data.permalink,
      image: post.data.image ?? null,
    }));

    fuseInstance = new Fuse(processedPosts, {
      keys: ["tags", "categories", "title", "body"],
      includeScore: false,
      threshold: 0.55,
      ignoreLocation: true,
      findAllMatches: true,
      minMatchCharLength: 2,
    });
  }

  return fuseInstance;
}

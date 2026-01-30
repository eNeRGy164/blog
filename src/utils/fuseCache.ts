import { getCollection } from "astro:content";
import Fuse from "fuse.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface ProcessedPost {
  body: string;
  title: string;
  tags: string[];
  categories: string[];
  permalink: string;
  image: string | null;
}

let fuseInstance: Fuse<ProcessedPost> | null = null;

const CACHE_DIR = join(process.cwd(), ".cache", "fuse-search-index");
const CACHE_FILE = join(CACHE_DIR, "processed-posts.json");

/**
 * Load cached processed posts from disk if available
 */
function loadCachedPosts(): ProcessedPost[] | null {
  try {
    if (existsSync(CACHE_FILE)) {
      const content = readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn("Failed to load cached posts:", error);
  }
  return null;
}

/**
 * Save processed posts to disk cache
 */
function saveCachedPosts(posts: ProcessedPost[]): void {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify(posts), "utf-8");
  } catch (error) {
    console.warn("Failed to save cached posts:", error);
  }
}

/**
 * Gets a cached Fuse instance for searching posts.
 * During build time, this ensures we only create one Fuse instance
 * per worker thread that's shared across all pages, rather than
 * creating a new instance for each blog post page.
 * 
 * The processed posts (including rendered HTML) are cached to disk
 * in .cache/fuse-search-index/processed-posts.json to avoid
 * re-rendering markdown multiple times within a single build.
 * This cache is automatically cleaned before each build starts.
 * 
 * Note: Astro's build process uses multiple worker threads (configured via
 * build.concurrency), so each thread will have its own cached instance.
 */
export async function getFuseInstance(): Promise<Fuse<ProcessedPost>> {
  if (fuseInstance === null) {
    let processedPosts = loadCachedPosts();

    if (processedPosts === null) {
      // Cache miss - need to render all posts
      console.log("[Fuse] Generating search index from posts...");
      const posts = await getCollection("posts");

      processedPosts = posts.map((post) => ({
        title: post.data.title,
        body: post.rendered?.html ?? "",
        tags: post.data.tags,
        categories: post.data.categories,
        permalink: post.data.permalink,
        image: post.data.image ?? null,
      }));

      // Save to cache for next build
      saveCachedPosts(processedPosts);
      console.log(`[Fuse] Cached ${processedPosts.length} processed posts to disk`);
    } else {
      console.log(`[Fuse] Loaded ${processedPosts.length} processed posts from cache`);
    }

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

import { getCollection } from "astro:content";
import Fuse from "fuse.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

/**
 * Processed post data structure used for Fuse.js search.
 * Includes the HTML body content for full-text search to find
 * related posts based on content similarity, not just metadata.
 */
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
const POSTS_CACHE_FILE = join(CACHE_DIR, "processed-posts.json");
const INDEX_CACHE_FILE = join(CACHE_DIR, "fuse-index.json");

// Fuse.js search configuration - centralized to ensure consistency
const FUSE_OPTIONS: Fuse.IFuseOptions<ProcessedPost> = {
  keys: ["tags", "categories", "title", "body"],
  includeScore: false,
  threshold: 0.55,
  ignoreLocation: true,
  findAllMatches: true,
  minMatchCharLength: 2,
};

interface CachedData {
  posts: ProcessedPost[];
  index: Fuse.FuseIndex<ProcessedPost>;
}

/**
 * Validate that cached posts have the expected structure
 */
function isValidProcessedPost(post: unknown): post is ProcessedPost {
  return (
    typeof post === 'object' &&
    post !== null &&
    typeof (post as any).title === 'string' &&
    typeof (post as any).body === 'string' &&
    Array.isArray((post as any).tags) &&
    Array.isArray((post as any).categories) &&
    typeof (post as any).permalink === 'string' &&
    ((post as any).image === null || typeof (post as any).image === 'string')
  );
}

/**
 * Load cached Fuse index and posts from disk if available
 */
function loadCache(): CachedData | null {
  try {
    if (existsSync(POSTS_CACHE_FILE) && existsSync(INDEX_CACHE_FILE)) {
      const postsContent = readFileSync(POSTS_CACHE_FILE, "utf-8");
      const indexContent = readFileSync(INDEX_CACHE_FILE, "utf-8");
      
      const posts = JSON.parse(postsContent);
      const serializedIndex = JSON.parse(indexContent);
      
      // Validate cached data structure
      if (!Array.isArray(posts) || !posts.every(isValidProcessedPost)) {
        console.warn("[Fuse] Cache validation failed - invalid post structure");
        return null;
      }
      
      return {
        posts,
        index: serializedIndex,
      };
    }
  } catch (error) {
    console.warn("[Fuse] Failed to load cache:", error);
  }
  return null;
}

/**
 * Save Fuse index and posts to disk cache
 */
function saveCache(posts: ProcessedPost[], index: Fuse.FuseIndex<ProcessedPost>): void {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    writeFileSync(POSTS_CACHE_FILE, JSON.stringify(posts), "utf-8");
    writeFileSync(INDEX_CACHE_FILE, JSON.stringify(index), "utf-8");
    
    console.log(`[Fuse] Cached ${posts.length} posts and search index to disk`);
  } catch (error) {
    console.warn("[Fuse] Failed to save cache:", error);
  }
}

/**
 * Gets a cached Fuse instance for searching posts.
 * 
 * Uses Fuse.js indexing API for optimal performance:
 * - First worker: Generates index using Fuse.createIndex() and caches it
 * - Subsequent workers: Loads pre-built index using Fuse.parseIndex()
 * - This avoids re-indexing on every worker thread within the same build
 * 
 * The processed posts (including rendered HTML body) and Fuse index are
 * cached to disk to avoid re-rendering markdown on every build.
 * 
 * Note: Astro's build process uses multiple worker threads (configured via
 * build.concurrency). Each thread has its own in-memory Fuse instance,
 * but they all benefit from the shared disk cache.
 */
export async function getFuseInstance(): Promise<Fuse<ProcessedPost>> {
  if (fuseInstance === null) {
    const cachedData = loadCache();
    
    if (cachedData !== null) {
      // Cache hit - use pre-built index (fast!)
      console.log(`[Fuse] Loaded ${cachedData.posts.length} posts and pre-built index from cache`);
      
      const parsedIndex = Fuse.parseIndex(cachedData.index);
      fuseInstance = new Fuse(cachedData.posts, FUSE_OPTIONS, parsedIndex);
    } else {
      // Cache miss - need to render all posts and build index
      console.log("[Fuse] Generating search index from posts...");
      
      const posts = await getCollection("posts");

      const processedPosts: ProcessedPost[] = posts.map((post) => ({
        title: post.data.title,
        body: post.rendered?.html ?? "",  // Included for content-based search
        tags: post.data.tags,
        categories: post.data.categories,
        permalink: post.data.permalink,
        image: post.data.image ?? null,
      }));

      // Create Fuse instance and generate the index
      fuseInstance = new Fuse(processedPosts, FUSE_OPTIONS);
      
      // Extract the index for caching
      const fuseIndex = fuseInstance.getIndex();
      
      // Save both posts and index to cache for other workers and future builds
      saveCache(processedPosts, fuseIndex.toJSON());
      
      console.log(`[Fuse] Generated and cached index for ${processedPosts.length} posts`);
    }
  }

  return fuseInstance;
}

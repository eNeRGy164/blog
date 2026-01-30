/**
 * Cache for rendered HTML content to avoid repeated markdown processing.
 * Persists across builds to dramatically speed up page generation.
 * 
 * The key insight: page.rendered.html triggers the full markdown-to-HTML
 * conversion pipeline with all rehype/remark plugins on every access.
 * This cache stores the final HTML output to avoid this expensive operation.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
import type { CollectionEntry } from "astro:content";

interface CacheEntry {
  html: string;
  timestamp: number;
  contentHash: string;
}

interface RenderedCache {
  [postId: string]: CacheEntry;
}

const CACHE_DIR = join(process.cwd(), ".cache", "rendered-html");
const CACHE_FILE = join(CACHE_DIR, "cache.json");

let memoryCache: RenderedCache | null = null;
let cacheModified = false;

/**
 * Generate a hash of the post content to detect changes
 * Uses the post's body (markdown source) to create a unique hash
 */
function getContentHash(post: CollectionEntry<'posts'>): string {
  const content = `${post.id}-${post.data.title}-${post.data.date}${post.body || ''}`;
  return createHash('md5').update(content).digest('hex');
}

/**
 * Load rendered HTML cache from disk
 */
function loadCache(): RenderedCache {
  if (memoryCache !== null) {
    return memoryCache;
  }

  try {
    if (existsSync(CACHE_FILE)) {
      const content = readFileSync(CACHE_FILE, "utf-8");
      memoryCache = JSON.parse(content);
      const count = Object.keys(memoryCache).length;
      console.log(`[HTML Cache] Loaded ${count} cached rendered HTML entries`);
      return memoryCache;
    }
  } catch (error) {
    console.warn("[HTML Cache] Failed to load cache:", error);
  }

  memoryCache = {};
  return memoryCache;
}

/**
 * Save rendered HTML cache to disk
 */
function saveCache(cache: RenderedCache): void {
  if (!cacheModified) {
    return; // Don't write if nothing changed
  }

  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify(cache), "utf-8");
    console.log(`[HTML Cache] Saved ${Object.keys(cache).length} entries to disk`);
    cacheModified = false;
  } catch (error) {
    console.warn("[HTML Cache] Failed to save cache:", error);
  }
}

/**
 * Get rendered HTML for a post, using cache if available.
 * Returns the HTML if found in cache and content hasn't changed.
 * Automatically handles cache validation.
 */
export function getRenderedHTML(post: CollectionEntry<'posts'>): string | null {
  const cache = loadCache();
  const postId = post.id;
  const contentHash = getContentHash(post);

  // Check if we have a cached entry
  if (cache[postId]) {
    const entry = cache[postId];
    
    // Validate cache is still fresh (content hasn't changed)
    if (entry.contentHash === contentHash) {
      return entry.html;
    }
    
    // Content changed, invalidate this cache entry
    delete cache[postId];
    cacheModified = true;
  }

  return null;
}

/**
 * Store rendered HTML in cache for a post
 */
export function setRenderedHTML(
  post: CollectionEntry<'posts'>,
  html: string,
): void {
  const cache = loadCache();
  const postId = post.id;
  const contentHash = getContentHash(post);

  cache[postId] = {
    html,
    timestamp: Date.now(),
    contentHash,
  };

  memoryCache = cache;
  cacheModified = true;
  
  // Save immediately to ensure it's available for other workers
  saveCache(cache);
}

/**
 * Flush any pending cache updates
 */
export function flushCache(): void {
  if (memoryCache && cacheModified) {
    saveCache(memoryCache);
  }
}

// Ensure cache is saved when process exits
process.on('beforeExit', () => {
  flushCache();
});

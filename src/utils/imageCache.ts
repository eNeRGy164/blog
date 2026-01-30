/**
 * Cache for image metadata to avoid repeated Sharp processing.
 * Persists across builds to speed up page generation.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import sharp from "sharp";
import { startTiming, endTiming } from "./perfProfile";

interface ImageMetadata {
  width: number;
  height: number;
}

interface ImageCache {
  [filePath: string]: ImageMetadata;
}

const CACHE_DIR = join(process.cwd(), ".cache", "image-metadata");
const CACHE_FILE = join(CACHE_DIR, "metadata.json");

let memoryCache: ImageCache | null = null;

/**
 * Load image metadata cache from disk
 */
function loadCache(): ImageCache {
  if (memoryCache !== null) {
    return memoryCache;
  }

  try {
    if (existsSync(CACHE_FILE)) {
      const content = readFileSync(CACHE_FILE, "utf-8");
      memoryCache = JSON.parse(content);
      console.log(
        `[Image Cache] Loaded ${Object.keys(memoryCache).length} cached image metadata entries`,
      );
      return memoryCache;
    }
  } catch (error) {
    console.warn("[Image Cache] Failed to load cache:", error);
  }

  memoryCache = {};
  return memoryCache;
}

/**
 * Save image metadata cache to disk
 */
function saveCache(cache: ImageCache): void {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (error) {
    console.warn("[Image Cache] Failed to save cache:", error);
  }
}

/**
 * Get image metadata with caching.
 * Reads from cache if available, otherwise processes with Sharp.
 */
export async function getImageMetadata(
  filePath: string,
): Promise<ImageMetadata> {
  const cache = loadCache();

  // Check cache first
  if (cache[filePath]) {
    return cache[filePath];
  }

  // Cache miss - process with Sharp
  startTiming("sharp-process");
  const metadata = await sharp(filePath).metadata();
  endTiming("sharp-process", { filePath });

  const result: ImageMetadata = {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
  };

  // Update cache
  cache[filePath] = result;
  memoryCache = cache;

  // Save to disk (async, don't wait)
  saveCache(cache);

  return result;
}

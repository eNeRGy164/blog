/**
 * Cache for image metadata to avoid repeated Sharp processing.
 * Persists across builds to speed up page generation.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync, renameSync } from "fs";
import { join } from "path";
import sharp from "sharp";

interface ImageMetadata {
  width: number;
  height: number;
  mtime: number;  // File modification time for cache invalidation
}

interface ImageCache {
  [filePath: string]: ImageMetadata;
}

const CACHE_DIR = join(process.cwd(), ".cache", "image-metadata");
const CACHE_FILE = join(CACHE_DIR, "metadata.json");

let memoryCache: ImageCache | null = null;

/**
 * Validate that cached metadata has the expected structure
 */
function isValidImageMetadata(metadata: unknown): metadata is ImageMetadata {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    typeof (metadata as any).width === 'number' &&
    typeof (metadata as any).height === 'number' &&
    typeof (metadata as any).mtime === 'number'
  );
}

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
      const parsed = JSON.parse(content);
      
      // Validate cache structure
      if (typeof parsed === 'object' && parsed !== null) {
        // Filter out invalid entries
        const validCache: ImageCache = {};
        for (const [key, value] of Object.entries(parsed)) {
          if (isValidImageMetadata(value)) {
            validCache[key] = value;
          }
        }
        
        memoryCache = validCache;
        console.log(
          `[Image Cache] Loaded ${Object.keys(validCache).length} cached image metadata entries`,
        );
        return memoryCache;
      }
    }
  } catch (error) {
    console.warn("[Image Cache] Failed to load cache:", error);
  }

  memoryCache = {};
  return memoryCache;
}

/**
 * Save image metadata cache to disk using atomic writes.
 * Uses a temporary file to prevent corruption from concurrent writes.
 */
function saveCache(cache: ImageCache): void {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    
    // Write to temporary file first (atomic operation)
    const tempFile = CACHE_FILE + ".tmp";
    writeFileSync(tempFile, JSON.stringify(cache, null, 2), "utf-8");
    
    // Atomic rename (prevents partial reads during concurrent writes)
    // If this fails due to concurrent writes, it's acceptable - another worker succeeded
    renameSync(tempFile, CACHE_FILE);
  } catch (error) {
    // Cleanup temp file on failure
    try {
      const tempFile = CACHE_FILE + ".tmp";
      if (existsSync(tempFile)) writeFileSync(tempFile, "", "utf-8");
    } catch {}
    console.warn("[Image Cache] Failed to save cache:", error);
  }
}

/**
 * Get image metadata with caching and automatic invalidation.
 * Reads from cache if available and file hasn't changed, otherwise processes with Sharp.
 * Cache is invalidated when file modification time changes.
 */
export async function getImageMetadata(
  filePath: string,
): Promise<Omit<ImageMetadata, 'mtime'>> {
  const cache = loadCache();
  
  // Get current file modification time for cache invalidation
  let currentMtime: number;
  try {
    const stats = statSync(filePath);
    currentMtime = stats.mtimeMs;
  } catch (error) {
    console.error(`[Image Cache] Failed to stat file ${filePath}:`, error);
    return { width: 0, height: 0 };
  }

  // Check cache and validate it's not stale
  if (cache[filePath] && cache[filePath].mtime === currentMtime) {
    // Cache hit with valid timestamp
    return {
      width: cache[filePath].width,
      height: cache[filePath].height,
    };
  }

  // Cache miss or stale - process with Sharp
  try {
    const metadata = await sharp(filePath).metadata();

    const result: ImageMetadata = {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
      mtime: currentMtime,
    };

    // Update cache
    cache[filePath] = result;
    memoryCache = cache;

    // Save to disk using atomic writes
    // If multiple workers try to save concurrently, that's acceptable
    saveCache(cache);

    return {
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error(`[Image Cache] Failed to process image ${filePath}:`, error);
    // Return default dimensions on error
    return { width: 0, height: 0 };
  }
}

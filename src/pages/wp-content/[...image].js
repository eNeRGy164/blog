import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { getCache } from "../../utils/imageVariants";

const imageCache = new Map();
const CACHE_DIR = path.join(process.cwd(), ".cache", "images");
const VALID_CONTENT_TYPES = new Set([
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/gif",
]);

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Generate a safe, unique cache key from an image path using MD5 hash
 */
function getCacheKey(imagePath) {
  return crypto.createHash("md5").update(imagePath).digest("hex");
}

/**
 * Calculate hash of a source file to detect changes
 */
async function getSourceFileHash(filePath) {
  try {
    const content = await fsp.readFile(filePath);
    return crypto.createHash("md5").update(content).digest("hex");
  } catch (err) {
    console.warn(`Failed to hash source file ${filePath}:`, err);
    return null;
  }
}

/**
 * Generate cache metadata key that includes processing parameters
 */
function getCacheMetadata(sourceHash, width, height, isWebP) {
  return {
    sourceHash,
    width: width || null,
    height: height || null,
    isWebP,
  };
}

/**
 * Generate static paths from the image cache.
 * @returns {Array} - Static paths for all available images.
 */
export async function getStaticPaths() {
  const paths = [];
  const imagePathCache = await getCache();

  // Iterate over the cache to extract all valid paths
  for (const [, variants] of Object.entries(imagePathCache)) {
    variants.forEach((variant) => {
      paths.push({
        params: { image: variant.path.replace("/wp-content", "") },
      });
    });
  }

  return paths;
}

/**
 * Handles GET requests for image optimization, resizing, and format conversion.
 */
export async function GET({ params }) {
  const imagePath = params.image;

  // Check in-memory cache first
  if (imageCache.has(imagePath)) {
    const cached = imageCache.get(imagePath);

    return new Response(cached.buffer, {
      status: 200,
      headers: { "Content-Type": cached.contentType },
    });
  }

  const wpContentOrgBase = path.join(process.cwd(), "wp-content");
  const requestedFilePath = path.join(wpContentOrgBase, imagePath);

  const isWebPRequest = path.extname(imagePath).toLowerCase() === ".webp";
  const resizeMatch = imagePath.match(/-(\d+)x(\d+)(\.webp|\.png|\.jpg|\.jpeg|\.gif)$/i);
  const requestedWidth = resizeMatch ? parseInt(resizeMatch[1], 10) : null;
  const requestedHeight = resizeMatch ? parseInt(resizeMatch[2], 10) : null;

  const sourceFilePath = findSourceFile(requestedFilePath, resizeMatch, isWebPRequest);

  if (!sourceFilePath) {
    return new Response("Image not found", { status: 404 });
  }

  // Calculate hash of source file to detect changes
  const sourceHash = await getSourceFileHash(sourceFilePath);
  
  if (!sourceHash) {
    // If we can't hash the source, process without caching
    const { buffer, contentType } = await processImage(sourceFilePath, requestedWidth, requestedHeight, isWebPRequest);
    return new Response(buffer, {
      status: 200,
      headers: { "Content-Type": contentType },
    });
  }

  // Check disk cache with source hash validation
  const cacheKey = getCacheKey(imagePath);
  const cacheFilePath = path.join(CACHE_DIR, cacheKey);
  const cacheMetaPath = cacheFilePath + ".meta.json";

  try {
    // Use async file operations to avoid blocking
    const [cacheExists, metaExists] = await Promise.all([
      fsp.access(cacheFilePath).then(() => true).catch(() => false),
      fsp.access(cacheMetaPath).then(() => true).catch(() => false),
    ]);

    if (cacheExists && metaExists) {
      const [buffer, metaContent] = await Promise.all([
        fsp.readFile(cacheFilePath),
        fsp.readFile(cacheMetaPath, "utf8"),
      ]);
      
      const meta = JSON.parse(metaContent);
      
      // Validate content type to prevent serving corrupted cache
      if (!VALID_CONTENT_TYPES.has(meta.contentType)) {
        throw new Error(`Invalid content type in cache: ${meta.contentType}`);
      }
      
      // Validate source hash and processing parameters
      // Cache is invalid if source changed or processing parameters changed
      if (meta.sourceHash === sourceHash &&
          meta.width === requestedWidth &&
          meta.height === requestedHeight &&
          meta.isWebP === isWebPRequest) {
        
        // Cache is valid, use it
        imageCache.set(imagePath, { buffer, contentType: meta.contentType });
        
        return new Response(buffer, {
          status: 200,
          headers: { "Content-Type": meta.contentType },
        });
      } else {
        // Cache is stale, will regenerate below
        console.log(`Cache invalidated for ${imagePath}: source or parameters changed`);
      }
    }
  } catch (err) {
    // If cache read fails, continue to process the image
    console.warn(`Failed to read cache for ${imagePath}:`, err);
  }

  // Process the image (cache miss or invalid)
  const { buffer, contentType } = await processImage(sourceFilePath, requestedWidth, requestedHeight, isWebPRequest);

  // Cache the processed image in memory
  imageCache.set(imagePath, { buffer, contentType });

  // Cache the processed image on disk with metadata (async, don't await to avoid blocking response)
  const cacheMetadata = {
    contentType,
    sourceHash,
    width: requestedWidth,
    height: requestedHeight,
    isWebP: isWebPRequest,
  };
  
  Promise.all([
    fsp.writeFile(cacheFilePath, buffer),
    fsp.writeFile(cacheMetaPath, JSON.stringify(cacheMetadata)),
  ]).catch(err => {
    console.warn(`Failed to write cache for ${imagePath}:`, err);
  });

  // Serve the processed image
  return new Response(buffer, {
    status: 200,
    headers: { "Content-Type": contentType },
  });
}

/**
 * Finds the source file for resizing or optimization.
 */
function findSourceFile(requestedFilePath, resizeMatch, isWebPRequest) {
  const possibleExtensions = [".png", ".jpg", ".jpeg", ".gif"];
  const baseFilePath = requestedFilePath.replace(/-\d+x\d+(\.\w+)?$/, "");

  if (resizeMatch) {
    return possibleExtensions.map((ext) => `${baseFilePath}${ext}`).find(fs.existsSync);
  }

  if (isWebPRequest) {
    return possibleExtensions.map((ext) => `${baseFilePath.replace(/.webp/, "")}${ext}`).find(fs.existsSync);
  }

  return fs.existsSync(requestedFilePath) ? requestedFilePath : null;
}

/**
 * Processes the image (resize and/or convert to WebP).
 */
async function processImage(sourceFilePath, requestedWidth, requestedHeight, isWebPRequest) {
  const sharpInstance = sharp(sourceFilePath, { pages: -1 }).withMetadata(false);

  if (requestedWidth && requestedHeight) {
    sharpInstance.resize(requestedWidth, requestedHeight, { fit: "cover" });
  }

  let buffer;
  let contentType;

  if (isWebPRequest) {
    buffer = await sharpInstance.webp().toBuffer();
    contentType = "image/webp";
  } else {
    const extension = path.extname(sourceFilePath).toLowerCase();

    if (extension === ".png") {
      buffer = await sharpInstance.png({ palette: true, compressionLevel: 9 }).toBuffer();
      contentType = "image/png";
    } else if (extension === ".gif")  {
      buffer = await sharpInstance.gif().toBuffer();
      contentType = "image/gif";
    } else {
      buffer = await sharpInstance.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
    }
  }

  return { buffer, contentType };
}

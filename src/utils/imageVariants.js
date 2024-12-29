import fs from "fs";
import path from "path";
import sharp from "sharp";

// Directory containing source images
const imagesDir = path.join(process.cwd(), "wp-content", "uploads");

// Define common sizes
const sizes = [
  { label: "original", width: null, height: null },
  { label: "thumbnail", width: 150, height: 150 },
  { label: "medium", width: 185, height: 185 },
  { label: "medium_large", width: 636, height: null },
];

// Initialize the image path cache
export let imagePathCache = {};
const initializeCache = async () => {
  imagePathCache = await generateImageVariants(imagesDir);
};

// Preload the cache during build
await initializeCache();

export async function getCache() {
  if (Object.keys(imagePathCache).length === 0) {
    await initializeCache();
  }

  return imagePathCache;
}

/**
 * Generate image variants for a given directory.
 * @param {string} dirPath - Directory containing source images.
 * @returns {Object} - A map of image variants for each source image.
 */
export async function generateImageVariants(dirPath) {
  const cache = {};

  // Recursively find all images
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);

    if (file.isDirectory()) {
      // Recurse into subdirectories
      Object.assign(cache, await generateImageVariants(filePath));
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)) {
      // Process image files
      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext);

      // Read the original image dimensions
      const originalPath = filePath;
      let metadata = null;
      try {
        metadata = await sharp(originalPath).metadata();
      } catch (err) {
        console.warn(`Could not read metadata for ${file.name}:`, err);
      }

      const originalWidth = metadata?.width || null;
      const originalHeight = metadata?.height || null;

      const relativeDir = path.relative(imagesDir, path.dirname(filePath)).replace(/\\/g, "/");
      const relativePath = (fileName) => `/wp-content/uploads/${relativeDir}/${fileName}`;

      const variants = [];

      // Always include the original file
      variants.push({
        label: "original",
        path: relativePath(file.name),
        width: originalWidth,
        height: originalHeight,
      },
      {
        label: "original-webp",
        path: relativePath(file.name).replace(ext, ".webp"),
        width: originalWidth,
        height: originalHeight,
      });

      // Determine existing resized versions
      sizes.forEach((size) => {
        if (size.label === "original") return;

        const resizedWidth = size.width || Math.round(size.height * (originalWidth / originalHeight));
        const resizedHeight = size.height || Math.round(size.width * (originalHeight / originalWidth));

        // Only add if resized dimensions are smaller than the original
        if (resizedWidth >= originalWidth || resizedHeight >= originalHeight) return;

        const resizedName = `${baseName}-${resizedWidth}x${resizedHeight}${ext}`;
        const resizedPath = relativePath(resizedName);

        variants.push({
          label: size.label,
          path: resizedPath,
          width: resizedWidth,
          height: resizedHeight,
        });

        // Check for WebP equivalent
        const webpPath = resizedPath.replace(ext, ".webp");

        variants.push({
          label: `${size.label}-webp`,
          path: webpPath,
          width: resizedWidth,
          height: resizedHeight,
        });
      });

      cache[file.name] = variants;
    }
  }

  return cache;
}

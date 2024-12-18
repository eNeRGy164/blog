import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getCache } from "../../utils/imageVariants";

const imageCache = new Map();

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
  
  if (imageCache.has(imagePath)) {
    const cached = imageCache.get(imagePath);

    return new Response(cached.buffer, {
      status: 200,
      headers: { "Content-Type": cached.contentType },
    });
  }

  const wpContentOrgBase = path.join(process.cwd(), "wp-content-org");
  const requestedFilePath = path.join(wpContentOrgBase, imagePath);

  const isWebPRequest = path.extname(imagePath).toLowerCase() === ".webp";
  const resizeMatch = imagePath.match(/-(\d+)x(\d+)(\.webp|\.png|\.jpg|\.jpeg|\.gif)$/i);
  const requestedWidth = resizeMatch ? parseInt(resizeMatch[1], 10) : null;
  const requestedHeight = resizeMatch ? parseInt(resizeMatch[2], 10) : null;

  const sourceFilePath = findSourceFile(requestedFilePath, resizeMatch, isWebPRequest);

  if (!sourceFilePath) {
    return new Response("Image not found", { status: 404 });
  }

  const { buffer, contentType } = await processImage(sourceFilePath, requestedWidth, requestedHeight, isWebPRequest);

  // Cache the processed image
  imageCache.set(imagePath, { buffer, contentType });

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

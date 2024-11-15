import fs from "fs";
import path from "path";
import sharp from "sharp";

const imageCache = new Map();

/** 
 * Recursively fetches all image files from a directory and its subdirectories.
 */
function getAllFiles(dirPath) {
  const files = fs.readdirSync(dirPath);
  const allFiles = [];

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      allFiles.push(...getAllFiles(filePath));
    } else if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
      allFiles.push(filePath);
    }
  });

  return allFiles;
}

/**
 * Calculates dimensions constrained by a maximum box size while maintaining aspect ratio.
 */
function calculateBoxSize(originalWidth, originalHeight, maxWidth, maxHeight) {
  const widthRatio = maxWidth / originalWidth;
  const heightRatio = maxHeight / originalHeight;
  const scale = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  };
}

/**
 * Generates static paths for original and resized images.
 */
export async function getStaticPaths() {
  const boxSizes = [
    { label: "thumbnail", maxWidth: 150, maxHeight: 150 },
    { label: "medium", maxWidth: 185, maxHeight: 185 },
    { label: "medium_large", maxWidth: 630, maxHeight: 630 },
  ];

  const imagesDir = path.join(process.cwd(), "wp-content-org", "uploads");
  const imageFiles = getAllFiles(imagesDir);
  const paths = [];

  for (const file of imageFiles) {
    const relativePath = path
      .relative(imagesDir, file)
      .split(path.sep)
      .join("/");
    const baseName = path.basename(relativePath, path.extname(relativePath));
    const directory = path.dirname(relativePath);
    const extension = path.extname(relativePath).toLowerCase();

    const originalImage = sharp(file);
    const metadata = await originalImage.metadata();

    // Add original image
    paths.push(generatePath(directory, baseName, extension, metadata, "original"));

    // Add WebP for original
    if (extension !== ".webp") {
      paths.push(generatePath(directory, baseName, ".webp", metadata, "original-webp"));
    }

    // Add resized versions
    boxSizes.forEach((size) => {
      const { width, height } = calculateBoxSize(metadata.width, metadata.height, size.maxWidth, size.maxHeight);
      if (metadata.width > width || metadata.height > height) {
        paths.push(generatePath(directory, `${baseName}-${width}x${height}`, extension, { width, height }));
        paths.push(generatePath(directory, `${baseName}-${width}x${height}`, ".webp", { width, height }, "webp"));
      }
    });
  }

  return paths;
}

/**
 * Utility to create a path entry for static images.
 */
function generatePath(directory, name, extension, metadata, label = null) {
  const fullPath = `/uploads/${directory}/${name}${extension}`.replace("wp-content-org/", "");
  return {
    params: { image: fullPath },
    props: {
      label,
      width: metadata.width,
      height: metadata.height,
    },
  };
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
  const resizeMatch = imagePath.match(/-(\d+)x(\d+)(\.webp|\.png|\.jpg|\.jpeg)$/i);
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
  const possibleExtensions = [".png", ".jpg", ".jpeg"];
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
  const sharpInstance = sharp(sourceFilePath).withMetadata(false);

  if (requestedWidth && requestedHeight) {
    sharpInstance.resize(requestedWidth, requestedHeight, { fit: "inside" });
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
    } else {
      buffer = await sharpInstance.jpeg({ quality: 90, mozjpeg: true }).toBuffer();
      contentType = "image/jpeg";
    }
  }

  return { buffer, contentType };
}

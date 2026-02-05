import { visit } from "unist-util-visit";
import path from "path";
import { getCache } from "../utils/imageVariants";

let imageCache = {};

/**
 * Finds an <img> element within a node.
 * Returns { img, isWrappedInLink, linkElement } or null if no processable image found.
 */
function findImageInNode(node) {
  // Case 1: Direct <img> element
  if (node.tagName === "img") {
    return { img: node, isWrappedInLink: false, linkElement: null };
  }

  // Case 2: <a> containing only an <img> (linked image from markdown: [![alt](img)](url))
  if (
    node.tagName === "a" &&
    node.children?.length === 1 &&
    node.children[0].tagName === "img"
  ) {
    return {
      img: node.children[0],
      isWrappedInLink: true,
      linkElement: node,
    };
  }

  return null;
}

/**
 * Builds the responsive picture element with WebP sources.
 */
function buildPictureElement(imgNode, original, resized, variants) {
  const webpCandidates = variants
    .filter((variant) => variant.label.includes("webp"))
    .filter((variant) => variant.width)
    .sort((a, b) => a.width - b.width);

  const webpSrcset = webpCandidates
    .map((variant) => `${variant.path} ${variant.width}w`)
    .join(", ");

  const sizes = "(max-width: 636px) 100vw, 636px";

  const imgElement = {
    type: "element",
    tagName: "img",
    properties: {
      src: original.path,
      alt: imgNode.properties.alt || "",
      loading: "lazy",
      decoding: "async",
      width: resized ? resized.width : original.width,
      height: resized ? resized.height : original.height,
      "data-image-component": "true",
    },
  };

  const pictureChildren = [];
  if (webpSrcset) {
    pictureChildren.push({
      type: "element",
      tagName: "source",
      properties: {
        type: "image/webp",
        srcset: webpSrcset,
        sizes: sizes,
      },
    });
  }
  pictureChildren.push(imgElement);

  return {
    type: "element",
    tagName: "picture",
    children: pictureChildren,
  };
}

/**
 * Rehype plugin to enhance images in Markdown with responsive handling.
 *
 * Behavior:
 * - Standalone images: wrapped in <figure>, with <a> to full-size if resized
 * - Images already in a link ([![alt](img)](url)): wrapped in <figure>,
 *   but the original link is preserved (no link to full-size)
 */
export default function CustomImage() {
  return async (tree) => {
    // Ensure the image cache is loaded
    if (Object.keys(imageCache).length === 0) {
      imageCache = await getCache();
    }

    visit(tree, "element", (node, index, parent) => {
      // Only process <p> elements that contain a single image or linked image
      if (node.tagName !== "p" || node.children?.length !== 1) return;

      const result = findImageInNode(node.children[0]);
      if (!result) return;

      const { img, isWrappedInLink, linkElement } = result;
      const src = img.properties.src;

      if (!src || !src.startsWith("/wp-content/uploads/")) return;

      const imageName = path.basename(src);
      const variants = imageCache[imageName];

      if (!variants) {
        console.warn(`No cache entry for image: ${src}`);
        return;
      }

      const original = variants.find((v) => v.label === "original");
      const resized = variants.find((v) => v.label === "medium_large-webp");

      if (!original) return;

      const pictureElement = buildPictureElement(img, original, resized, variants);

      // Build the figure element
      const figureElement = {
        type: "element",
        tagName: "figure",
        properties: {
          className: ["wp-shadow", ...(resized ? ["is-resized"] : [])],
        },
        children: [],
      };

      if (isWrappedInLink) {
        // Preserve the original link: wrap <picture> inside the existing <a>
        const preservedLink = {
          type: "element",
          tagName: "a",
          properties: { ...linkElement.properties },
          children: [pictureElement],
        };
        figureElement.children.push(preservedLink);
      } else if (resized) {
        // Standalone image that is resized: add link to full-size
        const linkToFullSize = {
          type: "element",
          tagName: "a",
          properties: {
            href: original.path,
            "aria-label": "View full-size image",
          },
          children: [pictureElement],
        };
        figureElement.children.push(linkToFullSize);
      } else {
        // Standalone image, not resized: no link wrapper
        figureElement.children.push(pictureElement);
      }

      // Add figcaption if title exists on the original img
      if (img.properties.title) {
        figureElement.children.push({
          type: "element",
          tagName: "figcaption",
          children: [{ type: "text", value: img.properties.title }],
        });
      }

      // Replace the <p> with <figure>
      node.tagName = "figure";
      node.properties = figureElement.properties;
      node.children = figureElement.children;
    });
  };
}

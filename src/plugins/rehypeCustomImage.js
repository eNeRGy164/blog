import { visit } from "unist-util-visit";
import path from "path";
import { getCache } from "../utils/imageVariants";

let imageCache = {};

/**
 * Rehype plugin to enhance images in Markdown with responsive handling.
 */
export default function CustomImage() {
  return async (tree) => {
    // Ensure the image cache is loaded
    if (Object.keys(imageCache).length === 0) {
      imageCache = await getCache();
    }

    visit(tree, "element", (node, index, parent) => {
      // Process only <img> elements
      if (node.tagName !== "img") return;

      const src = node.properties.src;
      if (!src || !src.startsWith("/wp-content/uploads/")) return; // Only process local images

      // Find the corresponding image variants in the cache
      const imageName = path.basename(src);
      const variants = imageCache[imageName];

      if (!variants) {
        console.warn(`No cache entry for image: ${src}`);
        return;
      }

      // Identify the original image and resized version for 630px width
      const original = variants.find((v) => v.label === "original");
      const resized = variants.find((v) => v.label === "medium_large-webp");

      if (!original) return;

      const webpCandidates = variants
        .filter((variant) => variant.label.includes("webp"))
        .filter((variant) => variant.width) // ensure width-described candidates
        .sort((a, b) => a.width - b.width);

      // Build a single WebP srcset (width descriptors) for the <source>
      const webpSrcset = webpCandidates
        .map((variant) => `${variant.path} ${variant.width}w`)
        .join(", ");

      // Default rendering size
      const sizes = "(max-width: 636px) 100vw, 636px";

      // Fallback <img> uses ONLY the original. No srcset/sizes here.
      const imgElement = {
        type: "element",
        tagName: "img",
        properties: {
          src: original.path,
          alt: node.properties.alt || "",
          loading: "lazy",
          decoding: "async",
          width: resized ? resized.width : original.width,
          height: resized ? resized.height : original.height,
          "data-image-component": "true",
        },
      };

      // Single <source type="image/webp"> (no media; browser will pick best width)
      const pictureChildren = [];
      if (webpSrcset) {
        pictureChildren.push({
          type: "element",
          tagName: "source",
          properties: {
            type: "image/webp",
            srcset: webpSrcset, // valid HTML attribute name
            sizes: sizes,
          },
        });
      }
      pictureChildren.push(imgElement);

      const pictureElement = {
        type: "element",
        tagName: "picture",
        children: pictureChildren,
      };

      // Wrap in <figure> with hints and classes
      const figureElement = {
        type: "element",
        tagName: "figure",
        properties: {
          className: ["wp-shadow", ...(resized ? ["is-resized"] : [])],
        },
        children: [],
      };

      // Add <a> wrapping if resized
      if (resized) {
        const linkElement = {
          type: "element",
          tagName: "a",
          properties: {
            href: original.path,
            "aria-label": "View full-size image",
          },
          children: [pictureElement],
        };
        figureElement.children.push(linkElement);
      } else {
        figureElement.children.push(pictureElement);
      }

      // Add figcaption if title exists
      if (node.properties.title) {
        figureElement.children.push({
          type: "element",
          tagName: "figcaption",
          children: [{ type: "text", value: node.properties.title }],
        });
      }

      // If the parent is a <p> containing only this <img>, replace the <p>
      if (parent.tagName === "p" && parent.children.length === 1) {
        parent.tagName = "figure";
        parent.properties = figureElement.properties;
        parent.children = figureElement.children;
      } else {
        // Otherwise, replace just the <img> with <figure>
        parent.children[index] = figureElement;
      }
    });
  };
}

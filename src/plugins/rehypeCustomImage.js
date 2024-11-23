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
      const resized = variants.find((v) => v.label === "medium_large");

      // Filter variants for unique widths
      const uniqueVariants = [];
      const seenWidths = new Set();
      for (const variant of variants) {
        if (variant.width && !seenWidths.has(variant.width)) {
          uniqueVariants.push(variant);
          seenWidths.add(variant.width);
        }
      }

      // Consolidate srcset
      const srcset = uniqueVariants
        .map((variant) => `${variant.path} ${variant.width}w`)
        .join(", ");

      // Default rendering size
      const sizes = "(max-width: 625px) 100vw, 625px";

      const imgElement = {
        type: "element",
        tagName: "img",
        properties: {
          src: resized ? resized.path : original.path,
          alt: node.properties.alt || "",
          title: node.properties.title || "",
          loading: "lazy",
          decoding: "async",
          width: resized ? resized.width : original.width,
          height: resized ? resized.height : original.height,
          srcSet: srcset,
          sizes: sizes,
          "data-image-component": "true",
        },
      };

      const pictureElement = {
        type: "element",
        tagName: "picture",
        children: [
          // Add WebP sources if available
          ...variants
            .filter((v) => v.label.includes("webp"))
            .map((v) => ({
              type: "element",
              tagName: "source",
              properties: {
                srcSet: v.path,
                type: "image/webp",
                media: `(max-width: ${v.width}px)`,
              },
            })),
          imgElement,
        ],
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

      // Replace the <img> element with the <figure>
      parent.children[index] = figureElement;
    });
  };
}
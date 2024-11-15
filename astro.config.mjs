import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import abbreviate from './src/components/Abbreviate.js';
import youTubeEmbed from './src/components/YouTube.js';
import { rehypeGithubAlerts } from "rehype-github-alerts";
import react from "@astrojs/react";
import { ACRONYMS } from "./src/config";
import rehypeCustomImage from "./src/plugins/rehypeCustomImage.js";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.hompus.nl",
  integrations: [mdx(), sitemap(), react()],
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeGithubAlerts,
      [
        rehypeExternalLinks,
        {
          content: {},
          rel: ['noopener', 'noreferrer', 'external'],
          target: "_blank",
          test: (node, _, __) => node.tagName === 'a' && typeof node.properties.href === 'string' && !node.properties.href.includes('linkedin.com'),
        },
      ],
      [ abbreviate, { acronyms: ACRONYMS } ],
      youTubeEmbed,
      rehypeCustomImage
    ],
  },
});

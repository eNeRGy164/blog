import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import rehypeCustomImage from "./src/plugins/rehypeCustomImage.js";
import rehypeAbbreviate from "./src/plugins/rehypeAbbreviate.js";
import rehypeYouTubeEmbed from "./src/plugins/rehypeYouTubeEmbed.js";
import rehypeAddContributorId from './src/plugins/rehypeAddMvpContributorId.js';
import { rehypeGithubAlerts } from "rehype-github-alerts";
import react from "@astrojs/react";
import { ACRONYMS } from "./src/config";
import yaml from '@rollup/plugin-yaml';

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
      [rehypeAbbreviate, { acronyms: ACRONYMS }],
      [rehypeAddContributorId, { contributorId: 'AZ-MVP-5004268'}],
      rehypeYouTubeEmbed,
      rehypeCustomImage
    ],
  },
  vite: {
    plugins: [yaml()]
  }
});

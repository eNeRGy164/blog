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
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: "https://blog.hompus.nl",
  integrations: [sitemap(), expressiveCode({ defaultProps: { wrap: true } })],
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
      [
        rehypeAbbreviate,
        {
          acronyms: yamlParser.parse(
            readFileSync("./src/config/acronyms.yaml", "utf8"),
          ).ACRONYMS,
        },
      ],
      rehypeYouTubeEmbed,
      rehypeAccessibleEmojis,
      rehypeCustomImage
    ],
  },
  vite: {
    plugins: [yaml()]
  }
});

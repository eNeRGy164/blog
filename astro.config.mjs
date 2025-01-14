import { defineConfig } from "astro/config";
import yaml from "@rollup/plugin-yaml";
import yamlParser from "yaml";
import { readFileSync } from "fs";
import expressiveCode, { ExpressiveCodeTheme } from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import rehypeAbbreviate from "./src/plugins/rehypeAbbreviate.js";
import rehypeAddMvpContributorId from "./src/plugins/rehypeAddMvpContributorId.js";
import rehypeYouTubeEmbed from "./src/plugins/rehypeYouTubeEmbed.js";
import rehypeCustomImage from "./src/plugins/rehypeCustomImage.js";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import { rehypeAccessibleEmojis } from "rehype-accessible-emojis";
import sitemap from "@astrojs/sitemap";

const jsoncString = readFileSync(
  new URL(`./src/config/vscode-theme.jsonc`, import.meta.url),
  "utf-8",
);
const vscodeTheme = ExpressiveCodeTheme.fromJSONString(jsoncString);

export default defineConfig({
  site: "https://blog.hompus.nl",
  integrations: [
    sitemap(),
    expressiveCode({
      plugins: [pluginLineNumbers()],
      defaultProps: {
        wrap: true,
        showLineNumbers: false,
      },
      styleOverrides: {
        codeFontFamily: "var(--font-monospace)",
        codeFontSize: "0.78125rem",
        codeLineHeight: "1.6",
        uiFontSize: "0.78125rem",

        lineNumbers: {
          highlightForeground: "#85c7ebb3",
        },
      },
      themes: [vscodeTheme],
    }),
  ],
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeGithubAlerts,
      [
        rehypeExternalLinks,
        {
          content: {},
          rel: ["noopener", "noreferrer", "external"],
          target: "_blank",
          test: (node, _, __) =>
            node.tagName === "a" &&
            typeof node.properties.href === "string" &&
            !node.properties.href.includes("linkedin.com"),
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
      [rehypeAddMvpContributorId, { contributorId: "AZ-MVP-5004268" }],
      rehypeYouTubeEmbed,
      rehypeAccessibleEmojis,
      rehypeCustomImage,
    ],
    syntaxHighlight: false,
  },
  vite: {
    plugins: [yaml()],
  },
  build: {
    concurrency: 2,
  }
});

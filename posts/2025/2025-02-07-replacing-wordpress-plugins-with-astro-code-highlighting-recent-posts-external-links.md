---
id: 2123
title: "Replacing WordPress Plugins with Astro: Code Highlighting, Recent Posts & External Links"
date: 2025-02-10T23:30:00+01:00
updated: 2025-02-10T23:30:00+01:00
author: Michaël Hompus
excerpt: >
  As I continue migrating from WordPress to Astro,
  I am rebuilding key plugin features without third-party dependencies.

  In this post, I will show how I replaced syntax highlighting,
  recent post widgets, and external link management using Astro’s flexible ecosystem.
permalink: /2025/02/10/replacing-wordpress-plugins-with-astro-code-highlighting-recent-posts-external-links/
image: /wp-content/uploads/2025/02/post-2025-02-10-thumbnail.png
categories:
  - Azure
tags:
  - WordPress
  - Astro
  - Migration
  - Static Site
  - Plugins
  - Syntax Highlighting
  - Recent Posts
  - External Links
series: WordPress to Astro Migration
---

This post is a continuation of my migration journey from WordPress to Astro.
If you have not read the previous posts, you might want to start with
[Why I Switched from WordPress to Astro](/2025/01/20/why-i-switched-from-wordpress-to-astro-faster-cheaper-greener/),
[How I Moved My Blog Content](/2025/02/01/migrating-from-wordpress-to-astro-how-i-moved-my-blog-content/) and how I am
[Replacing WordPress Plugins with Astro: Acronyms, Meta Tags & Tag Clouds](/2025/02/03/replacing-wordpress-plugins-with-astro-acronyms-meta-tags-tag-clouds/).

In this post, I cover how I replaced the next set of WordPress plugins with equivalent functionality in Astro:

1. [Enlighter](#enlighter)
2. [Recent Post Widget Extended](#recent-post-widget-extended)
3. [WP External Links](#wp-external-links)

<!--more-->

## Enlighter

The [Enlighter][PLUGIN_ENLIGHTER] plugin provided syntax highlighting for code blocks in WordPress, allowing custom styles and line numbers.

### Astro Implementation

I replaced Enlighter with [`Expressive Code`][EXPRESSIVE_CODE].
It is a powerful and flexible replacement for syntax highlighting in Astro.

Here's how I set it up:

```ts title="astro.config.mjs"
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";

export default defineConfig({
  integrations: [
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
    }),
  ],
});
```

I configured it to wrap long lines by default and disabled line numbers unless explicitly enabled.
Additionally, I set the font family, size, and other styles to match the styling of my blog.

### Using My Visual Studio Code Theme

I prefer the syntax highlighting theme in [Visual Studio Code][VSCODE] over the default GitHub styling.

Expressive Code allows you to define custom themes based on VS Code exports.
So, I exported my theme and applied it in Expressive Code!

```jsonc title="src/config/vscode-theme.jsonc"
{
  "$schema": "vscode://schemas/color-theme",
  "type": "dark",
  "colors": {
    "actionBar.toggledBackground": "#383a49",
    "activityBar.activeBorder": "#0078d4",
    "activityBar.background": "#181818",
    ...
  },
  "tokenColors": []
}
```

Full VS Code theme available here: [vscode-theme.jsonc][VSCODE_THEME]

Because the theme file is a `jsonc` file. I had to load it in a specific manner in the `astro.config.mjs` file:

```ts title="astro.config.mjs"
import { defineConfig } from "astro/config";
import { readFileSync } from "fs";
import expressiveCode, { ExpressiveCodeTheme } from "astro-expressive-code";

const jsoncString = readFileSync(new URL(`./src/config/vscode-theme.jsonc`, import.meta.url), 'utf-8')
const vscodeTheme = ExpressiveCodeTheme.fromJSONString(jsoncString)

export default defineConfig({
  integrations: [
    expressiveCode({
      ...
      themes: [vscodeTheme]
    })
  ],
})
```

As you can already see in all the code samples in my posts, the syntax highlighting is working beautifully.

Full implementation on GitHub: [astro.config.mjs][ASTRO_CONFIG_MJS].

## Recent Post Widget Extended

The [Recent Post Widget Extended plugin][PLUGIN_RPWE] displayed recent posts dynamically.

### Astro Implementation

In Astro, I created a simple loop using Astro's Content Collection API.

```astro title="src/components/Sidebar.astro" showlinenumbers
---
import { getCollection } from 'astro:content';

const unsortedPosts = await getCollection('posts')
const posts: { data: { permalink: string; title: string } }[] = sortedPosts(unsortedPosts);
```

Next, I render the recent posts in the sidebar while filtering out the current post (if applicable):

```astro title="src/components/Sidebar.astro" showlinenumbers startlinenumber="92"
<aside id="recent-posts">
  <h2>Recent Posts</h2>
  <div>
    <nav>
      <ol>
        {
          posts
            .slice(0, 6)
            .filter((p) => p.data.permalink !== Astro.url.pathname)
            .slice(0, 5)
            .map((post) => (
              <li>
                <a href={post.data.permalink} target="_self">
                  {post.data.title}
                </a>
              </li>
            ))
        }
      </ol>
    </nav>
  </div>
</aside>
```

Full implementation on GitHub: [Sidebar.astro][SIDEBAR_ASTRO].

## WP External Links

The [External Links][PLUGIN_EXTERNAL_LINKS] plugin manages external links, adding icons and SEO attributes.

### Astro Implementation

I replaced this with [rehype-external-links][REHYPE_EXTERNAL_LINKS],
configuring it in `astro.config.mjs`:

```ts title="astro.config.mjs"
import rehypeExternalLinks from "rehype-external-links";

export default defineConfig({
  markdown: {
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          content: {},
          rel: ["noopener", "noreferrer", "external"],
          target: "_blank",
        },
      ],
    ],
  },
});
```

Now every link that contains an external URL will open in a new tab with the `noopener`, `noreferrer`, and `external` attributes.

Using CSS on `a` tags where the `rel` attribute contains `external`, I added an external link icon:

```css title="global.css" showlinenumbers startlinenumber="49"
a[rel~="external"] span {
  width: 10px;
  height: 10px;
  display: inline-block;
  margin-left: 0.3em;
  background-image: url(/icon-13.png);
}
```

You can see this implementation in action with various external links on this page.

If you want to exclude certain domains from being treated as external links,
you can use a `test` function in the configuration.
I used this to exclude LinkedIn links.

View the full code on GitHub: [astro.config.mjs][ASTRO_CONFIG_MJS] and [global.css][GLOBAL_CSS].

---

This was the next set of 3 plugins I replaced with Astro functionality.

In the next post, I will cover more plugins, including paging, related posts, and more.

[ASTRO_CONFIG_MJS]: https://github.com/eNeRGy164/blog/blob/2a7cbe01749ec81311a214da25e52daabf0cc613/astro.config.mjs
[EXPRESSIVE_CODE]: https://expressive-code.com/
[GLOBAL_CSS]: https://github.com/eNeRGy164/blog/blob/2e03615d87f01156acd6ee7f56d8b8226fc2b1e4/src/styles/global.css
[PLUGIN_ENLIGHTER]: https://wordpress.org/plugins/enlighter/
[PLUGIN_EXTERNAL_LINKS]: https://wordpress.org/plugins/wp-external-links/
[PLUGIN_RPWE]: https://wordpress.com/plugins/recent-posts-widget-extended
[REHYPE_EXTERNAL_LINKS]: https://github.com/rehypejs/rehype-external-links
[SIDEBAR_ASTRO]: https://github.com/eNeRGy164/blog/blob/2a3e9bb28fef2dbdec8fd2fe644bffc239838c62/src/components/Sidebar.astro
[VSCODE]: https://code.visualstudio.com/
[VSCODE_THEME]: https://github.com/eNeRGy164/blog/blob/31fa4a81a005fa1469dbdc07bc2c53b610344886/src/config/vscode-theme.jsonc

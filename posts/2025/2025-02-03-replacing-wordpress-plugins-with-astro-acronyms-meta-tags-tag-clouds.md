---
id: 2122
title: "Replacing WordPress Plugins with Astro: Acronyms, Meta Tags & Tag Clouds"
date: 2025-02-03T23:30:00+01:00
updated: 2025-02-03T23:30:00+01:00
author: Michaël Hompus
excerpt: >
  Moving from WordPress to Astro meant rethinking how I implemented various features that were previously handled by plugins.
  In this post, I explain how I replaced key WordPress plugin functionalities in Astro,
  including acronyms, metadata, and tag clouds.
permalink: /2025/02/03/replacing-wordpress-plugins-with-astro-acronyms-meta-tags-tag-clouds/
image: /wp-content/uploads/2025/02/post-2025-02-03-thumbnail.png
categories:
  - Azure
tags:
  - WordPress
  - Astro
  - Migration
  - Static Site
  - Plugins
  - Acronym
  - Meta
  - Tag
  - Cloud
series: WordPress to Astro Migration
---

This post is a continuation of my migration journey from WordPress to Astro.
If you have not read the previous posts, you might want to start with:

- [Why I Switched from WordPress to Astro: Faster, Cheaper, and Greener](/2025/01/20/why-i-switched-from-wordpress-to-astro-faster-cheaper-greener/)
- [Migrating from WordPress to Astro: How I Moved My Blog Content](/2025/02/01/migrating-from-wordpress-to-astro-how-i-moved-my-blog-content/)

In this post, I explain how I replaced 3 WordPress plugin functionalities in Astro.

1. [Acronyms 2](#acronyms-2)
2. [Add Meta Tags](#add-meta-tags)
3. [Better Tag Cloud](#better-tag-cloud)

<!--more-->

## Acronyms 2

The [Acronyms 2][PLUGIN_ACRONYMS_2] plugin allowed me to define a list of acronyms,
and automatically generated tooltips with their meanings when they appeared in posts.

### Astro Implementation

In Astro, I created a rehype plugin that processes text and wraps recognized acronyms with an `<abbr>` tag containing the full text of the acronym as the title attribute.

> [!NOTE]
> [rehype][REHYPE] is an ecosystem of plugins that work with HTML as structured data,
> specifically ASTs.  
> This allows for easy manipulation, or extension, of HTML content.

The first time an abbreviation is encountered on a page, the plugin will also wrap the `<abbr>` tag with an `<dfn>` tag. This semantic tag is used to indicate the defining instance of a term.

A special case is when an acronym is used in a `<code>` or `<pre>` block. In this case, the plugin will not wrap the acronym with an `<abbr>` tag.

```ts title="src/plugins/rehypeAbbreviate.js" showlinenumbers startlinenumber="23"
if (current.tagName === "code" || current.tagName === "pre") {
  return; // Skip this node
}
```

See the full code on GitHub: [rehypeAbbreviate.js][REHYPE_ABBREVIATE_JS].

Because there is no database to store the acronyms,
I defined them in a YAML file and imported them into the plugin.

```yaml title="src/config/acronyms.yaml"
ACRONYMS:
  AST: Abstract Syntax Tree
  HTML: HyperText Markup Language
```

The YAML file is loaded in the `astro.config.mjs` file and passed to the rehypeAbbreviate plugin.

```ts title="astro.config.mjs"
import { defineConfig } from "astro/config";
import yaml from "@rollup/plugin-yaml";
import yamlParser from "yaml";
import { readFileSync } from "fs";
import rehypeAbbreviate from "./src/plugins/rehypeAbbreviate.js";

export default defineConfig({
  markdown: {
    rehypePlugins: [
      [
        rehypeAbbreviate,
        {
          acronyms: yamlParser.parse(
            readFileSync("./src/config/acronyms.yaml", "utf8"),
          ).ACRONYMS,
        },
      ],
    ],
  },
  vite: {
    plugins: [yaml()],
  },
});
```

I expect that loading the acronyms from a YAML file could be improved, but for now, it works well enough.

## Add Meta Tags

The [Add Meta Tags][PLUGIN_ADD_META_TAGS] plugin generated metadata for search engines and social media previews.

### Astro Implementation

Most of the metadata is defined in the `BaseHead.astro` file, which is included in one of the layout files that pass on contextual values.

```astro title="src/layouts/BaseHead.astro" showlinenumbers startlinenumber="41"
<meta property="og:url" content={Astro.url}>
<meta property="og:title" content={title}>
<meta property="og:description" content={description}>
```

Some properties are conditionally included based on availability. For example, the `article` object is passed to the layout when rendering a blog post.

Sections and tags can even occur multiple times, so I use the Array [`map` function][MDN_ARRAY_MAP] to generate multiple `<meta>` tags.

```astro title="src/layouts/BaseHead.astro" showlinenumbers startlinenumber="45"
{article && (
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content={article.published} />
  <meta property="article:modified_time" content={article.modified} />
)}
{article && article.sections && article.sections.map((section) =>
  <meta property="article:section" content={section}>
)}
{article && article.tags && article.tags.map((tag) =>
  <meta property="article:tag" content={tag}>
)}
```

View the full code on GitHub: [BaseHead.astro][BASEHEAD_ASTRO].

## Better Tag Cloud

The [Better Tag Cloud plugin][PLUGIN_NKTAGCLOUD] displayed a tag cloud where tags were weighted based on post frequency.

### Astro Implementation

I used the PHP code from the plugin as a reference and, with some help from [ChatGPT][CHATGPT],
created a function that:

1. Gets a map of tags and their posts.

   ```js title="src/js/util.js" showlinenumbers startlinenumber="19"
   export function getTagsWithPosts(paths) {
     const posts = sortedPosts(paths);
     const tagsMap = new Map();

     posts.forEach((post) => {
       post.data.tags?.forEach((tag) => {
         if (!tagsMap.has(tag)) {
           tagsMap.set(tag, []);
         }
         tagsMap.get(tag).push(post);
       });
     });

     return tagsMap;
   }
   ```

2. Sorts the tags by post count.
3. Get the top 50 tags.
4. Sort the tags alphabetically.
5. Calculate the weight of each tag based on the post count. Using `8pt` as the smallest font size and `22pt` as the largest font size.

   ```ts title="src/components/Sidebar.astro" showlinenumbers startlinenumber="35"
   return tagArray
     .sort(([tagA], [tagB]) => tagA.localeCompare(tagB))
     .map(([tag, tagPosts]) => ({
       tag,
       count: tagPosts.length,
       fontSize: calculateFontSize(tagPosts.length),
     }));
   ```

6. Render the tags in the sidebar.

   ```astro title="src/components/Sidebar.astro" showlinenumbers startlinenumber="56"
   <aside id="tag-cloud">
     <h2>Tags</h2>
     <div>
       {
         tags.map(tagItem =>
           <a
             href={`/tag/${urlifyToken(tagItem.tag)}/`}
             title={`${tagItem.count} posts tagged with "${tagItem.tag}"`}
             rel="tag"
             style={`font-size: ${tagItem.fontSize}pt;`}>{tagItem.tag}</a>
         )
       }
     </div>
   </aside>
   ```

The full code can be found on GitHub: [Sidebar.astro][SIDEBAR_ASTRO] and [util.js][UTIL_JS].

---

These are the first 3 plugins I replaced with Astro functionality.

In the next post, I will cover more plugins, including syntax highlighting, paging, and more.

[BASEHEAD_ASTRO]: https://github.com/eNeRGy164/blog/blob/47b54e33ce1c1f2adb981c9e975f6517b0d5f883/src/components/BaseHead.astro
[CHATGPT]: https://chatgpt.com/
[MDN_ARRAY_MAP]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
[PLUGIN_ACRONYMS_2]: https://wordpress.org/plugins/acronyms-2/
[PLUGIN_ADD_META_TAGS]: https://www.g-loaded.eu/2006/01/05/add-meta-tags-wordpress-plugin/
[PLUGIN_NKTAGCLOUD]: https://kuttler.eu/en/wordpress-plugin/nktagcloud/
[REHYPE]: https://github.com/rehypejs/rehype
[REHYPE_ABBREVIATE_JS]: https://github.com/eNeRGy164/blog/blob/8b0bb2f710aff6c968cb61bf550767f2d7527b70/src/plugins/rehypeAbbreviate.js
[SIDEBAR_ASTRO]: https://github.com/eNeRGy164/blog/blob/2a3e9bb28fef2dbdec8fd2fe644bffc239838c62/src/components/Sidebar.astro
[UTIL_JS]: https://github.com/eNeRGy164/blog/blob/a118d7e27d30a6c233dfeaf65e3949bc6ce2aa26/src/js/util.js

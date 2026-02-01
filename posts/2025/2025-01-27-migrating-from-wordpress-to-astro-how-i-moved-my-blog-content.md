---
id: 2121
title: "Migrating from WordPress to Astro: How I Moved My Blog Content"
date: 2025-01-27T22:30:00+01:00
updated: 2025-01-27T22:30:00+01:00
author: Michaël Hompus
excerpt: >
  After 15 years of blogging with WordPress, I decided to take the plunge and migrate my blog to Astro.
  This post outlines how I moved my content, step by step, and the tools I used to make the transition.
permalink: /2025/01/27/migrating-from-wordpress-to-astro-how-i-moved-my-blog-content/
image: /wp-content/uploads/2025/01/post-2025-01-27-thumbnail.png
categories:
  - Azure
tags:
  - WordPress
  - Astro
  - Migration
  - Static Sites
series: WordPress to Astro Migration
---

After 15 years of blogging with WordPress, I decided to take the plunge and migrate my blog to Astro.

This post outlines how I moved my content, step by step, and the tools I used to make the transition.

This is a follow-up to my previous post: [Why I Switched from WordPress to Astro: Faster, Cheaper, and Greener](/2025/01/20/why-i-switched-from-wordpress-to-astro-faster-cheaper-greener/).

<!--more-->

## The Starting Point

As mentioned in my previous post, social reasons pushed me away from WordPress.
However, even before these revelations, I was exploring alternatives.
I liked WordPress' editor and ease of use but found it frustrating to keep a virtual machine running 24/7 for a blog that was not updated regularly.

Initially, I considered an arrangement where the site could generate static content whenever updates occurred and shut down the VM otherwise.
When some enthusiastic colleagues at [Info Support](https://www.infosupport.com/en/) introduced me to Astro, I realized it could be the perfect opportunity to rethink my blog entirely.

At Info Support, a team had recently rebuilt the [Knowledge Center website](https://training.infosupport.com/en) with Astro, and their success inspired me to give it a try.

## Why Not Use WordPress with Astro?

Astro does offer the option to render WordPress content using the WordPress API, but that solution still requires a running backend.
This did not fit my use case, and the plugin security issues caused by Matt Mullenweg's actions made the choice clear: I had to move away from WordPress entirely.

This realization motivated me to dive deeper and fully convert my blog to Markdown as the storage format.
I found a helpful guide ([How to Convert a WordPress blog to an Astro Static Site](https://blog.okturtles.org/2024/10/convert-wordpress-to-static-site/)) and repository ([okTurtles' wordpress-to-astro](https://github.com/okTurtles/wordpress-to-astro)) to kickstart my migration.

## Steps to Migrate

### 1. Downloading the Site

I used the following `wget` command to download my entire site:

```shell title="wget"
wget -m -k -p -E https://blog.hompus.nl -D static.hompus.nl,blog.hompus.nl -H
```

> [!NOTE]
> `wget` is a tool to download website content.
> In this command, the `-m` flag enables mirroring,
> `-k` converts links for local viewing,
> `-p` downloads necessary files,
> `-E` ensures proper file extensions,
> `-D` defines a list of domains allowed to be followed,
> and `-H` enables the spanning of hosts when downloading contents.

This approach was not perfect, but it got the job done and gave me a local copy of my site to work with.

### 2. Exporting Comments

Since comments have been disabled on my blog for a long time,
I did not bother exporting them. This simplified the migration process significantly.

### 3. Exporting Posts

To export my posts, I used the [Jekyll Exporter plugin](https://wordpress.org/plugins/jekyll-exporter/).
While the output was not perfect, it provided a solid starting point for importing my posts into Astro.

### 4. Starting with the `wordpress-to-astro` Project

I cloned the [wordpress-to-astro](https://github.com/okTurtles/wordpress-to-astro) project as a base for my new blog.
This gave me a working Astro setup with my WordPress content preloaded.

## Customizing the Blog

Once I had a basic version of the blog running, I completely overhauled the layouts, styles, and structure to fit my preferences.
Although I maintained the look and feel of my original blog, I took this opportunity to modernize the technology stack.

My old blog was still built in valid XHTML 1.1. Updating to HTML5 and CSS3 allowed me to use modern web practices and improve accessibility.

## Looking Ahead

In a future post, I'll dive into the code behind my Astro blog and share more about the specific components and customizations I implemented.
If you can't wait, you can explore the source code of my blog on GitHub: https://github.com/eNeRGy164/blog.

For now, I'm thrilled with the results. The migration process taught me a lot, and the end result is a faster, greener, and more cost-effective blog that meets my needs perfectly.

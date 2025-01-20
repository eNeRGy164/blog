---
id: 2120
title: "Why I Switched from WordPress to Astro: Faster, Cheaper, and Greener" 
date: 2025-01-20T22:31:00+01:00
updated: 2025-01-20T22:31:00+01:00
author: Michaël Hompus
excerpt: >
  For years, WordPress was my go-to platform for blogging,
  but it was time for a change—one that aligns better with my values, both environmentally and financially.

  In this post, I share the reasons behind my decision to move to an Astro app deployed on Azure Static Web Apps.
permalink: /2025/01/20/why-i-switched-from-wordpress-to-astro-faster-cheaper-greener/
image: /wp-content/uploads/2025/01/post-2025-01-20-thumbnail.png
categories:
  - Azure
tags:
  - WordPress
  - Azure
  - Astro
  - Sustainability
  - Costs
---

For years, WordPress was my go-to platform for blogging,
but it was time for a change—one that aligns better with my values, both environmentally and financially.

While WordPress has been a fantastic tool for blogging, offering countless features and an active community,
I recently decided it was time to move on.

My blog now runs as a static web app built with [Astro](https://astro.build/) and published on [Azure Static Web Apps](https://azure.microsoft.com/products/app-service/static/).

Why make this change? Let me explain.

<!--more-->

## Social Reasons to Move Away from WordPress

It's been [15 years](/2010/01/06/blog-now-running-on-wordpress/) since I switched my blog to WordPress.
Over the years, WordPress has evolved significantly,
introducing features like [the Gutenberg editor](https://wordpress.org/gutenberg/) and seamless automatic updates for both the core system and plugins.
These updates made managing my blog easier, until I realized they also introduce new risks these days.

Matt Mullenweg, the co-founder of WordPress, is undermining the ecosystem with his actions ([The Register: WordPress saga escalates as WP Engine plugin forcibly forked and legal letters fly](https://www.theregister.com/2024/10/14/wordpress_forks_wpengine_plugin/)).
Automatic updates, while convenient, mean that at any time, the code running on my server could be altered.
This is no longer acceptable for me.

I've always appreciated the WordPress community, particularly people like [Joost de Valk](https://joost.blog/), who have contributed so much to its ecosystem.
I've had the pleasure of meeting Joost, and lots of his colleagues, at Yoast-hosted events and enjoyed presenting at [WordCamp Nijmegen in 2018](2018/09/03/wordcamp-nijmegen-2018-sharing-my-slides/).

However, Matt's recent behavior, including his attacks on Joost and others in the community ([The Register: WordPress drama latest: Leader Matt Mullenweg exiles five contributors](https://www.theregister.com/2025/01/14/wordpress_leader_matthew_mullenweg_exiles/)), reinforced my decision to move away from WordPress.

While these community concerns are troubling, they weren't my only motivation for leaving WordPress behind.

## Environmental Reasons to Move Away from WordPress

Running a WordPress blog requires a server and database running 24/7.
Even when I didn't write a blog post for months, the server has to remain operational.
Beyond the VM itself, resources like storage, virtual networks, and backup services also ran continuously.

Over the course of a year, this setup consumes significant energy. Let's calculate:

- Estimated average power usage of a "Standard B2ls v2" VM: `50W`
- Annual power consumption: `50W × 24hours/day × 365days/year = 438kWh/year`
- Equivalent carbon emissions: `438kWh/year × 0,475kg CO₂/kWh = 208,05kg CO₂/year`  
  <small>(0.475kg CO₂/kWh is an average for The Netherlands)</small>

These figures underscore how running a VM 24/7 contributes to both higher energy consumption and a larger carbon footprint.

By switching to a static web app, I've significantly reduced my website's energy consumption and environmental impact.

With Astro, the only compute power used is during content generation when I update the blog.
The static web apps serves the pre-generated content, meaning no server resources are wasted on idle time—an efficient alternative to 24/7 VM hosting.

## Financial Reasons to Move Away from WordPress

Yes, WordPress itself is free, but Azure resources are not.

Hosting a WordPress site requires an always-on VM, storage, networking, and backups, which quickly add up in cost.

Here's a breakdown of my Azure expenses for the WordPress setup:

- VM cost: `€28,91/month`
- Storage and networking: `€11,21/month`
- Total annual cost: `€481,44/year`

By switching to Azure Static Web Apps, I eliminated these recurring costs.
Static web hosting is not only greener but also significantly cheaper.
Actually, I run on the Free tier! (Hey, I'm Dutch after all!)

The Free tier includes SSL certificates and custom domains at no cost,
perfect for hosting a personal blog.

Another cost-saving bonus: With WordPress, I used [WP Rocket](https://wp-rocket.me/) for optimization, which cost me approximately €59 per year.
WP Rocket handled minification, gzip compression, and caching.
Now, Azure Static Web Apps provide gzip and Brotli compression out of the box,
while Astro automatically minifies output. No additional plugins are required.

And the results? [My Google Lighthouse score](https://pagespeed.web.dev/analysis/https-blog-hompus-nl/v9gef3h9qp?form_factor=mobile) is now 4 × 100!
(As long as I avoid YouTube embeds, because even Google doesn't follow its own guidelines. Go figure.)

## What Did the Move Cost Me?

Astro was new to me, so building an Astro blog that matched my old site took some time and effort.
Not everything is available out of the box, but the flexibility was worth it.

I write this blogpost on my laptop, using [Visual Studio Code](https://code.visualstudio.com/) and can run the whole blog in seconds by just executing `npx astro dev`.

I'll dive into the details of my Astro setup, web components,
and WordPress plugin replacements in a future blog post.

For now, I'm thrilled with the move.
My blog is faster, cheaper, greener, and no longer reliant on WordPress updates.
If you're considering a similar switch, I'd love to hear about your experience!

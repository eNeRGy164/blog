---
id: 1128
title: "PowerShell script: ConvertFrom-SiteMap"
date: 2017-02-11T23:46:48+01:00
updated: 2020-12-06T23:12:26+01:00
author: Michaël Hompus
excerpt: >
  The other day I needed to get the URLs for all pages in my blog for some PowerShell scripting I wanted to do.
  Like most websites, this blog has a sitemap and I wanted to use that as a source.

  As I couldn’t find any existing PowerShell scripts on the web that I could use, I just wrote one myself.

  Now I like to share this script with you.
permalink: /2017/02/11/powershell-script-convertfrom-sitemap/
image: /wp-content/uploads/2017/02/post-2017-02-11-thumbnail.png
categories:
  - PowerShell
tags:
  - cmdlet
  - PowerShell
  - sitemap
thumbnail:
  title: "PowerShell: ConvertFrom-SiteMap"
  subtitle: >
    A PowerShell cmdlet that parses XML sitemaps and extracts page URLs for scripting.
---

The other day I needed to get the URLs for all pages in my blog for some PowerShell scripting I wanted to do
Like most websites, this blog has a [sitemap](/sitemap-0.xml) and I wanted to use that as a source.

As I could not find any existing PowerShell scripts on the web that I could use, I just wrote one myself.

Now I like to share this script with you.

<!--more-->

At the end of the article, you will find the link to the [source code](#source-code).

## Basic usage

Just execute the script with an URL to an XML Sitemap.

```powershell title="PowerShell"
.\ConvertFrom-SiteMap.ps1 -Url https://blog.hompus.nl/sitemap-0.xml
```

Which results in something like this:

```plain
loc        : /
lastmod    : 2017-02-10T23:57:52+00:00
changefreq : daily
priority   : 1.0

loc        : /category/azure/
lastmod    : 2017-02-08T17:43:41+00:00
changefreq : weekly
priority   : 0.3

loc        : /category/csharp/
lastmod    : 2016-12-14T08:53:46+00:00
changefreq : weekly
priority   : 0.3
```

<small>Displaying only the first 3 entries</small>

> [!NOTE]
> Under the section [XML tag definitions](https://www.sitemaps.org/protocol.html#xmlTagDefinitions)
> the protocol states that the `lastmod`, `changefreq` and `priority` attributes are optional,
> so they can be missing in the sitemap.

Now you can do basic PowerShell manipulation of the result set like sorting, selecting, filtering and formatting.

For example:

```powershell title="PowerShell"
.\ConvertFrom-SiteMap.ps1 -Url /sitemap-0.xml
        | Sort-Object priority -Descending
        | Select-Object priority, changefreq, loc -First 5
        | Where-Object { $_.priority -ge 0.3 }
        | Format-Table
```

Outputs:

```plain
priority changefreq loc
-------- ---------- ----
1.0      daily      /
0.6      weekly     /about/
0.6      weekly     /archives/
0.3      weekly     /category/windows/
0.3      weekly     /category/visual-studio/
```

## Ignoring Sitemap Index entries

A sitemap can also be a [Sitemap Index File](https://www.sitemaps.org/protocol.html#index).
The file then contains links to other sitemap files.

By default, the script will follow these links.
If you don't want this to happen you can set the `NoFollow` switch.

```powershell title="PowerShell"
.\ConvertFrom-SiteMap.ps1 -Url https://blog.hompus.nl/sitemap-0.xml -NoFollow
```

## Source code

The complete source code is available as a
[GitHub Gist](https://gist.github.com/eNeRGy164/a644417b737eb5d3af3c80d4ceb527e1).

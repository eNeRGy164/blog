---
id: 218
title: Translating URLs using Alternate Access Mappings from code
date: 2011-02-23T17:48:22+01:00
updated: 2020-12-06T17:44:48+01:00
author: Michaël Hompus
excerpt: >
  With SharePoint it's easy to configure multiple zones for your SharePoint Web Application.
  For example you have a Publishing Web Site with two zones.

  After the content is published it'll also be available on the anonymous site and most of
  the URLs will be automatically translated to corresponding zone URL.

  There are however some places this is not the case.
layout: ../layouts/BlogPost.astro
permalink: /2011/02/23/translating-urls-using-the-alternate-access-mappings/
image: /wp-content/uploads/2011/02/post-218-thumnail-1.png
categories:
  - SharePoint
tags:
  - Alternate Access Mapping
  - Anonymous
  - SharePoint 2007
  - SharePoint 2010
  - URI
  - WSS 3.0
---

With SharePoint it is easy to configure multiple zones for your SharePoint Web Application.
For example, you have a Publishing Web Site with two zones.

1. The authenticated CMS where editors can manage content: `https://cms.int`
2. The anonymous website where everybody can view the content: `http://www.ext`

When the editors link to sites, pages, documents and images the URL will start with `https://cms.int`.
After the content is published it'll also be available on the anonymous site.
Now most of the URLs will be automatically translated to corresponding zone URL and start with `http://www.ext`.

However, there are some places where this is not the case. You could try to use relative URLs but even that will not fix every scenario.

## Translate the URL using code

Facing this issue, I had to translate the URLs myself.
But I want to write minimal code. Luckily, Microsoft has done most of the work for me.

On the [`SPFarm` class](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms429183(v=office.15)>) you will find the
[`AlternateUrlCollections` property](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms411962(v=office.15)>).
This "collection" is actually an instance of the
[`SPAlternateUrlCollectionManager` class](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms428661(v=office.15)>)
and provides the [`RebaseUriWithAlternateUri` method](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms467849(v=office.15)>).

And this is where the magic happens.

This method has an overload where you supply a `Uri` and a `SPUrlZone`.
You can provide one of the values of the [`SPUrlZone` enumeration](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms474875(v=office.15)>)
or you can provide the current zone.

To get your current zone you can use the static
[`Lookup` method](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms480335(v=office.15)>)
of the [`SPAlternateUrl` class](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms464482(v=office.15)>).
This method requires a Uri so we provide the current one using the
[`ContextUri` property](<https://learn.microsoft.com/previous-versions/office/sharepoint-server/ms476291(v=office.15)>) from the same class.

To wrap it all up I give you the code:

```csharp
var originalUri = new Uri("https://cms.int/pages/default.aspx");

var zone = SPAlternateUrl.Lookup(SPAlternateUrl.ContextUri).UrlZone;

var translateUri = SPFarm.Local.AlternateUrlCollections
                               .RebaseUriWithAlternateUri(originalUri, zone);

// When accessing from the authenticated zone
// translateUri == "https://cms.int/pages/default.aspx"

// When accessing from the anonymous zone
// translateUri == http://www.ext/pages/default.aspx
```

## "Other" URLs

If you pass a URL which is not listed as an Alternate Access Mapping the method will return the original URL.

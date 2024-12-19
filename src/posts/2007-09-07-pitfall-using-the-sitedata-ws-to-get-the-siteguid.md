---
id: 10
title: "Pitfall: Using the SiteData Web Service to get the Site GUID"
date: 2007-09-07T16:50:00+02:00
updated: 2020-12-02T22:35:30+01:00
author: Michaël Hompus
excerpt: >
  When you want to use the PSI interface you need to have a PSContextInfo Class. Inside a Project Server Event this will be provided so you don’t need to worry about it’s contents. But outside the Event you will need to create one from scratch.
  One of the properties you need is the Site GUID. According to the SDK you can get this value in your code using three different methods.
  I use the third option in my application, but it returned the wrong GUID. After some debugging I finally found the problem.
layout: ../layouts/BlogPost.astro
permalink: /2007/09/07/pitfall-using-the-sitedata-ws-to-get-the-siteguid/
image: /wp-content/uploads/2007/09/post-10-thumnail-1.png
categories:
  - Project Server
tags:
  - Project Server 2007
  - PSI
  - PWA
  - WSS 3.0
---

When you want to use the PSI interface you need to have a [`PSContextInfo` class](https://learn.microsoft.com/previous-versions/office/developer/office-2007/ms482944(v=office.12)).
Inside a Project Server Event this will be provided automatically, so you don't need to worry about its contents (except when you want to impersonate as a different user).
But outside the Event you will need to create one from scratch.

One of the properties you need is the Site GUID.
According to the SDK you can get this value in your code using three different methods:

1. Hard-code the GUID _(Not very flexible)_
2. Use the Windows SharePoint Services `SPSite.ID` property in the Windows SharePoint Services _(Very heavy on resources)_
3. Call the SiteData Web Service with the PWA URL _(The best solution, if you ask me)_

I use the third option in my application, but it did return an incorrect GUID.
After some debugging, I finally found the problem.
I requested the URL `http://localhost/PWA/` and that was a mistake.
The trailing `/` results in getting the GUID of the root site, not the PWA site!

I am sure that I am not the first one falling in this pitfall, so this article is to prevent you from doing the same.

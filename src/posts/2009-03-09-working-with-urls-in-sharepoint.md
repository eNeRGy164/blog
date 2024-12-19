---
id: 16
title: Working with URL’s in SharePoint
date: 2009-03-09T19:58:04+01:00
updated: 2020-12-02T22:52:37+01:00
author: Michaël Hompus
excerpt: >
  While working on a project with some existing code I noticed the developer did write large portions of code to get from an URL to a SPList. He probably didn’t know some of the hidden gems in SharePoint.
layout: ../layouts/BlogPost.astro
permalink: /2009/03/09/working-with-urls-in-sharepoint/
image: /wp-content/uploads/2009/03/post-16-thumnail-1.png
categories:
  - C#
  - SharePoint
tags:
  - SharePoint 2007
  - SPUrlUtility
  - SPUtility
  - URI
---

While working on a project with some existing code I noticed the developer did write large portions of code to get from an URL to a [SPList](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint2003/dd587308(v=office.11)).
He probably didn't know some of the hidden gems in SharePoint.

<!--more-->

### Get the full URL

Sometimes you need the full URL and only have the relative one.
For example, when opening a new [`SPSite`](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint2003/dd587403(v=office.11)) or when writing code in a [`SPNavigationProvider`](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint-services/ms470908(v=office.12)).
For this you could use the [`SPUtility` class](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint2003/dd587669(v=office.11)):

```csharp
SPUtility.GetFullUrl(SPSite Site, string WebUrl)
```

For example:

```csharp
string webUrl = "/sub/default.aspx";
SPUtility.GetFullUrl(SPContext.Current.Site, webUrl);
// "http://localhost/sub/default.aspx"
```

There is one catch:

```csharp
string webUrl = "http://localhost/sub/default.aspx";
SPUtility.GetFullUrl(SPContext.Current.Site, webUrl);
// "http://localhosthttp://localhost/sub/default.aspx"
```

### Check the type of URL

The former example is nice, but you would still need to write code to check if the input already contains the full URL. Nope!

For this, two gems are found in the [`SPUrlUtility` class](https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint-services/ms461295(v=office.12)).

```csharp
SPUrlUtility.IsUrlRelative(string url);
SPUrlUtility.IsUrFull(string url);
```

These methods do exactly what their names imply: check if the URL is relative or full. So, for example:

```csharp
string fullUrl = "http://localhost/sub/default.aspx";
string relUrl = "/sub/default.aspx";
SPUrlUtility.IsUrlRelative(fullUrl); // false
SPUrlUtility.IsUrlRelative(relUrl);  // true
SPUrlUtility.IsUrlFull(fullUrl);     // true
SPUrlUtility.IsUrlFull(relUrl);      // false
```

Great! Now we can combine the two:

```csharp
if (string.IsNullOrEmpty(webUrl) || SPUrlUtility.IsUrlRelative(webUrl))
{
    webUrl = SPUtility.GetFullUrl(SPContext.Current.Site, webUrl);
}
```

Now `webUrl` will always be the full URL.

### URL concatenation

Ever did `web.ServerRelativeUrl + "/something"` and found out it did work nicely except it start doing something really weird on your root web?
On the `rootweb` the relative URL is `/`, and this results in the URL `//something` which on its own turn gets translated to `http://something`, and that URL doesn't exist (most of the time).

When working with file system locations, you should always use `Path.Combine()` instead of concatenating path's yourself.
But there is no `Uri.Combine().`

You could write an extension method. But the SharePoint team made it easier.

```csharp
SPUrlUtility.CombineUrl(string baseUrlPath, string additionalNodes)
```

This method does the same thing like `Path.Combine()`. For example:

```csharp
string root = "/";
string path = "/sub"
string doc = "/sub/default.aspx";
SPUrlUtility.CombineUrl(root, path); // "/sub"
SPUrlUtility.CombineUrl(root, doc);  // "/sub/default.aspx"
SPUrlUtility.CombineUrl(path, doc);  // "/sub/sub/default.aspx"
```

That's the final (hidden) gem for today.

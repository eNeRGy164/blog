---
id: 230
title: Make your browser cache the output of an HttpHandler
date: 2011-03-11T14:30:36+01:00
modified: 2021-07-16T23:00:34+02:00
author: Michaël Hompus
excerpt: >
  Recently I worked on an HttpHandler implementation that is serving images from a backend system.
  Although everything seemed to work as expected it was discovered images were requested by the browser on every page refresh instead of caching the browser them locally.
  Together with my colleague Bert-Jan I investigated and solved the problem which will be explained in this post.
permalink: /2011/03/11/make-your-browser-cache-the-output-of-an-httphandler/
image: /wp-content/uploads/2011/03/post-2011-03-11-thumbnail.png
categories:
  - C#
tags:
  - "200"
  - "304"
  - Cache
  - HTTP
  - HttpHandler
  - If-Modified-Since
  - Last-Modified
---

Recently I worked on an [`HttpHandler` implementation](https://learn.microsoft.com/dotnet/api/system.web.ihttphandler?view=netframework-4.0) that is serving images from a backend system.
Although everything seemed to work as expected it was discovered images were requested by the browser on every page refresh instead of the browser caching them locally.

Together with [Bert-Jan](https://www.linkedin.com/in/bruuteuzius/),
I investigated and solved the problem which will be explained in this article.

<!--more-->

## The problem

Let’s start with the original (simplified) code. This code gets the image from the backend system (in this case Content Management Server 2002) and serves it to the browser, or in case the resource is not available it will return "[404 Not Found](https://en.wikipedia.org/wiki/HTTP_404)".

```csharp
public class ResourceHandler : IHttpHandler
{
  public void ProcessRequest(HttpContext context)
  {
    context.Response.Cache.SetCacheability(HttpCacheability.Public);
    context.Response.Cache.SetMaxAge(new TimeSpan(1, 0, 0));

    string imagePath = "some path";

    Resource resource = CmsHttpContext.Current.RootResourceGallery
                                    .GetByRelativePath(imagePath) as Resource;

    if (resource == null)
    {
      // Resource not found
      context.Response.StatusCode = 404;
      return;
    }

    using (Stream stream = resource.OpenReadStream())
    {
      byte[] buffer = new byte[32];
      while (stream.Read(buffer, 0, 32) &amp;gt; 0)
      {
        context.Response.BinaryWrite(buffer);
      }
    }
  }

  public bool IsReusable
  {
    get { return true; }
  }
}
```

Every time the browser requested a resource it responded with the following headers and included the full image.

```http
HTTP/1.1 200 OK
Cache-Control: public
Content-Length: 3488
Content-Type: image/gif
Server: Microsoft-IIS/6.0
X-AspNet-Version: 2.0.50727
COMMERCE-SERVER-SOFTWARE: Microsoft Commerce Server, Enterprise Edition
X-Powered-By: ASP.NET
Date: Fri, 11 Mar 2011 10:51:08 GMT

GIF89a... (the raw image)
```

## The cause

For some reason, the local browser cache was omitted.
We fired up [Fiddler](https://www.telerik.com/fiddler) and started comparing the headers to another source where an image was getting cached locally.

On the first request we discovered an additional header `Last Modified`:

```http
Last-Modified: Tue, 05 Jun 2007 15:19:48 GMT
```

The second response we got to the same image resulted not in a `200 OK` but a `304 Not Modified` message.

```http
HTTP/1.1 304 Not Modified
Connection: close
Date: Fri, 11 Mar 2011 12:21:55 GMT
Server: Microsoft-IIS/6.0
X-Powered-By: ASP.NET
X-AspNet-Version: 2.0.50727
Cache-Control: public
Last-Modified: Tue, 05 Jun 2007 15:19:48 GMT
```

## The solution

So, the first thing missing was the `Last Modified` entry in our first response.
We added code to include this property.

```csharp
context.Response.Cache.SetLastModified(resource.LastModifiedDate);
```

By adding the `Last Modified` date, the browser added a new entry to the second request of the image:

```http
If-Modified-Since: Tue, 05 Jun 2007 15:19:48 GMT
```

But the response was still the same <samp>200 OK</samp> with the complete image.
As it turned out you need to handle the `If-Modified-Since` yourself.
We added the following code to handle this.

```csharp
string rawIfModifiedSince
    = context.Request.Headers.Get("If-Modified-Since");

if (string.IsNullOrEmpty(rawIfModifiedSince))
{
  // Set Last Modified time
  context.Response.Cache.SetLastModified(res.LastModifiedDate);
}
else
{
  DateTime ifModifiedSince = DateTime.Parse(rawIfModifiedSince);

  if (resource.LastModifiedDate == ifModifiedSince)
  {
    // The requested file has not changed
    context.Response.StatusCode = 304;
    return;
  }
}
```

After testing this again the image was still transmitted every time it was requested.
A quick debug of the date compare revealed that the HTTP request date time does not contain milliseconds.
The following fix was applied.

```csharp
if (resource.LastModifiedDate.AddMilliseconds(
                  -resource.LastModifiedDate.Millisecond) == ifModifiedSince)
```

Now every following request returned a <samp>304 Not Modified</samp> and saves us a lot of traffic and loading time!

## Summary

To conclude this article, I give you the complete code:

```csharp
using System;

public class ResourceHandler : IHttpHandler
{
  public void ProcessRequest(HttpContext context)
  {
    context.Response.Cache.SetCacheability(HttpCacheability.Public);
    context.Response.Cache.SetMaxAge(new TimeSpan(1, 0, 0));

    string imageName = "some path"

    Resource resource = CmsHttpContext.Current.RootResourceGallery
                                  .GetByRelativePath(imageName) as Resource;

    if (resource == null)
    {
      // Resource not found
      context.Response.StatusCode = 404;
      return;
    }

    string rawIfModifiedSince =
        context.Request.Headers.Get("If-Modified-Since");
    if (string.IsNullOrEmpty(rawIfModifiedSince))
    {
      // Set Last Modified time
      context.Response.Cache.SetLastModified(resource.LastModifiedDate);
    }
    else
    {
      DateTime ifModifiedSince = DateTime.Parse(rawIfModifiedSince);

      // HTTP does not provide milliseconds, so remove it from the comparison
      if (resource.LastModifiedDate.AddMilliseconds(
                  -resource.LastModifiedDate.Millisecond) == ifModifiedSince)
      {
          // The requested file has not changed
          context.Response.StatusCode = 304;
          return;
      }
    }

    using (Stream stream = resource.OpenReadStream())
    {
      byte[] buffer = new byte[32];
      while (stream.Read(buffer, 0, 32) &amp;gt; 0)
      {
          context.Response.BinaryWrite(buffer);
      }
    }
  }

  public bool IsReusable
  {
    get { return true; }
  }
}
```

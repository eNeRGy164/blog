---
id: 98
title: Calling a SharePoint Web Service from Silverlight over HTTP and HTTPS
date: 2010-01-27T11:52:58+01:00
upodated: 2020-12-03T23:02:39+01:00
author: Michaël Hompus
excerpt: >
  The past couple of weeks I'm working with Silverlight controls embedded in SharePoint 2007.
  For one of the controls I need to retrieve the data using the Search Query Web Service.
  This was working perfectly in the development environment. But when deploying the control to the production environment it didn't work.
layout: ../layouts/BlogPost.astro
permalink: /2010/01/27/calling-a-sharepoint-web-service-from-silverlight-over-http-and-https/
image: /wp-content/uploads/2010/01/post-98-thumnail-1.png
categories:
  - C#
  - SharePoint
tags:
  - BasicHttpBinding
  - HTTP
  - HTTPS
  - Query
  - Search
  - SharePoint 2007
  - Silverlight
  - WCF
  - Web Service
---

The past couple of weeks I am working with Silverlight controls embedded in SharePoint 2007.  
For one of the controls, I need to retrieve the data using the [Search Query Web Service][SEARCH_QUERY_WEB_SERVICE].

This was working perfectly in the development environment.
But when deploying the control to the production environment it did not work.

<!--more-->

I was using the following code:

```csharp
private void Page_Loaded(object sender, RoutedEventArgs e)
{
  var endpoint = new EndpointAddress(GetParam("SharePointWeb") + "/_vti_bin/search.asmx");
  var binding = new BasicHttpBinding(BasicHttpSecurityMode.None)
                {
                    Name = "QueryServiceSoap",
                    MaxReceivedMessageSize = 2147483647,
                    MaxBufferSize = 2147483647
                };

  var client = new QueryServiceSoapClient(binding, endpoint);
  client.QueryExCompleted += this.ClientQueryExCompleted;
  client.QueryExAsync(GetParam("Query"));
}
```

After some digging, I found that the control did actually work,
but only when the page was visited over an HTTP connection.
As visitors were accessing the page over an HTTPS connection,
I was pointed in the direction of the connection between the control and the web service.

As can be seen in the code the WCF client is used and I remembered that the binding security mode is different if you want to work with HTTPS.
So, I changed the [BasicHttpSecurityMode][BASIC_HTTP_SECURITY_MODE] from `None` to `Transport`.

```diff
-var binding = new BasicHttpBinding(BasicHttpSecurityMode.None)
+var binding = new BasicHttpBinding(BasicHttpSecurityMode.Transport)
```

After deploying the control again, it worked nicely over the HTTPS connection,
so I knew what the source of my problem is.
But naturally I want a generic solution so the configuration of the access mapping is not influencing the functioning of the control.

The question is how to detect if the control is hosted on a page over an HTTP or HTTPS connection.
This can be found in the [`SilverlightHost.Source` property][SOURCE_PROPERTY] which can be compared against the
[`Uri.UriSchemeHttp` field][URI_SCHEME_HTTP_FIELD] or the [`Uri.UriSchemeHttps` field][URI_SCHEME_HTTPS_FIELD].

As a result, this is my final code:

```csharp
private void Page_Loaded(object sender, RoutedEventArgs e)
{
  var basicHttpSecurityMode =
      (Application.Current.Host.Source.Scheme == Uri.UriSchemeHttp)
        ? BasicHttpSecurityMode.None
        : BasicHttpSecurityMode.Transport;

  var endPoint = new EndpointAddress(GetParam("SharePointWeb") + "/_vti_bin/search.asmx");
  var binding = new BasicHttpBinding(basicHttpSecurityMode)
                {
                    Name = "QueryServiceSoap",
                    MaxReceivedMessageSize = 2147483647,
                    MaxBufferSize = 2147483647
                };

  var client = new QueryServiceSoapClient(binding, endPoint);
  client.QueryExCompleted += this.ClientQueryExCompleted;
  client.QueryExAsync(GetParam("Query"));
}
```

Works like a charm.

[SEARCH_QUERY_WEB_SERVICE]: https://learn.microsoft.com/previous-versions/office/developer/sharepoint-2007/ms543175(v=office.12)
[BASIC_HTTP_SECURITY_MODE]: https://learn.microsoft.com/previous-versions/windows/silverlight/dotnet-windows-silverlight/ms586334(v=vs.95)
[SOURCE_PROPERTY]: https://learn.microsoft.com/previous-versions/windows/silverlight/dotnet-windows-silverlight/cc190409(v=vs.95)
[URI_SCHEME_HTTP_FIELD]: https://learn.microsoft.com/previous-versions/windows/silverlight/dotnet-windows-silverlight/x3fzefx3(v=vs.95)
[URI_SCHEME_HTTPS_FIELD]: https://learn.microsoft.com/previous-versions/windows/silverlight/dotnet-windows-silverlight/3s8hx381(v=vs.95)

---
id: 140
title: Could not load type IDataServiceUpdateProvider when using REST with SharePoint 2010
date: 2010-03-26T11:00:06+01:00
updated: 2020-12-03T23:45:31+01:00
author: Michaël Hompus
excerpt: >
  I wanted to use the new REST services in SharePoint 2010.

  But when I navigated to the ListData.svc service. I got the following error: “Could not load type 'System.Data.Services.Providers.IDataServiceUpdateProvider' from assembly 'System.Data.Services, Version=3.5.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089'.”
permalink: /2010/03/26/could-not-load-type-idataserviceupdateprovider-when-using-rest-with-sharepoint-2010/
image: /wp-content/uploads/2010/03/post-2010-03-26-thumbnail.png
categories:
  - SharePoint
tags:
  - ADO.NET
  - Atom
  - Data Services
  - OData
  - REST
  - SharePoint 2010
  - Vista
  - WCF
  - Windows 7
  - Windows Server 2008
  - Windows Server 2008R2
thumbnail:
  title: "IDataServiceUpdateProvider Error in SP2010"
  subtitle: >
    Fixing a type loading error when accessing SharePoint 2010 REST services via ListData.svc.
---

I wanted to use the new REST services in SharePoint 2010. But when I navigated to the `ListData.svc` service.
I got the following error:

![Screenshot displaying SharePoint 2010 showing the following error: "Could not load type 'System.Data.Services.Providers.IDataServiceUpdateProvider' from assembly 'System.Data.Services, Version=3.5.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089'."](/wp-content/uploads/2010/03/error-load-type-idataserviceupdateprovider.png)

First, I checked if there was a `System.Data.Services` entry in the GAC (Global Assembly Cache).
There was one with version 3.5.30729.1. So, it was not a missing file.

Searching the web on the error...

> Could not load type 'System.­Data.­Services.­Providers.­IDataServiceUpdateProvider'
> from assembly 'System.­Data.­Services, Version=3.5.0.0, Culture=­neutral, PublicKeyToken=­b77a5c561934e089'

...does not provide many hints to what is causing this error.  
Most sites suggest to install **ADO.NET Data Services v1.5 CTP2**, but I already had.

I finally found the page [REST and SharePoint 2010 Quick Start Guide](https://scottcurrier.wordpress.com/2010/02/20/rest-and-sharepoint-2010-quick-start-guide-table-of-contents/)
by Scott Currier.
He suggests to install the [ADO.NET Data Services Update for .NET 3.5 SP1](https://learn.microsoft.com/archive/blogs/astoriateam/data-services-update-for-net-3-5-sp1-now-available-for-download).
As it turns out, this is _the final release_ of the ADO.NET Services v1.5!

The update comes in two flavors.

## For Windows 7 AND Windows Server 2008 R2

[Download the ADO.NET Data Services Update for .NET Framework 3.5 SP1 for Windows 7 and Windows Server 2008 R2](https://www.microsoft.com/en-us/download/details.aspx?id=2343).

After installing the version of the `System.Data.Services.dll` file is `3.5.30729.5004`.

## For Windows 2000, Windows XP, Windows Vista, Windows Server 2003 AND Windows Server 2008

[Download the ADO.NET Data Services Update for .NET Framework 3.5 SP1 for Windows 2000, Windows Server 2003, Windows XP, Windows Vista and Windows Server 2008](http://www.microsoft.com/download/details.aspx?familyid=21f20103-551e-4501-89b3-e53fcac5cffd).

After installing the version of the `System.Data.Services.dll` file is `3.5.30729.4466`.

## Testing

After I installed the update, I browsed to the `ListData.svc` service.

![Screenshot displaying the service description of a SharePoint 2010 Team Site as an atom feed.](/wp-content/uploads/2010/03/sharepoint-atom-feed.png "The service description of a SharePoint 2010 Team Site as an atom feed.")

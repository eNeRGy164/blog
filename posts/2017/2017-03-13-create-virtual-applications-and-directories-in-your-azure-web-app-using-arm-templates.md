---
id: 1148
title: Create Virtual Applications and Directories in your Azure Web App using ARM templates
date: 2017-03-13T16:17:22+01:00
updated: 2021-07-16T22:43:02+02:00
author: Michaël Hompus
excerpt: >
  When I start on a project that uses Azure resources,
  one of the first things I do is build the infrastructure and automate the deployment using VSTS or TFS.

  In this post I‘ll explain how you can extend Azure Web Apps with Virtual Applications and Virtual Directories using ARM templates.
permalink: /2017/03/13/create-virtual-applications-and-directories-in-your-azure-web-app-using-arm-templates/
image: /wp-content/uploads/2017/03/post-2017-03-13-thumbnail.png
categories:
  - Azure
tags:
  - ARM
  - Azure
  - Template
  - TFS
  - Virtual Application
  - Virtual Directory
  - VSTS
---

When I start on a project that uses Azure resources, one of the first things I do is build the infrastructure and automate the deployment using VSTS or TFS. The definition of the infrastructure is defined using ARM templates.  
When you search online you will find plenty of examples on how to create and use ARM templates. But when you move beyond the basics, you’ll find out the documentation is lacking.

In this post, I’ll explain how you can extend Azure Web Apps with Virtual Applications and Virtual Directories using ARM templates.

<!--more-->

> [!NOTE]
> I will not be covering on reasons why you would want to use Virtual Applications or Directories.
> If you're interested in more background on these, you can read
> [Understanding Sites, Applications, and Virtual Directories on IIS 7](https://learn.microsoft.com/iis/get-started/planning-your-iis-architecture/understanding-sites-applications-and-virtual-directories-on-iis).

At the end of the article, you will find the link to the [source code](#source-code).

## The Web App definition

We start with a basic site template, for brevity I skipped the app service definition.

The `resources` property is an empty collection by default.

```json {7}
{
  "type": "Microsoft.Web/sites",
  "kind": "app",
  "name": "LoremIpsumWebApp",
  "apiVersion": "2015-08-01",
  "location": "[resourceGroup().location]",
  "resources": [],
  "dependsOn": [
    "[resourceId('Microsoft.Web/serverfarms', 'LoremIpsumAppService')]"
  ]
}
```

## Adding the Configuration resource

Configuration of the Web App properties is done with a resource with the type of `Microsoft.Web/sites/config`.

The name of the resource starts with the name of the parent Web App extended with `/web`.

In the property `properties`, you can configure several configuration properties like Virtual Applications,
enabling _Always On_ or disabling _PHP_.

A Web App always contains a root application.

```json {2,7-8,10-14}
{
  "type": "Microsoft.Web/sites/config",
  "name": "LoremIpsumWebApp/web",
  "apiVersion": "2015-08-01",
  "dependsOn": ["[resourceId('Microsoft.Web/sites', 'LoremIpsumWebApp')]"],
  "properties": {
    "phpVersion": "",
    "alwaysOn": "true",
    "virtualApplications": [
      {
        "virtualPath": "/",
        "physicalPath": "site\\wwwroot",
        "virtualDirectories": null
      }
    ]
  }
}
```

We add the new config resource as a child resource to the Web App:

```json {4-9}
{
  "type": "Microsoft.Web/sites",
  …
  "resources": [
    {
      "type": "Microsoft.Web/sites/config",
      …
    }
  ],
  …
}
```

<small>Other properties trimmed for brevity.</small>

## Adding Virtual Applications

We can add a Virtual Application by adding it to the `virtualApplications` array.  
There are two required properties:

- The `virtualPath` is the relative path to the root URL of the website.
- The `physicalPath` is the (relative) path on disk where the files for this application are stored.

```json
{
  "virtualPath": "/DolorSitAmet",
  "physicalPath": "site\\dolor-sit-amet",
  "virtualDirectories": null
}
```

## Adding Virtual Directories

Virtual Directories are always a part of a Virtual Application.

A Virtual Directory has the same two required properties that are needed for a Virtual Application: `virtualPath` and `physicalPath`.

```json
{
  "virtualPath": "/Images",
  "physicalPath": "site\\path-to\\images"
}
```

This object is added to the Virtual Application:

```json
{
  "virtualPath": "/DolorSitAmet",
  "physicalPath": "site\\dolor-sit-amet",
  "virtualDirectories": [
    {
      "virtualPath": "/Images",
      "physicalPath": "site\\path-to\\images"
    }
  ]
}
```

Now you can deploy the ARM template to your Azure Resource Group and then configure a Web Deploy to your brand-new Virtual Application!

## Source code

I have created a GitHub Gist with a full working [deployment template sample](https://gist.github.com/eNeRGy164/0ff063f039088f2cae6219fa6110cbda) for reference.

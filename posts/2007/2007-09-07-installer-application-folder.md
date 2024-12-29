---
id: 11
title: MSI Installer Application Folder from code
date: 2007-09-07T13:35:00+02:00
updated: 2020-12-02T22:30:22+01:00
author: Michaël Hompus
excerpt: >
  To deploy our code, we create MSI installers using Visual Studio.
  One problem I encountered is that there is no property available in code to know where the user has chosen to install the application.
guid: http://hompus.wordpress.com/2007/09/07/installer_application_folder/
permalink: /2007/09/07/installer-application-folder/
image: /wp-content/uploads/2007/09/post-11-thumnail-1.png
categories:
  - C#
  - Visual Studio
tags:
  - Installer
  - MSI
---

To deploy our code, we create MSI installers using [Visual Studio](https://visualstudio.microsoft.com/).
One problem I encountered is that there is no property available in code to know where the user has chosen to install the application.

<!--more-->

After some searching and testing, I now use the following code to get the installation path:

```csharp
// Installer Application Folder
string installPath = Context.Parameters["assemblypath"];
installPath = installPath.Substring(0, installPath.LastIndexOf("\\"));

if (!installPath.EndsWith("\\"))
{
  installPath += "\\";
}
```

That is all!

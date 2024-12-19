---
id: 9
title: Using app.config with Project Server Events
date: 2007-09-04T16:50:00+02:00
updated: 2020-12-02T22:27:58+01:00
author: Michaël Hompus
excerpt: >
  When building custom Project Server Event Receivers the result is a dll file.
  Using app.config and the ConfigurationManagement class will not work.
  Well actually, it’s possible!
layout: ../layouts/BlogPost.astro
permalink: /2007/09/04/using-appconfig-with-project-server-events/
image: /wp-content/uploads/2007/09/post-9-thumnail-1.png
categories:
  - C#
  - Project Server
tags:
  - Configuration
  - Events
  - Project Server 2007
---

When building custom Project Server Event Receivers, the result is a DLL file.
Using app.config and the [`ConfigurationManagement` class][CONFIGURATION_MANAGEMENT_CLASS] will not work.  
Well actually it’s possible!

<!--more-->

The `Microsoft Office Project Server Events Service` executable has its own `app.config` where you can add entries.
If you go to the Project Server bin directory (default: `C:\Program Files\Microsoft Office Servers\12.0\Bin`)
you will find the config file named `Microsoft.Office.Project.Server.Eventing.exe.config`.

Add the `appSettings` section like this:

```xml title="Microsoft.Office.Project.Server.Eventing.exe.config"
<configuration>
  <runtime>
  <assemblyBinding xmlns="urn:schemas-microsoft-com:asm.v1">
    <probing privatePath="ProjectServerEventHandlers"/>
  </assemblyBinding>
  </runtime>
  <appSettings>
    <add key="SSP Location" value="http://localhost:56737/SharedServices1" />
  </appSettings>
</configuration>
```

and your application can happily use the following syntax:

```csharp
ConfigurationManager.AppSettings["SSP Location"]
```

This can make your event just a bit easier to deploy in different configurations without the recompiling or use of extra configuration libraries.

[CONFIGURATION_MANAGEMENT_CLASS]: https://learn.microsoft.com/dotnet/api/system.configuration.configurationmanager?view=netframework-2.0

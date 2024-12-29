---
id: 15
title: "“CS0122: ‘x’ is inaccessible due to its protection level” but you don’t want to go public"
date: 2009-03-04T11:00:16+01:00
updated: 2020-12-02T22:49:40+01:00
author: Michaël Hompus
excerpt: >
  Sometimes you have to split your code into different assemblies.
  For example when I created a custom Admin Page which inherits from WebAdminPageBase (Microsoft.SharePoint.ApplicationPages).
  The problem with Microsoft.SharePoint.ApplicationPages is that it's not deployed to the GAC.
  When compiling you will get the following message: “CS0122: 'foo.bar.x' is inaccessible due to its protection level”

  Now you have only one choice: make x public. Or maybe not?
permalink: /2009/03/04/cs0122-x-is-inaccessible-due-to-its-protection-level-but-you-dont-want-to-go-public/
image: /wp-content/uploads/2009/03/post-15-thumnail-1.png
categories:
  - C#
  - SharePoint
  - Visual Studio
tags:
  - Exception
  - Internal
  - InternalsVisibleTo
  - public key
  - sn
---

Sometimes you have to split your code into different assemblies.
For example, when I created a custom `Admin Page` which inherits from `WebAdminPageBase` (`Microsoft.SharePoint.ApplicationPages`).

The problem with `Microsoft.SharePoint.ApplicationPages` is that it is not deployed to the GAC.

<!--more-->

Putting a reference to this assembly from my assembly,
also containing custom web parts and other controls which have to be registered as `SafeControls` in the `web.config`,
will result in deployment troubles when you use a WSP file.
The problem is when SharePoint is going to register the safe controls,
it will reflect your assembly and will not be able to access the `Microsoft.SharePoint.ApplicationPages` assembly because it is not available in the GAC.  
The same problem can be found using the `Content Deployment` option.

So, you split your code in 2 assemblies, for example `foo.bar` and `foo.bar.ApplicationPages`.
But when your custom application page is depending on an internal type declared in `foo.bar` you are in trouble.
When compiling you will get the following message:

```plain
CS0122: 'foo.bar.x' is inaccessible due to its protection level
```

Now you have only one choice: make `x` public. Or maybe not?

## The solution

It is also possible to make your assembly share their internals with other assemblies.
Add the following to you code (in `foo.bar`):

```csharp
[assembly: InternalsVisibleTo("foo.bar.ApplicationPages, PublicKey=0a240a … c2f34c7")]
```

But the public key is not your public key token.
Thanks to Burt Harris's comment at the [`InternalsVisibleToAttribute` class][INTERNALS_VISIBLE_TO_ATTRIBUTE_CLASS],
you can find your real public key using the following command:

```shell
sn.exe -Tp foo.bar.dll
```

Now compile your project and there you go!

[INTERNALS_VISIBLE_TO_ATTRIBUTE_CLASS]: https://learn.microsoft.com/en-us/dotnet/api/system.runtime.compilerservices.internalsvisibletoattribute?view=net-5.0

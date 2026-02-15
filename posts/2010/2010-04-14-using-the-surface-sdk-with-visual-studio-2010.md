---
id: 158
title: Using the Surface SDK with Visual Studio 2010
date: 2010-04-14T14:45:34+02:00
author: Michaël Hompus
excerpt: >
  With the launch of Visual Studio 2010 this week a lot of people will start upgrading to the new version.
  After the installation was complete I noticed the Surface project and item templates were not available.

  In this post I explain how to get the entries in Visual Studio 2010.
permalink: /2010/04/14/using-the-surface-sdk-with-visual-studio-2010/
image: /wp-content/uploads/2010/04/post-2010-04-14-thumbnail.png
categories:
  - Surface
  - Visual Studio
tags:
  - Installer
  - Vista
  - Visual Studio 2008
  - Visual Studio 2010
  - Windows 7
  - x64
  - x86

# Spell:ignore VS2008SPLEVEL, VS2008CSPROJSUPPORT,VCSEXP2008SPLEVEL, DEXPLORE, VCSHARP90EXPRESS, VS90DEVENV
thumbnail:
  title: "Surface SDK with Visual Studio 2010"
  subtitle: >
    Restoring missing Surface project templates after upgrading from Visual Studio 2008 to 2010.
---

With the launch of Visual Studio 2010 this week a lot of people will start upgrading to the new version.
After the installation was complete, I noticed the Surface project and item templates were not available.

In this article I explain how to get the entries in Visual Studio 2010.

<!--more-->

First of all, you need to realize that the templates are part of the Microsoft Surface SDK.
If you have it installed, skip the next paragraph.

## Installing the Surface SDK

> [!NOTE]
> If you are running Windows 7 or a Windows Vista x64, you need to apply the changes described in a previous post:
> "[Installing the Microsoft Surface SDK on Windows 7 x64](/2010/03/03/installing-the-microsoft-surface-sdk-on-windows-7-x64)".  
> If you do not have Visual Studio 2008 on your system and want to start with Visual Studio 2010 from scratch some additional steps are needed patching the Surface SDK Installer.
> For details on the patch process see the earlier referenced post.

### Patching the installer

When you’re patching the MSI with the [Orca tool](https://docs.microsoft.com/en-us/windows/win32/msi/orca-exe?) remove also the following conditions:

1. Select the row with  
   `Installed OR (VS2008SPLEVEL AND VS2008CSPROJSUPPORT) OR VCSEXP2008SPLEVEL`  
   and choose <kbd>Drop row</kbd>
2. Select the row with  
   `Installed OR (VS2008SPLEVEL AND VS2008SPLEVEL >= "#0") OR` `(VCSEXP2008SPLEVEL AND VCSEXP2008SPLEVEL >= "#0")`  
   and choose <kbd>Drop row</kbd>
3. Select the row with  
   `Installed OR DEXPLORE`  
   and choose <kbd>Drop row</kbd>
4. Select the row with  
   `Installed OR VS90DEVENV OR NOT VS2008SPLEVEL`  
   and choose <kbd>Drop row</kbd>
5. Select the row with  
   `Installed OR VCSHARP90EXPRESS OR NOT VCSEXP2008SPLEVEL`  
   and choose <kbd>Drop row</kbd>

## Copying the Templates from the SDK

Now that you have installed the Surface SDK the subsequent steps are quite simple.

The following lines are for x64 systems.
If you are running on x86 change `Program Files (x86)` into `Program Files`.

```shell
xcopy /s "C:\Program Files (x86)\Microsoft Visual Studio 9.0\Common7\IDE\ItemTemplates\CSharp\Surface\v1.0" "C:\Program Files (x86)\Microsoft Visual Studio 10.0\Common7\IDE\ItemTemplates\CSharp\Surface\1033"

xcopy /s "C:\Program Files (x86)\Microsoft Visual Studio 9.0\Common7\IDE\ProjectTemplates\CSharp\Surface\v1.0" "C:\Program Files (x86)\Microsoft Visual Studio 10.0\Common7\IDE\ProjectTemplates\CSharp\Surface\1033"

cd "C:\Program Files (x86)\Microsoft Visual Studio 10.0\Common7\IDE"

devenv /setup
```

After this is finished launch Visual Studio 2010.

![Screenshot with the "New Project" dialog displaying the Surface Application templates.](/wp-content/uploads/2010/04/new-project-dialog.png "The “New Project” dialog with the Surface Application templates listed.")
_(Remember to select .NET Framework 3.5)_

![Screenshot with the "Add New Item" dialog displaying the Surface Control templates.](/wp-content/uploads/2010/04/add-new-item-dialog.png "The “Add New Item” dialog with the Surface Control templates listed.")

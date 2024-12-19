---
id: 122
title: Installing the Microsoft Surface SDK on Windows 7 x64
date: 2010-03-03T17:22:49+01:00
updated: 2020-12-03T23:31:06+01:00
author: Michaël Hompus
excerpt: >
  If you want to develop for the Microsoft Surface you need a Surface device,
  but using the device to develop is not always practical,
  specially when there are more developers than Surface devices.
  The solution for this is to install the Surface SDK on you local development machine.
  This post will address some limitations you have to work around.
layout: ../layouts/BlogPost.astro
permalink: /2010/03/03/installing-the-microsoft-surface-sdk-on-windows-7-x64/
image: /wp-content/uploads/2010/03/post-122-thumnail-1.png
categories:
  - Surface
tags:
  - CorFlags
  - Orca
  - SDK
  - Vista
  - Windows 7
  - x64

# cSpell:ignore SurfaceSDKWE
---

If you want to develop for the **Microsoft Surface** (the table, not the tablet) you need a Surface device.
But using the device to develop is not always practical, especially when there are more developers than Surface devices.

The solution for this is to install the Surface SDK Workstation Edition on your local development machine.
This article will address some limitations you have to work around.

<!--more-->

## The Microsoft Surface SDK

The Microsoft Surface SDK was released to attendees of the PDC in 2008, making me one of the lucky few. You can still view the "[Developing for Microsoft Surface](https://learn.microsoft.com/shows/pdc-pdc08/pc17)" session on [Channel 9](https://channel9.msdn.com/).

With the PDC 2009 the **Microsoft Surface SDK 1.0 SP1 Workstation Edition** was publicly released.

## Prerequisites

Before you can install the Surface SDK, there are some prerequisites:

- Windows Vista (not Starter Edition) **x86**
- Microsoft XNA Framework Redistributable 2.0
- Microsoft Visual C# 2008 Express Edition or Microsoft Visual Studio 2008

## When you are running Vista x86

Assuming you are not running Windows Vista Starter Edition, you can install the Surface SDK without problems and can start developing immediately!

## When you are _not_ running Vista, or x86

![Error dialog displaying the message: "Your system does not have the correct version of Windows Vista. You must install Microsoft Surface SDK 1.0 SP1, Workstation Edition on a 32-bit version of Windows Vista with Service Pack 1 (SP1). Microsoft Surface SDK 1.0 SP1, Workstation Edition also does not support Windows Vista Starter edition."](/wp-content/uploads/2010/03/error-dialog-not-correct-version-windows-vista.png 'Error dialog displaying the message: "Your system does not have the correct version of Windows Vista. You must install Microsoft Surface SDK 1.0 SP1, Workstation Edition on a 32-bit version of Windows Vista with Service Pack 1 (SP1). Microsoft Surface SDK 1.0 SP1, Workstation Edition also does not support Windows Vista Starter edition."')

Let's face it, Windows Vista is old and gone, and everybody is running Windows 7 nowadays.
So, does this mean no more Surface development?

Lucky enough [Brian Peek](https://brianpeek.com/) wrote [a great blog post](https://brianpeek.com/install-the-surface-sdk-sp1-workstation-edition-on-x64/) about this and I will summarize it here.

Naturally this makes the installation not supported by Microsoft.

## Extracting the installer

There are two installers on the web available at the moment. An executable if you download the SDK from the partner site and a MSI if you download the SDK from the public Microsoft download site.

For the MSI:

```shell
msiexec /a SurfaceSDKWE.msi /qb TARGETDIR=c:\surface
```

For the executable:

```shell
"Microsoft Surface SDK 1.0 SP1, Workstation Edition.exe" /extract c:\surface
```

## Patching the installer

Get the [Orca](https://learn.microsoft.com/windows/win32/msi/orca-exe) tool from the [Windows SDK](https://www.microsoft.com/download/details.aspx?id=8279), or if you do not want to download 4GB for a tool not bigger than 2MB, try [a less supported site](https://www.softpedia.com/get/Authoring-tools/Setup-creators/Orca.shtml). 😉

1. Open the extracted `SurfaceSDKWE.msi` file with Orca.
2. Select the table `LaunchCondition`
3. Select the row with `Installed OR NOT VersionNT64` and choose <kbd>Drop row</kbd>
4. Save & Close Orca

## Patching the Custom Actions

> [!NOTE]
> This is only needed on a x64 machine.

Get the [CorFlags](https://learn.microsoft.com/dotnet/framework/tools/corflags-exe-corflags-conversion-tool) tool from the Windows SDK.

1. Open a command prompt _with elevated privileges_ (Run as administrator).
2. Go to the location of the extracted installer

   ```shell
   cd "Microsoft Surface\v1.0"
   CorFlags setupcustomaction.exe /32BIT+ /Force /nologo
   ```

   Ignore the warning with the code CF011 about strong named signing.

   ![Command prompt showing the warning "corflags : warning CF011 : The specified file is strong name signed. Using /Force will invalidate the signature of this image and will require the assembly to be resigned." after execution.](/wp-content/uploads/2010/03/corflags-warning-file-strong-name-signed.png)

## Installing the SDK

This is pretty straightforward.

![First screen of the Microsoft Surface SDK 1.0 SP1, Workstation Edition Setup](/wp-content/uploads/2010/03/installer-surface-sdk.png)
If you are running on a x86 system you can start developing!

## Patching the executables

> [!NOTE]
> This is only needed on a x64 machine.

To make sure the Surface SDK executables are using the x86 CLR you have to patch them all.

```shell
cd "C:\Program Files (x86)\Microsoft SDKs\Surface\v1.0\Tools\GenTag"
for %i in (*.exe) do CorFlags %i /32BIT+ /Force /nologo /UpgradeCLRHeader

cd "C:\Program Files (x86)\Microsoft SDKs\Surface\v1.0\Tools\Simulator"
for %i in (*.exe) do CorFlags %i /32BIT+ /Force /nologo /UpgradeCLRHeader

cd "C:\Program Files (x86)\Microsoft SDKs\Surface\v1.0\Tools\SurfaceStress"
for %i in (*.exe) do CorFlags %i /32BIT+ /Force /nologo

cd "C:\Program Files (x86)\Microsoft Surface\v1.0"
for %i in (*.exe) do CorFlags %i /32BIT+ /Force /nologo
```

## Patching the Sample Applications

> [!NOTE]
> This is only needed on a x64 machine.

Modify all projects files (`*.csproj`) and change the build type from `Any CPU` to `x86`.

For example, add the following to the appropriate `PropertyGroup` tags:

```xml
<PlatformTarget>x86</PlatformTarget>
```

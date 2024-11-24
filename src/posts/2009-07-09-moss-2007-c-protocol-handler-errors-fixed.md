---
id: 22
title: MOSS 2007 – C# Protocol Handler errors fixed
date: 2009-07-09T19:44:24+02:00
author: Michaël Hompus
excerpt: >
  On CodePlex you can find the “MOSS 2007 - C# Protocol Handler” project. When working with the code I discovered 2 issues which I both fixed. Both solutions are summarized here.
layout: ../layouts/BlogPost.astro
permalink: /2009/07/09/moss-2007-c-protocol-handler-errors-fixed/
image: /wp-content/uploads/2009/07/post-22-thumnail-1.png
categories:
  - C#
  - SharePoint
tags:
  - Buffer
  - CodePlex
  - Exception
  - Protocol Handler
  - SharePoint 2007
  - x64
  - x86
---

On CodePlex you can find the [MOSS 2007 - C# Protocol Handler project](https://web.archive.org/web/20210629141705/https://archive.codeplex.com/?p=mossph).
I am currently using this in a project to index a custom content source.

When working with the code I discovered two issues which I both fixed.
Both solutions are posted in the discussions and/or submitted as patch and I will summarize them here.

<!--more-->

### Running on x64

The first problem is the code not working in x64 environments.
Since we are talking to native code, there are a lot of [structs](https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/struct) in the code.
These structs are containing metadata to indicate the layout in memory.
This is done using the [`StructLayoutAttribute` class](https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.structlayoutattribute?view=netframework-2.0) which contains a [`Value` property](https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.structlayoutattribute.value?view=netframework-2.0) with a [`LayoutKind` enumeration](https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.layoutkind?view=netframework-2.0) and a [`Pack` field](https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.structlayoutattribute.pack?view=netframework-2.0).

The problem is the `Pack` value was set to `1`.
This is normal for 32bit systems, but not for 64bit where a pack of `8` is expected.

Lucky enough, the following is written in the remarks section:

> A value of `0` indicates that the packing alignment is set to the default for the current platform.

This solves our problem! Now the same code runs fine on both x86 and x64 systems.

### Using Security Descriptors

One of the most important features of SharePoint search is security trimming.
To make this possible an [ACL Structure](https://learn.microsoft.com/windows/win32/api/winnt/ns-winnt-acl) is stored with the crawled item in the index database.
The problem is when the ACL is larger then 1kB the crawler goes into an endless loop.

The way it should go is the search service calling the [GetSecurityDescriptor method](https://learn.microsoft.com/previous-versions/office/developer/sharepoint-2007/aa981497(v=office.12)) with a pointer and a size.
This size is `1024` by default.
When the ACL is larger an `ERROR_INSUFFICIENT_BUFFER` error message should be returned and the required size should be set.
The search service then should allocate enough memory and call the `GetSecurityDescriptor` method again, which is now able to assign the complete ACL to the pointer.

The problem with the current version on CodePlex is the value of the error message is incorrect.
Instead of [`0x00000122`](https://learn.microsoft.com/windows/win32/debug/system-error-codes--0-499-#ERROR_INSUFFICIENT_BUFFER) it should be `0x8007007A` ([which is also 112](https://learn.microsoft.com/windows/win32/adsi/win32-error-codes-for-adsi-2-0)).

After changing the code, the ACL will be stored (as long as it stays <64kB).

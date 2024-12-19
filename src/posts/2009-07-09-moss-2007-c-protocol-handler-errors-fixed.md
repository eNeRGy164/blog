---
id: 22
title: MOSS 2007 – C# Protocol Handler errors fixed
date: 2009-07-09T19:44:24+02:00
updated: 2020-12-02T23:15:59+01:00
author: Michaël Hompus
excerpt: >
  On CodePlex you can find the “MOSS 2007 - C# Protocol Handler” project.
  When working with the code I discovered 2 issues which I both fixed.
  Both solutions are summarized here.
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

On CodePlex you can find the [MOSS 2007 - C# Protocol Handler project][PROTOCOL_HANDLER_PROJECT].
I am currently using this in a project to index a custom content source.

When working with the code I discovered two issues which I both fixed.
Both solutions are posted in the discussions and/or submitted as patch and I will summarize them here.

<!--more-->

## Running on x64

The first problem is the code not working in x64 environments.
Since we are talking to native code, there are a lot of [structs][STRUCTS] in the code.
These structs are containing metadata to indicate the layout in memory.
This is done using the [`StructLayoutAttribute` class][STRUCT_LAYOUT_ATTRIBUTE_CLASS] which contains a
[`Value` property][VALUE_PROPERTY] with a [`LayoutKind` enumeration][LAYOUT_KIND_ENUMERATION] and a
[`Pack` field][PACK_FIELD].

The problem is the `Pack` value was set to `1`.
This is normal for 32bit systems, but not for 64bit where a pack of `8` is expected.

Lucky enough, the following is written in the remarks section:

> A value of `0` indicates that the packing alignment is set to the default for the current platform.

This solves our problem! Now the same code runs fine on both x86 and x64 systems.

## Using Security Descriptors

One of the most important features of SharePoint search is security trimming.
To make this possible an [ACL Structure][ACL_STRUCTURE] is stored with the crawled item in the index database.
The problem is when the ACL is larger then 1kB the crawler goes into an endless loop.

The way it should go is the search service calling the [`GetSecurityDescriptor` method][GET_SECURITY_DESCRIPTOR_METHOD] with a pointer and a size.
This size is `1024` by default.
When the ACL is larger an `ERROR_INSUFFICIENT_BUFFER` error message should be returned and the required size should be set.
The search service then should allocate enough memory and call the `GetSecurityDescriptor` method again,
which is now able to assign the complete ACL to the pointer.

The problem with the current version on CodePlex is the value of the error message is incorrect.
Instead of [`0x00000122`][0X00000122_ERROR] it should be `0x8007007A` ([which is also 112][0X8007007A_ERROR]).

After changing the code, the ACL will be stored (as long as it stays <64kB).

[PROTOCOL_HANDLER_PROJECT]: https://web.archive.org/web/20210629141705/https://archive.codeplex.com/?p=mossph
[STRUCTS]: https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/struct
[STRUCT_LAYOUT_ATTRIBUTE_CLASS]: https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.structlayoutattribute?view=netframework-2.0
[VALUE_PROPERTY]: https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.structlayoutattribute.value?view=netframework-2.0
[LAYOUT_KIND_ENUMERATION]: https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.layoutkind?view=netframework-2.0
[PACK_FIELD]: https://learn.microsoft.com/dotnet/api/system.runtime.interopservices.structlayoutattribute.pack?view=netframework-2.0
[ACL_STRUCTURE]: https://learn.microsoft.com/windows/win32/api/winnt/ns-winnt-acl
[GET_SECURITY_DESCRIPTOR_METHOD]: https://learn.microsoft.com/previous-versions/office/developer/sharepoint-2007/aa981497(v=office.12)
[0X00000122_ERROR]: https://learn.microsoft.com/windows/win32/debug/system-error-codes--0-499-#ERROR_INSUFFICIENT_BUFFER
[0X8007007A_ERROR]: https://learn.microsoft.com/windows/win32/adsi/win32-error-codes-for-adsi-2-0

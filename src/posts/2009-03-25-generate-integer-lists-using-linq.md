---
id: 20
title: Generate integer lists using LINQ
date: 2009-03-25T14:35:00+01:00
updated: 2020-12-02T23:06:10+01:00
author: Michaël Hompus
excerpt: >
  I was working on some old code which created three DropDown controls with hours, minutes and seconds.
  I wanted to LINQify it using the LINQ Range method.
layout: ../layouts/BlogPost.astro
permalink: /2009/03/25/generate-integer-lists-using-linq/
image: /wp-content/uploads/2009/03/post-20-thumnail-1.png
categories:
  - C#
tags:
  - IEnumerable
  - LINQ
  - Range
---

I was working on some old code which created three DropDown controls with _hours_, _minutes_, and _seconds_.

<!--more-->

This was the original code:

```csharp
for (var i = 0; i < 24; i++)
{
    Hour.Items.Add(new ListItem(i.ToString()));
}

for (var i = 0; i < 60; i++)
{
    Minute.Items.Add(new ListItem(i.ToString()));
    Second.Items.Add(new ListItem(i.ToString()));
}
```

I wanted to "LINQify" this code using the LINQ range method:

```csharp
Enumerable.Range(int start, int count)
```

This returns an `IEnumerable<int>` collection with the corresponding range of values.
So, my DropDown controls are now created with the following code:

```csharp
Hour.Items.AddRange(
    Enumerable
        .Range(0, 24)
        .Select(i => new ListItem(i.ToString())).ToArray());

Minute.Items.AddRange(
    Enumerable
        .Range(0, 60)
        .Select(i => new ListItem(i.ToString())).ToArray());

Second.Items.AddRange(
    Enumerable
        .Range(0, 60)
        .Select(i => new ListItem(i.ToString())).ToArray());
```

This could be optimized by using a variable for the sixty values which could be used twice.

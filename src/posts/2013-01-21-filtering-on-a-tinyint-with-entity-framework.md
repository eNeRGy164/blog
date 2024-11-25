---
id: 257
title: Filtering on a tinyint with Entity Framework
date: 2013-01-21T14:57:32+01:00
updated: 2021-07-16T22:58:49+02:00
author: Michaël Hompus
excerpt: >
  When writing .NET code to access a SQL database we often rely on the Entity Framework (EF).
  The EF makes it very easy to retrieve data from the database by generating a SQL Query for us.
  But we should not trust it blindly, as the EF can also generate a bad query.

  It will return the correct data yes, but at what performance cost?
layout: ../layouts/BlogPost.astro
permalink: /2013/01/21/filtering-on-a-tinyint-with-entity-framework/
image: /wp-content/uploads/2013/01/post-257-thumbnail.png
categories:
  - C#
  - SQL
tags:
  - CAST
  - Contains
  - LINQ
  - tinyint
---

When writing .NET code to access a SQL database we often rely on the Entity Framework (EF).
The EF makes it very easy to retrieve data from the database by generating a SQL Query for us.
But we should not trust it blindly, as the EF can also generate a bad query.

It will return the correct data yes, but at what performance cost?

<!--more-->

I have a table with lots of data, and to keep the table as small as possible on disk and in memory I want to optimize the columns.
This can be done by using _varchar_ instead of _nvarchar_, _date_ instead of _datetime_ and using _tinyint_ instead of _int_.
Of course, you only can do this if your data allows this.

## The problem

Changing a column in my table from `int` to `tinyint` gave me a storage and memory space win, but it also gave me a performance loss!

In my case the SQL column `HasSong` is a [`tinyint`](https://learn.microsoft.com/sql/t-sql/data-types/int-bigint-smallint-and-tinyint-transact-sql).
EF translates this to a [Byte structure](https://learn.microsoft.com/dotnet/api/system.byte) in the .NET model.

The following code:

```csharp
var query = from d in dataEntities.Donations
            where d.HasSong == 1
            select d.DonationId;
```

produces this SQL Query:

```sql
SELECT
    [Extent1].[DonationId] AS [DonationId]
FROM
    [dbo].[Donations] AS [Extent1]
WHERE
    1 = CAST([Extent1].[HasSong] AS int)
```

When SQL encounters this [CAST](https://learn.microsoft.com/sql/t-sql/functions/cast-and-convert-transact-sql) it will skip all Indexes that are on the `HasSong` column resulting in the query engine using non-optimized indexes or even worse: full table scans.

So, this explains my performance loss, but how do we convince EF not to cast my `byte` to an `int`?

## The familiar "Contains"

Browsing the internet gave me my first idea: using the familiar contains method I encountered on an earlier post about the EF: [Joining an IQueryable with an IEnumerable](/2010/08/26/joining-an-iqueryable-with-an-ienumerable).  
I just have to add an [Array](https://learn.microsoft.com/dotnet/csharp/language-reference/builtin-types/arrays#single-dimensional-arrays) with a single value.

So, trying this:

```csharp
var tinyintComparison = new byte[] { 1 };

var query = from d in dataEntities.Donations
            where tinyintComparison.Contains(d.HasSong)
            selectd.DonationId;
```

was not such a good idea as it throws an [`ArgumentException`](https://learn.microsoft.com/dotnet/api/system.argumentexception):

![Screenshot showing Visual Studio debugger with the message "ArgumentException: DbExpressionBinding requires an input expression with a collection ResultType"](/wp-content/uploads/2013/01/argument-exception-dbexpressionbinding.png)

It did work for [other people using a SMALLINT](https://stackoverflow.com/questions/9016265/generated-query-for-tinyint-column-introduces-a-cast-to-int/9667696#9667696),
so I guess an array of bytes is a special case reserved for working with binary data in your database.

## The solution

Lucky enough we are close to a solution, changing the array to a [`List<T>` class](https://learn.microsoft.com/dotnet/api/system.collections.generic.list-1):

```csharp
var tinyintComparison = new List<byte> { 1 };

var query = from d in dataEntities.Donations
            where tinyintComparison.Contains(d.HasSong)
            select d.DonationId;
```

results in the following query:

```sql
SELECT
    [Extent1].[DonationId] AS [DonationId]
FROM
    [dbo].[Donations] AS [Extent1]
WHERE
    1 = [Extent1].[HasSong]
```

There we are! No more casting.
The SQL query engine can use the correct indexes again and we still won disk and memory space.

## Conclusion

If you don't want a CAST in your SQL query when using a `tinyint`, use the
[`ICollection<T>.Contains` method](https://learn.microsoft.com/dotnet/api/system.collections.generic.icollection-1.contains).

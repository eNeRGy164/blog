---
id: 194
title: Joining an IQueryable with an IEnumerable
date: 2010-08-26T17:33:55+02:00
updated: 2021-07-16T23:03:08+02:00
author: Michaël Hompus
excerpt: >
  With the introduction of LINQ the difference between writing code for accessing a lists of objects in memory and accessing a list of data in an external data source like SQL is vanishing.
  Combining a in memory with a external list in a single query was not yet possible.
  With the introduction of .NET Framework 4.0 this has changed.
permalink: /2010/08/26/joining-an-iqueryable-with-an-ienumerable/
image: /wp-content/uploads/2010/08/post-2010-08-26-thumbnail.png
categories:
  - C#
  - SQL
tags:
  - Contains
  - IEnumerable
  - IQueryable
  - Join
  - LINQ
thumbnail:
  title: "Joining IQueryable with IEnumerable"
  subtitle: >
    Combining in-memory collections with SQL queries using LINQ Contains in .NET Framework 4.0.
---

With the introduction of LINQ, the difference between writing code for accessing a list of objects in memory and accessing a list of data in an external data source like SQL Server is vanishing.

Combining an "in memory" list with an external list in a single query was not yet possible.
With the introduction of .NET Framework 4.0 this has changed.

In this article, I want to filter my SQL data using a list of integers I have stored in memory.

<!--more-->

## Data model

I have created a small data model as illustration. This will be used for the examples.
Follow the link on the image below for a larger version.
The model is part of [the sample code](/wp-content/uploads/2010/08/IQueryableIEnumerableDemo.zip).

![Visual representation of the data model as described above.](/wp-content/uploads/2010/08/data-model.png "Data model")

## IQueryable.Join

The first option you can use is to use the [`Queryable.Join` method](https://learn.microsoft.com/dotnet/api/system.linq.queryable.join?view=netframework-4.0#overloads).

```csharp
var entities = new DemoModelContainer();
var countryIds = Enumerable.Range(1, 3);

var query = from i in entities.Items
            from c in i.Countries
            join cid in countryIds on c.Id equals cid
            select i;

var items = query.ToList();
```

When you look at the generated SQL Statement (I love IntelliTrace!) you can see a temporary table is created by using the [`UNION ALL` statement](https://learn.microsoft.com/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-2016).

```sql
SELECT
    [Extent1].[Id] AS [Id],
    [Extent1].[Name] AS [Name]
FROM
    [dbo].[Items] AS [Extent1]
    INNER JOIN [dbo].[CountryItem] AS [Extent2]
                               ON [Extent1].[Id] = [Extent2].[Items_Id]
    INNER JOIN (
        SELECT
            [UnionAll1].[C1] AS [C1]
        FROM (
            SELECT 1 AS [C1] FROM (SELECT 1 AS X) AS [SingleRowTable1]
            UNION ALL
            SELECT 2 AS [C1] FROM (SELECT 1 AS X) AS [SingleRowTable2]
        ) AS [UnionAll1]
        UNION ALL
        SELECT 3 AS [C1] FROM (SELECT 1 AS X) AS [SingleRowTable3]
    ) AS [UnionAll2] ON [Extent2].[Countries_Id] = [UnionAll2].[C1]
```

What happens is that 2 values are combined in a set, this set is extended with the next value,
this set is extended with another value, and so on, and so on, until all values are present.

This works nicely, but as you can imagine, the SQL query will grow rapidly when the `IEnumerable` list gets larger.

When you change the following:

```diff
-var countryIds = Enumerable.Range(1, 3);
+var countryIds = Enumerable.Range(1, 50);
```

you will run into a [`SqlException`](https://learn.microsoft.com/dotnet/api/system.data.sqlclient.sqlexception?view=netframework-4.0):

> "Some part of your SQL statement is nested too deeply. Rewrite the query or break it up into smaller queries."

SQL Server has a hard-coded limit of nesting queries; it doesn't matter which version or edition of SQL Server you use.

## IEnumerable Contains

Joining tables is one way of filtering data, an alternative is to use the [`WHERE` statement](https://learn.microsoft.com/sql/t-sql/queries/where-transact-sql?view=sql-server-2016).
This can be done by using the [`Queryable.Where` method](https://learn.microsoft.com/dotnet/api/system.linq.queryable.where?view=netframework-4.0#overloads).

```csharp
var entities = new DemoModelContainer();
var countryIds = Enumerable.Range(1, 3);

var query = from i in entities.Items
            from c in i.Countries
            where countryIds.Contains(c.Id)
            select i;

var items = query.ToList();
```

When you look at the generated SQL Statement (Still loving IntelliTrace!) you can see now the [`IN` statement](https://learn.microsoft.com/sql/t-sql/language-elements/in-transact-sqlview=sql-server-2016) is used.

```sql
SELECT
    [Extent1].[Id] AS [Id],
    [Extent1].[Name] AS [Name]
FROM
    [dbo].[Items] AS [Extent1]
    INNER JOIN [dbo].[CountryItem] AS [Extent2]
                               ON [Extent1].[Id] = [Extent2].[Items_Id]
WHERE
    [Extent2].[Countries_Id] IN (1,2,3)
```

This SQL Query is much smaller and filtering against a larger set will not give you the exception.

This is how the `WHERE` statement looks when filtering on 50 values:

```sql
WHERE [Extent2].[Countries_Id] IN (1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,
                                   16,17,18,19,20,21,22,23,24,25,26,27,
                                   28,29,30,31,32,33,34,35,36,37,38,39,
                                   40,41,42,43,44,45,46,47,48,49,50)
```

## Conclusion

You can use both methods to filter SQL data with a list in memory.
But when choosing for the `join` method you should be sure your query will not reach the maximum level of nesting.

I prefer to use `Contains` method.

Although I used a many-to-many relation in this example, the same applies for a one-to-many scenario.

## Sample code

I have added a small Visual Studio 2010 project so you can see the SQL statements for yourself.

You will need SQL Server Express 2008 R2 installed on your machine to run the code.

[IQueryableIEnumerableDemo.zip](/wp-content/uploads/2010/08/IQueryableIEnumerableDemo.zip)

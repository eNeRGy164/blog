---
id: 186
title: Keeping your SharePoint 2010 development databases small
date: 2010-06-22T14:55:40+02:00
updated: 2020-12-06T17:22:52+01:00
author: Michaël Hompus
excerpt: >
  With SharePoint 2010 the amount of databases on your SQL server has grown quite a bit.
  By default most of these databases have their recovery model set to 'FULL'.
  After some time you will discover you're running out of space.
permalink: /2010/06/22/keeping-your-sharepoint-2010-development-databases-small/
image: /wp-content/uploads/2010/06/post-2010-06-22-thumbnail.png
categories:
  - SharePoint
  - SQL
tags:
  - SharePoint 2007
  - SharePoint 2010
  - Shrink
  - SQL
  - Transaction Log
  - TSQL
thumbnail:
  title: "Shrink SharePoint 2010 Dev Databases"
  subtitle: >
    Reducing disk usage by changing the recovery model and shrinking transaction logs on development servers.
---

With SharePoint 2010 the number of databases on your SQL Server has grown quite a bit.
By default, most of these databases have their recovery model set to `FULL`.
After some time, you will discover you’re running out of space.

<!--more-->

## The problem

Most likely, the problem lies with the transaction logs of your databases.
With the recovery model set to `FULL` they will keep storing every transaction until you make a backup.
Chances are you do not configure a backup plan for your development environment as most development
databases do not need a backup as your sources will be stored in a source control system.

## The (manual) solution

To solve this problem, you can change the recovery model of each database by hand.
For this you can open SQL Server Management Studio (SMSS),
open the properties screen for a database and navigate to the options tab.
There you will find the recovery model option.

![Database Properties screen with the Recovery model set to 'Simple'](/wp-content/uploads/2010/06/database-properties-recovery-model-shrink.png "Database Properties screen with the Recovery model set to `Simple`.")

Saving this change will empty your transaction log.
But it will not shrink the physical file on disk.
To shrink this file, you can look at the `Shrink` task.

![The context menu's to shrink the size of the log files](/wp-content/uploads/2010/06/context-menu-shrink-log-files.png "The context menus to shrink the size of the log files.")

## The (automated) solution

Executing this step for every database manually is quite some work. So, you want the easy solution.

The following TSQL script will change the recovery model for every database to `Simple` and shrinks the database.

```sql
USE [master]
GO

DECLARE @dbname SYSNAME
DECLARE @altercmd NVARCHAR(1000)
DECLARE @shrinkcmd NVARCHAR(1000)

DECLARE [dbcursor] CURSOR FOR SELECT [name] FROM sysdatabases

OPEN [dbcursor]
FETCH NEXT FROM [dbcursor] INTO @dbname

WHILE
  @@FETCH_STATUS = 0
BEGIN
  IF
    (SELECT DATABASEPROPERTYEX(@dbname, 'RECOVERY')) != 'SIMPLE'
    AND
    @dbname != 'tempdb'
  BEGIN
    SET @altercmd = 'ALTER DATABASE "' + @dbname + '" SET RECOVERY SIMPLE'
      EXEC (@altercmd)

      SET @shrinkcmd = 'DBCC SHRINKDATABASE ("' + @dbname + '")'
      EXEC (@shrinkcmd)

      PRINT @dbname
  END

  FETCH NEXT FROM [dbcursor] INTO @dbname
END

CLOSE [dbcursor]
DEALLOCATE [dbcursor]
```

---
id: 336
title: Backup your Azure SQL Database to Blob Storage using code
date: 2013-03-13T16:11:30+01:00
updated: 2021-07-16T22:56:05+02:00
author: Michaël Hompus
excerpt: >
  With Windows Azure we can use Windows Azure SQL Database service (formerly known as SQL Azure) when we need a Relational Database.
  Microsoft offers a 99.9% monthly SLA for this service.
  But Microsoft doesn't provide you with the service to restore your data to a moment back in time when you (accidentally) delete of corrupt data.

  To have a backup in time I wrote some code to allow a Worker Role to backup my Windows Azure SQL Database every hour.
  Most solutions you find online are relying on the REST Endpoints but the address of the endpoint is different depending on which datacenter your database is hosted.
  I found a different solution where you only need the connection string to your database using the DacServices.
permalink: /2013/03/13/backup-your-azure-sql-database-to-blob-storage-using-code/
image: /wp-content/uploads/2013/03/post-336-thumbnail.jpg
categories:
  - Azure
  - SQL
tags:
  - Azure
  - Backup
  - DAC
  - Database
  - SQL
  - Worker Role
---

With Windows Azure we can use [Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/sql-database-paas-overview) service (formerly known as SQL Azure) when we need a Relational Database.
Microsoft offers a 99.9% monthly SLA for this service.

But Microsoft does not provide you with the service to restore your data to a moment back in time when you (accidentally) delete of corrupt data.

<!--more-->

With an "on-premises" Microsoft SQL Server installation you would solve this by configuring and scheduling (transactional log) backups.
But this is not possible for the Azure service.

You could replicate a copy of your database using [SQL Data Sync](https://learn.microsoft.com/azure/azure-sql/database/sql-data-sync-sql-server-configure) with a delay.
But if you fail to discover the issue in time for the next scheduled sync your copy won't make a difference.

To have a backup in time I wrote some code to allow a Worker Role to back up my Azure SQL Database every hour.
Most solutions you find online are relying on the _REST Endpoints_ but the address of the endpoint is different depending on which datacenter your database is hosted.
I found a different solution where you only need the connection string to your database using the DacServices.

## Pre-requisites

To make a backup I use the **Microsoft SQL Server 2012 Data-Tier Application Framework**.
This framework provides the [`DacServices` class](https://learn.microsoft.com/dotnet/api/microsoft.sqlserver.dac.dacservices?view=sql-dacfx-140).

You need to configure **Local Storage** to store the backup temporary and you need a [Storage Account](https://learn.microsoft.com/azure/storage/common/storage-account-create) to store the backup file permanently.

## The solution

```csharp
// Get the Storage Account
var backupStorageAccount =
    CloudStorageAccount.FromConfigurationSetting("StorageAccount");

// The container to store backups
var backupBlobClient = backupStorageAccount.CreateCloudBlobClient();
backupContainer = backupBlobClient.GetContainerReference("backups");
backupContainer.CreateIfNotExist();

// The backup file on blob storage
var storageName =
    string.Format("Backup_{0}.bacpac", DateTime.Now.ToString("yyyyMMdd-HHmmss"));
var backupFile = backupContainer.GetBlobReference(storageName);

// Get a reference to the temporary files
var localResource = RoleEnvironment.GetLocalResource("TempFiles");
var file = string.Format("{0}{1}", localResource.RootPath, backupFile.Name);

// Connect to the DacServices
var services = new DacServices(
    ConfigurationManager.ConnectionStrings["DatabaseName"].ConnectionString);

services.Message += (sender, e) =>
    {
        // If you use a lock file,
        // this would be a good location to extend the lease
    };

// Export the database to the local disc
services.ExportBacpac(file, "DatabaseName");

// Upload the file to Blob Storage
backupFile.Properties.ContentType = "binary/octet-stream";
backupFile.UploadFile(file);

// Remove the temporary file
File.Delete(file);
```

## Explanation

The code does the following:

1. Connect to the Storage Account
2. Get a reference to the container and file where you want to store the backup
3. Get a reference to the local storage location
4. Connect to the DacService using the database connection string
5. Export the database to a `.bacpac` file
6. Upload the file to blob storage
7. Delete the local file

## A Catch

Before you deploy your Worker Role, you will have to make sure each of the listed assemblies are referenced and the property `Copy Local` is set to `True` otherwise you will run into trouble.

- `Microsoft.Data.Tools.Schema.Sql`
- `Microsoft.Data.Tools.Utilities`
- `Microsoft.SqlServer.Dac`
- `Microsoft.SqlServer.TransactSql`
- `Microsoft.SqlServer.TransactSql.ScriptDom`
- `Microsoft.SqlServer.Types`

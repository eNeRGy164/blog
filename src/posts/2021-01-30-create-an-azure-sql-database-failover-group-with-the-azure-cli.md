---
id: 1919
title: Create an Azure SQL Database Failover Group with the Azure CLI
date: 2021-01-30T16:35:39+01:00
updated: 2021-07-16T22:26:23+02:00
author: Michaël Hompus
excerpt: >
  With an Azure SQL Database, Microsoft is already providing high availability with an SLA of at least 99.99%.
  But if you want to prevent to be affected by a large regional event or want to meet regulatory demands to be
  able to execute failovers to another region, enabling a failover group is the solution for you.

  In this article I will show you how to create a SQL database failover group in two regions using the Azure CLI.
layout: ../layouts/BlogPost.astro
permalink: /2021/01/30/create-an-azure-sql-database-failover-group-with-the-azure-cli/
image: /wp-content/uploads/2021/01/post-1919-thumbnail.jpg
categories:
  - Azure
  - SQL
tags:
  - Availability
  - Azure
  - CLI
  - Database
  - Failover
  - Primary
  - Redundant
  - Secondary
  - SQL
---

With an Azure SQL Database, Microsoft is already providing high availability with an SLA of at least 99.99%.
But if you want to prevent to be affected by a large regional event or want to meet regulatory demands to be able to execute failovers to another region,
enabling a failover group is the solution for you.

In this article I will show you how to create a SQL database failover group in two regions using the Azure CLI.

<!--more-->

> [!NOTE]
> In this article, the examples are using the Azure CLI in a bash shell.

## Creating a failover group

To create a failover group, you need two SQL Servers in a [paired region][AZURE_PAIRED_REGION].
For example, West Europe and North Europe.

Make sure you create separate resource groups in each region where a server is deployed.
It is not possible to update a resource group if the region it is linked to is unreachable.

> If the resource group's region is temporarily unavailable, you can't update resources in the resource group because the metadata is unavailable.
> The resources in other regions will still function as expected, but you can't update them.
>
> [Azure Resource Manager overview][AZURE_RESOURCE_GROUPS]

For each region, create a resource group with the [`az group create` command][AZ_GROUP_CREATE_COMMAND]
and a SQL server with the [`az sql server create` command][AZ_SQL_SERVER_CREATE_COMMAND].

> [!NOTE]
> As a good practice, make sure only connections using the highest supported TLS version are allowed.

```shell title="Azure CLI"
# West Europe
az group create --name "hompus-db-we-rg" \
                --location "westeurope"

az sql server create --resource-group "hompus-db-we-rg" \
                     --name "hompus-db-we-server" \
                     --location "westeurope" \
                     --minimal-tls-version 1.2 \
                     --admin-user "michael" \
                     --admin-password "S0meStr0ngRand0mP@$$w0rd"

# North Europe
az group create --name "hompus-db-ne-rg" \
                --location "northeurope"

az sql server create --resource-group "hompus-db-ne-rg" \
                     --name "hompus-db-ne-server" \
                     --location "northeurope" \
                     --minimal-tls-version 1.2 \
                     --admin-user "michael" \
                     --admin-password "S0meStr0ngRand0mP@$$w0rd"
```

Create the failover group with both servers.
The failover group is created with the [`az sql failover-group create` command][AZ_SQL_FAILOVER_GROUP_CREATE_COMMAND].
If there are already databases deployed to SQL server,
it is possible to add these at the same time to the failover group by specifying the databases with the `--add-db` property.

> [!NOTE]
> The name of the group will become part of the URL to access the database.

```shell title="Azure CLI"
az sql failover-group create --name "hompus-db-group" \
                             --resource-group "hompus-db-we-rg" \
                             --server "hompus-db-we-server" \
                             --partner-resource-group "hompus-db-ne-rg" \
                             --partner-server "hompus-db-ne-server"
```

## Creating and adding a database

Create a database with the [`az sql db create` command][AZ_SQL_DB_CREATE_COMMAND].
For this article I use an empty database. The database can be filled with sample data using the `--sample-name` property.

Add the database to the failover group with the [`az sql failover-group update` command][AZ_SQL_FAILOVER_GROUP_UPDATE_COMMAND].

```shell title="Azure CLI"
az sql db create --resource-group "hompus-db-we-rg" \
                 --name "hompus-db" \
                 --server "hompus-db-we-server" \
                 --edition "Basic"

az sql failover-group update --resource-group "hompus-db-we-rg" \
                             --name "hompus-db-group" \
                             --server "hompus-db-we-server" \
                             --add-db "hompus-db"
```

After the last two commands, the Azure portal will show a visual representation of the failover group.

![Screenshot of the Azure portal showing the failover group configuration](/wp-content/uploads/2021/01/portal-failover-group.png "Azure portal showing the failover group configuration")

Notice there are now two listener endpoints.
You can use the secondary endpoint for read-only access.
For example, run analytics on the secondary instance, reducing the load on the primary instance.

## Increasing availability even a bit more

As mentioned at the beginning of this article, the SLA of a SQL database is already 99.99%.
But making use of availability zones will increase this even more to an SLA of 99.995%.

If we look at the default SQL database architecture, files are stored on locally redundant storage.
If the primary node fails, another node in the same region will take over the role of the primary one.

![Four different nodes with the separated compute and storage layers](/wp-content/uploads/2021/01/general-purpose-service-tier.png)

With zone redundant availability, zone-redundant storage is used,
and nodes in two other availability zones can take the role of the primary one.

![Zone redundant configuration for general purpose](/wp-content/uploads/2021/01/zone-redundant-for-general-purpose.png)

> [!NOTE]
> This is not supported for basic and standard edition databases.

To enable zone redundant support, add the `--zone-redundant` parameter to the [`az sql db create` command][AZ_SQL_DB_CREATE_COMMAND].

```shell title="Azure CLI"
az sql db create --resource-group "hompus-db-we-rg" \
                 --name "hompus-zoned-db" \
                 --server "hompus-db-we-server" \
                 --edition "GeneralPurpose" \
                 --zone-redundant true

az sql failover-group update --resource-group "hompus-db-we-rg" \
                             --name "hompus-db-group" \
                             --server "hompus-db-we-server" \
                             --add-db "hompus-zoned-db"
```

This makes the SQL database a sturdy backbone to be (almost) always available.

Do not forget to make sure the rest of your environment is also capable to handle a region outage.
I might come back to this in a future article.

[AZURE_PAIRED_REGION]: https://learn.microsoft.com/azure/reliability/cross-region-replication-azure#azure-regional-pairs
[AZURE_RESOURCE_GROUPS]: https://learn.microsoft.com/azure/azure-resource-manager/management/overview#resource-groups
[AZ_GROUP_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/group#az_group_create
[AZ_SQL_SERVER_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/sql/server#az_sql_server_create
[AZ_SQL_FAILOVER_GROUP_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/sql/failover-group#az_sql_failover_group_create
[AZ_SQL_DB_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/sql/db#az_sql_db_create
[AZ_SQL_FAILOVER_GROUP_UPDATE_COMMAND]: https://learn.microsoft.com/cli/azure/sql/failover-group#az_sql_failover_group_update

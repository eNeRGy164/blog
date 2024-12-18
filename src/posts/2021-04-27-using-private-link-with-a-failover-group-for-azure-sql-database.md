---
id: 1908
title: Using Private Link with a Failover Group for Azure SQL Database
date: 2021-04-27T17:32:11+02:00
updated: 2023-10-26T15:30:09+02:00
author: Michaël Hompus
excerpt: >
  In a previous article I described how to configure an Azure SQL database failover group
  for high availability across multiple regions.

  But what if you want to limit network traffic to a database
  in this failover group to only your private networks?

  In this article I show how to make a SQL database failover group reachable via the
  Private Link service and make sure the database stays reachable after a failover.
layout: ../layouts/BlogPost.astro
permalink: /2021/04/27/using-private-link-with-a-failover-group-for-azure-sql-database/
image: /wp-content/uploads/2021/04/post-1908-thumbnail.jpg
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
  - Secondary
  - SQL
  - Virtual Network
  - VNet
---

In a [previous article][BLOG_CONFIGURE_AZURE_SQL_FAILOVER_GROUP] I described how to configure
an Azure SQL database failover group for high availability across multiple regions.

But what if you want to limit network traffic to a database in this failover group to only your private networks?

In this article I show how to make a SQL database failover group reachable via the
[Private Link][AZURE_PRIVATE_LINK] service and make sure the database stays reachable after a failover.

<!--more-->

> [!NOTE]
> This article will continue on the environment created in the previous article where I described how to 
> [create an Azure SQL Database Failover Group with the Azure CLI][BLOG_CONFIGURE_AZURE_SQL_FAILOVER_GROUP].  
> The examples are using the Azure CLI in a bash shell.

## Creating a virtual network

First create a virtual network which can be used to access the SQL database privately.

```shell title="Azure CLI"
az group create --name "hompus-vnet-we-rg" \
                --location "westeurope"

az network vnet create --resource-group "hompus-vnet-we-rg" \
                       --name "hompus-we-vnet" \
                       --location "westeurope" \
                       --address-prefix "10.164.0.0/16" \
                       --subnet-name "default" \
                       --subnet-prefix "10.164.0.0/24"
```

Controlling traffic from and to private endpoints is not possible with network security groups (NSG).

However, to connect a private endpoint to a subnet, the [private endpoint network policy has to be disabled explicitly][AZURE_PRIVATE_LINK_DISABLE_NSG].
This is done with the [`az network vnet subnet update` command][AZ_NETWORK_VNET_SUBNET_UPDATE_COMMAND].

```shell title="Azure CLI"
az network vnet subnet update --resource-group "hompus-vnet-we-rg" \
                              --name "default" \
                              --vnet-name "hompus-we-vnet" \
                              --disable-private-endpoint-network-policies true
```

## Creating the private endpoint

For each of the SQL servers in the failover group we need to add a private link.
First retrieve the id of the server using the [`az sql server show` command][AZ_SQL_SERVER_SHOW_COMMAND].

To create the private endpoint, use the [`az network private-endpoint create` command][AZ_NETWORK_PRIVATE_ENDPOINT_CREATE_COMMAND].
Both the `name` and `connection name` need to be provided, which can be the same.

Specify the SQL server `resource id` and the name of the `subnet` that are on both sides of the connection.

Do the same for the other SQL server in the failover group.

```shell title="Azure CLI"
# West Europe
sqlServerIdWE=$(az sql server show --resource-group "hompus-db-we-rg" \
                                   --name "hompus-db-we-server" \
                                   --query "id" \
                                   --output "tsv")

az network private-endpoint create --resource-group "hompus-vnet-we-rg" \
                                   --name "hompus-db-we-server-pe" \
                                   --connection-name "hompus-db-we-server-pe" \
                                   --private-connection-resource-id $sqlServerIdWE \
                                   --group-id "sqlServer" \
                                   --vnet-name "hompus-we-vnet" \
                                   --subnet "default"

# North Europe
sqlServerIdNE=$(az sql server show --resource-group "hompus-db-ne-rg" \
                                   --name "hompus-db-ne-server" \
                                   --query "id" \
                                   --output "tsv")

az network private-endpoint create --resource-group "hompus-vnet-we-rg" \
                                   --name "hompus-db-ne-server-pe" \
                                   --connection-name "hompus-db-ne-server-pe" \
                                   --private-connection-resource-id $sqlServerIdNE \
                                   --group-id "sqlServer" \
                                   --vnet-name "hompus-we-vnet" \
                                   --subnet "default"
```

### Creating the private DNS zone

When any application connected to the private network resolves the DNS name
`hompus-db-group.database.windows.net` the response will contain the external IP-address.
This defeats the purpose of the network and endpoint.

```plain frame="terminal" title="bash" {15}
michael@hompus-we-vm:~$ nslookup hompus-db-group.database.windows.net

Non-authoritative answer:
hompus-db-group.database.windows.net
                canonical name = hompus-db-we-server.database.windows.net.
hompus-db-we-server.database.windows.net
                canonical name = hompus-db-we-server.privatelink.database.windows.net.
hompus-db-we-server.privatelink.database.windows.net
                canonical name = dataslice9.westeurope.database.windows.net.
dataslice9.westeurope.database.windows.net
                canonical name = dataslice9westeurope.trafficmanager.net.
dataslice9westeurope.trafficmanager.net
                canonical name = cr7.westeurope1-a.control.database.windows.net.
Name:   cr7.westeurope1-a.control.database.windows.net
Address: 52.236.184.163
```

To resolve the correct IP-address, create a private DNS zone using the [`az network private-dns zone create` command][AZ_NETWORK_PRIVATE_DNS_ZONE_CREATE_COMMAND].
The name must be `privatelink.database.windows.net`.
Connect the created DNS zone to the virtual network with the [`az network private-dns link vnet create` command][AZ_NETWORK_PRIVATE_DNS_LINK_VNET_CREATE_COMMAND].

A linked private DNS zone allows virtual machines on the virtual network to be automatic added as entries in the DNS zone.
This is not relevant for the private link DNS zone, so this option can be disabled.

```shell title="Azure CLI"
az network private-dns zone create --resource-group "hompus-vnet-we-rg" \
                                   --name "privatelink.database.windows.net"

az network private-dns link vnet create \
                                --resource-group "hompus-vnet-we-rg" \
                                --name "pdns-link-hompus-we-vnet" \
                                --zone-name "privatelink.database.windows.net" \
                                --virtual-network "hompus-we-vnet" \
                                --registration-enabled false
```

The next step is to add the private endpoints to the DNS zone.
This does not require knowledge of the actual IP-addresses that have been assigned on the network.
With the [`az network private-endpoint dns-zone-group create` command][AZ_NETWORK_PRIVATE_ENDPOINT_DNS_ZONE_GROUP_CREATE_COMMAND] the endpoint is registered,
and the private IP-address will be resolved.

```shell
# West Europe
az network private-endpoint dns-zone-group create \
                          --resource-group "hompus-vnet-we-rg" \
                          --name "hompus-db-zone" \
                          --endpoint-name "hompus-db-we-server-pe" \
                          --private-dns-zone "privatelink.database.windows.net" \
                          --zone-name "hompus-db-group"

# North Europe
az network private-endpoint dns-zone-group create \
                          --resource-group "hompus-vnet-we-rg" \
                          --name "hompus-db-zone" \
                          --endpoint-name "hompus-db-ne-server-pe" \
                          --private-dns-zone "privatelink.database.windows.net" \
                          --zone-name "hompus-db-group"
```

## Resolving the private endpoint

After the registration is done, any application connected to the private network will resolve the DNS name
`hompus-db-group.database.windows.net` to the internal IP-address.

The DNS name for `hompus-db-group.secondary.database.windows.net` will point to the other server in the failover group.

```plain frame="terminal" title="bash" {11}
michael@hompus-we-vm:~$ nslookup hompus-db-group.database.windows.net
Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
hompus-db-group.database.windows.net
                canonical name = hompus-db-we-server.database.windows.net.
hompus-db-we-server.database.windows.net
                canonical name = hompus-db-we-server.privatelink.database.windows.net.
Name:   hompus-db-we-server.privatelink.database.windows.net
Address: 10.164.0.4
```

```plain frame="terminal" title="bash" {11}
michael@hompus-we-vm:~$ nslookup hompus-db-group.secondary.database.windows.net
Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
hompus-db-group.secondary.database.windows.net
                canonical name = hompus-db-ne-server.database.windows.net.
hompus-db-ne-server.database.windows.net
                canonical name = hompus-db-ne-server.privatelink.database.windows.net.
Name:   hompus-db-ne-server.privatelink.database.windows.net
Address: 10.164.0.5
```

After executing a failover, to DNS entries have swapped servers.

```plain frame="terminal" title="bash" {11}
michael@hompus-we-vm:~$ nslookup hompus-db-group.database.windows.net
Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
hompus-db-group.database.windows.net
                canonical name = hompus-db-ne-server.database.windows.net.
hompus-db-ne-server.database.windows.net
                canonical name = hompus-db-ne-server.privatelink.database.windows.net.
Name:   hompus-db-ne-server.privatelink.database.windows.net
Address: 10.164.0.5
```

```plain frame="terminal" title="bash" {11}
michael@hompus-we-vm:~$ nslookup hompus-db-group.secondary.database.windows.net
Server:         127.0.0.53
Address:        127.0.0.53#53

Non-authoritative answer:
hompus-db-group.secondary.database.windows.net
                canonical name = hompus-db-we-server.database.windows.net.
hompus-db-we-server.database.windows.net
                canonical name = hompus-db-we-server.privatelink.database.windows.net.
Name:   hompus-db-we-server.privatelink.database.windows.net
Address: 10.164.0.4
```

This proves that connections on the virtual network will use the private link to the SQL database,
no matter which one is the current primary or secondary in the failover group.

It is also possible to connect virtual networks from other regions to the same SQL failover group,
just iterate the same steps for each region.


[BLOG_CONFIGURE_AZURE_SQL_FAILOVER_GROUP]: /2021/01/30/create-an-azure-sql-database-failover-group-with-the-azure-cli
[AZURE_PRIVATE_LINK]: https://azure.microsoft.com/services/private-link/
[AZURE_PRIVATE_LINK_DISABLE_NSG]: https://learn.microsoft.com/azure/private-link/disable-private-endpoint-network-policy
[AZ_NETWORK_VNET_SUBNET_UPDATE_COMMAND]: https://learn.microsoft.com/cli/azure/network/vnet/subnet#az_network_vnet_subnet_update
[AZ_SQL_SERVER_SHOW_COMMAND]: https://learn.microsoft.com/cli/azure/sql/server#az_sql_server_show
[AZ_NETWORK_PRIVATE_ENDPOINT_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/network/private-endpoint#az_network_private_endpoint_create
[AZ_NETWORK_PRIVATE_DNS_ZONE_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/network/private-dns/zone#az_network_private_dns_zone_create
[AZ_NETWORK_PRIVATE_DNS_LINK_VNET_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/network/private-dns/link/vnet#az_network_private_dns_link_vnet_create
[AZ_NETWORK_PRIVATE_ENDPOINT_DNS_ZONE_GROUP_CREATE_COMMAND]: https://learn.microsoft.com/cli/azure/network/private-endpoint/dns-zone-group#az_network_private_endpoint_dns_zone_group_create

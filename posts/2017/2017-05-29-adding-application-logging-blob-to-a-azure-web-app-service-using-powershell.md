---
id: 1205
title: Adding Application Logging (Blob) to an Azure Web App Service using PowerShell
date: 2017-05-29T15:48:03+02:00
updated: 2020-12-07T17:31:55+01:00
author: Michaël Hompus
excerpt: >
  The other day I wanted to configure Application Logging on Blob Storage for a Web App Service and found out this needs a SAS URL.
  And this is something an ARM template can’t provide for you.

  In this post, I will walk you through the necessary PowerShell code to run.
permalink: /2017/05/29/adding-application-logging-blob-to-a-azure-web-app-service-using-powershell/
image: /wp-content/uploads/2017/05/post-2017-05-29-thumbnail.png
categories:
  - Azure
  - PowerShell
tags:
  - ARM
  - Azure
  - PowerShell
  - SAS
  - Template
  - Web App Service
---

These days it's normal to deploy and configure all aspects of your Azure Resources using the Azure Resource Manager and the accompanying ARM Templates.
But sometimes you walk into a missing feature that's is not (yet) available in the ARM system.

The other day I wanted to configure Application Logging on Blob Storage for a Web App Service and found out this needs a SAS URL.
And this is something an ARM template cannot provide for you.

<!--more-->

In this article, I will walk you through the necessary PowerShell code to run.
For example, after your ARM template has been deployed.
At the end of this article, you will find the link to the [source code](#source-code).

## The ARM template

In the ARM template, we deploy a Storage Account and a Web App Service.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "kind": "Storage",
      "name": "loremipsumstore",
      "apiVersion": "2016-01-01",
      "sku": {
        "name": "Standard_LRS"
      },
      "location": "[resourceGroup().location]"
    },
    {
      "type": "Microsoft.Web/serverfarms",
      "kind": "app",
      "name": "LoremIpsumAppService",
      "sku": {
        "name": "B1"
      },
      "apiVersion": "2015-08-01",
      "location": "[resourceGroup().location]",
      "properties": {
        "name": "LoremIpsumAppService",
        "numberOfWorkers": 1
      },
      "resources": [
        {
          "type": "Microsoft.Web/sites",
          "kind": "app",
          "name": "LoremIpsumWebApp",
          "apiVersion": "2015-08-01",
          "location": "[resourceGroup().location]",
          "properties": {
            "name": "LoremIpsumWebApp"
          },
          "dependsOn": [
            "[resourceId('Microsoft.Web/serverfarms', 'LoremIpsumAppService')]"
          ]
        }
      ]
    }
  ]
}
```

## The problem

When we configure the Application Logging to Blob Storage using the Azure Portal,
we see the following properties in the JSON of the Web App Service using the [Azure Resource Explorer](https://resources.azure.com/).

```json
"applicationLogs":{
  "azureBlobStorage":{
    "level":"Verbose",
    "sasUrl":"https://loremipsumstore.blob.core.windows.net/webapp-logs?sv=2015-04-05&sr=c&sig=XXX…XXX&st=2017-05-29T22:00:00Z&se=2217-05-29T22:00:00Z&sp=rwdl",
    "retentionInDays":30
  }
}
```

But secretly, the last two properties are stored in the AppSettings.
When we look there, we see the following two keys:

```plain
DIAGNOSTICS_AZUREBLOBCONTAINERSASURL https://loremipsumstore.blob.core.windows.net/webapp-logs?sv=2015-04-05&sr=c&sig=XXX…XXX&st=2017-05-29T22:00:00Z&se=2217-05-29T22:00:00Z&sp=rwdl
DIAGNOSTICS_AZUREBLOBRETENTIONINDAYS 30
```

Setting AppSettings with an ARM template is not that hard.
But the URL we need to set cannot be predefined and ARM templates do not have support for the generation of a SAS URL.

Many ARM template samples _do_ use SAS URLs, but always as a parameter.
But how can you supply a parameter to a resource that might not yet exist?

That is the whole point of using the template.

So, the only option is to configure the Web App Service after running the deployment.

## The solution

For this solution, we use PowerShell. This makes it easy for running this code in a VSTS or TFS release pipeline.
But it can be used in any way you want to configure your environments.

> [!NOTE]
> Depending on how you run this script you might need to login first using `Login-AzureRmAccount`
> and select the Azure Subscription you want to use using `Select-AzureRmSubscription`.

The configuration is done in 6 steps.

1. We get the Storage Account where we want to store the Application Logs.

   ```powershell title="PowerShell"
   $sa = Get-AzureRmStorageAccount
            -ResourceGroupName "loremipsumresourcegroup"
            -Name "loremipsumstore"
   ```

2. We make sure there is a container to store the logs.
   Because we can run the script multiple times, we ignore the error if the container already exists.

   ```powershell title="PowerShell"
   New-AzureStorageContainer
        -Context $sa.Context
        -Name "webapp-logs"
        -ErrorAction Ignore
   ```

3. Next, we generate the SAS token for the container.
   We use the same settings Microsoft uses when creating the link using the Azure Portal.

   ```powershell title="PowerShell"
   $sasToken = New-AzureStorageContainerSASToken
                    -Context $sa.Context
                    -Name "webapp-logs"
                    -FullUri
                    -Permission rwdl
                    -StartTime (Get-Date).Date
                    -ExpiryTime (Get-Date).Date.AddYears(200)
   ```

4. We want to update the AppSettings as the configuration is stored there.
   But when you update the AppSettings, any setting not present in the update will be removed.
   Therefore, we first want to get all the existing AppSettings.

   ```powershell title="PowerShell"
   $webApp = Get-AzureRmWebApp
                  -ResourceGroupName "loremipsumresourcegroup"
                  -Name "LoremIpsumWebApp"
   ```

5. Strangely the `Set-AzureRmWebApp` command does not accept the `SiteConfig.AppSettings` we got from the `Get-AzureRmWebApp` command.
   We need to create a Hash Table for this.  
   To make sure the Application Settings keep the same order, we define the Hash Table as `Ordered`.

   ```powershell title="PowerShell"
   $appSettings = [ordered]@{}
   $webapp.SiteConfig.AppSettings | % { $appSettings[$_.Name] = $_.Value }
   $appSettings.DIAGNOSTICS_AZUREBLOBCONTAINERSASURL = [string]$sasToken
   ```

6. Now we can update the App Service using the `Set-AzureRmWebApp` command.

   ```powershell title="PowerShell"
   Set-AzureRmWebApp
      -ResourceGroupName "loremipsumresourcegroup"
      -Name "LoremIpsumWebApp"
      -AppSettings $appSettings
   ```

## Source code

The complete source code is available as
[GitHub Gist](https://gist.github.com/eNeRGy164/6f055a0614bcb89586b3fbdad8d99c32) for reference.

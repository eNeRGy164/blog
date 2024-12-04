---
id: 1163
title: Add secrets to your Azure Key Vault using ARM templates
date: 2017-03-20T16:33:05+01:00
updated: 2020-12-07T17:27:46+01:00
author: Michaël Hompus
excerpt: >
  Azure Key Vault is a great resource to store your secrets like passwords,
  connection strings, certificates, etc. and access them programmatically.
  A great feature is to add or update your secrets during deployment so you do not have to manage your secrets manually.
  
  In this article, I will explain how you can add secrets to an Azure Key Vault using ARM templates.
layout: ../layouts/BlogPost.astro
permalink: /2017/03/20/add-secrets-to-your-azure-key-vault-using-arm-templates/
image: /wp-content/uploads/2017/03/post-1163-thumbnail.png
categories:
  - Azure
tags:
  - ARM
  - Azure
  - Key Vault
  - secrets
  - templates
---

Azure Key Vault is a great resource to store your secrets like passwords,
connection strings, certificates, etc. and access them programmatically.
A great feature is to add or update your secrets during deployment so you do not have to manage your secrets manually.

In this article, I will explain how you can add secrets to an Azure Key Vault using ARM templates.

<!--more-->

At the end of the article, you will find the link to the [source code](#source-code).

## Creating the Key Vault

First, we create the Key Vault to store all our secrets.

You can add an access policy so you’re able to see and manage the secrets using,
for example, the Azure Portal.

To create a Key Vault, we add the following resource to the ARM template:

```json
{
  "type": "Microsoft.KeyVault/vaults",
  "name": "LoremVault",
  "apiVersion": "2015-06-01",
  "location": "[resourceGroup().location]",
  "properties": {
    "sku": {
      "family": "A",
      "name": "Standard"
    },
    "tenantId": "[subscription().tenantId]",
    "accessPolicies": [
      {
        "tenantId": "[subscription().tenantId]",
        "objectId": "CHANGETO-YOUR-USER-GUID-000000000000",
        "permissions": {
          "keys": ["All"],
          "secrets": ["All"]
        }
      }
    ]
  }
}
```

## Adding a plain text Secret

With the Key Vault in place, we can start adding secrets to it.

We add a resource to the ARM template to describe the secret.

The `name` must be prefixed with the name of the Key Vault.
We also declare that the resource depends on the Key Vault resource.
This ensures the Resource Manager does not try to store the secret before the Key Vault is created.

A secret consists of two properties:

- `contentType` contains the [media type](https://en.wikipedia.org/wiki/Media_type) of the secret
- `value` contains the value of the secret

```json {2,6-7,10}
{
  "type": "Microsoft.KeyVault/vaults/secrets",
  "name": "LoremVault/SomeSecret",
  "apiVersion": "2015-06-01",
  "properties": {
    "contentType": "text/plain",
    "value": "ThisIpsemIsSecret"
  },
  "dependsOn": ["[resourceId('Microsoft.KeyVault/vaults', 'LoremVault')]"]
}
```

## Adding a certificate as a Secret

This is almost the same a storing a plain text value.

Change the `contentType` to `application/x-pkcs12` and add the certificate as
[Base64](https://en.wikipedia.org/wiki/Base64) encoded string to the `value`:

```json {6-7}
{
  "type": "Microsoft.KeyVault/vaults/secrets",
  "name": "LoremVault/SomeCertificate",
  "apiVersion": "2015-06-01",
  "properties": {
    "contentType": "application/x-pkcs12",
    "value": "MIIV0QIBAzCC…yada…yada…RIJcq3QACAggA"
  },
  "dependsOn": ["[resourceId('Microsoft.KeyVault/vaults', 'LoremVault')]"]
}
```

Besides storing hardcoded values it is also possible to use parameters, variables,
or even the output of other resources as source for the value of your secrets.

## Adding a connection string to a Storage Account

Let's make a Secret resource containing the connection string of an Azure Storage Account.

First, we add a Storage Account resource to the ARM template:

```json
{
  "type": "Microsoft.Storage/storageAccounts",
  "kind": "Storage",
  "name": "loremipsumstore",
  "apiVersion": "2016-01-01",
  "sku": {
    "name": "Standard_LRS"
  },
  "location": "[resourceGroup().location]"
}
```

Now we add a Secret resource that is depending on the Storage Account and the Key Vault defined earlier.

The value of the secret is set with a connection string containing the first access key of the Storage Account:

```json {7}
{
  "type": "Microsoft.KeyVault/vaults/secrets",
  "name": "LoremVault/ConnectionString",
  "apiVersion": "2015-06-01",
  "properties": {
    "contentType": "text/plain",
    "value": "[concat('DefaultEndpointsProtocol=https;AccountName=loremipsumstore;', AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', 'loremipsumstore'), providers('Microsoft.Storage', 'storageAccounts').apiVersions[0]).keys[0].value, ';')]"
  },
  "dependsOn": [
    "[resourceId('Microsoft.KeyVault/vaults', 'LoremVault')]",
    "[resourceId('Microsoft.Storage/storageAccounts', 'loremipsumstore')]"
  ]
}
```

<small>Thanks to [Maarten van Sambeek](https://www.linkedin.com/in/maartenvansambeek/) for sharing this code with me.</small>

Now you have stored your connection string securely without it ever surfacing outside of your deployment.
If you use access policies so your application reads the connection string directly from Key Vault,
you do not have to store your connection string anywhere where it is readable like in a `web.config` file.

### Source code

I have created a GitHub Gist with a full working
[Key Vault deployment template sample](https://gist.github.com/eNeRGy164/19c9dea85994526052e666f4d0e734c7) for reference.

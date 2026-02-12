---
id: 1373
title: "ARM Template User-defined Functions: Build a Storage Account Connection String"
date: 2020-05-19T14:52:58+02:00
updated: 2021-07-16T22:42:40+02:00
author: Michaël Hompus
excerpt: >
  When working with ARM Templates, chances are you have set a value that was a Storage Account Connection String.
  For example as the value of an appsetting, or as a secret in Azure Key Vault, which I did as an example in a previous blog post.

  However, this does not result in the most maintainable and readable piece of JSON.
  Even worse if you have multiple connection strings in the same template.

  In this article I will show that adding a User-Defined Function to our template can improve on this.
permalink: /2020/05/19/arm-template-user-defined-functions-build-a-storage-account-connection-string/
image: /wp-content/uploads/2020/05/post-2020-05-19-thumbnail.png
categories:
  - Azure
tags:
  - ARM
  - Azure
  - Connection String
  - Function
  - Storage Account
  - Template
---

When working with ARM Templates, chances are you have set a value that was a storage account connection string.
For example, as the value of an appsetting, or as a secret in Key Vault,
which I did as an example in a [previous article](/2017/03/20/add-secrets-to-your-azure-key-vault-using-arm-templates).

However, this does not result in the most maintainable and readable piece of JSON.
Even worse if you have multiple connection strings in the same template.

In this article I will show that adding a user-defined function to our template can improve on this.

<!--more-->

The example from the earlier article.

```json {7}
{
  "type": "Microsoft.KeyVault/vaults/secrets",
  "name": "LoremVault/ConnectionString",
  "apiVersion": "2015-06-01",
  "properties": {
    "contentType": "text/plain",
    "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', 'loremipsumstore', ';AccountKey=', listKeys(resourceId('Microsoft.Storage/storageAccounts', 'loremipsumstore'), '2019-06-01').keys[0].value, ';EndpointSuffix=core.windows.net')]"
  },
  "dependsOn": [
    "[resourceId('Microsoft.KeyVault/vaults', 'LoremVault')]",
    "[resourceId('Microsoft.Storage/storageAccounts', 'loremipsumstore')]"
  ]
}
```

## User-Defined Functions

ARM templates support [user-defined functions](https://learn.microsoft.com/azure/azure-resource-manager/templates/user-defined-functions),
but I do not see them very often, to be honest, I never encountered one in the wild.

Although there are some [limitations](https://learn.microsoft.com/azure/azure-resource-manager/templates/user-defined-functions#limitations),
none of them will prevent us from improving our template.

First, we will add a `functions` array to the root of the template and add a function outline.
We must specify a `namespace`, the `name` of the function and the `output` `type` and `value`.

```json
"functions": [
  {
    "namespace": "storage",
    "members": {
      "connectionString": {
        "output": {
          "type": "string",
          "value": ""
        }
      }
    }
  }
],
```

To create a storage account connection string, we need the account name and one of the keys.
As user-defined functions cannot use the `reference` function or any of the `list*` functions,
we will need to supply these parameters to the function.

So, we add `accountName` and `accountKey` as `parameters`.

```json {2-11}
"connectionString": {
  "parameters": [
    {
      "name": "accountName",
      "type": "string"
    },
    {
      "name": "accountKey",
      "type": "string"
    }
  ],
  "output": {
    "type": "string",
    "value": ""
  }
}
```

Now we concatenate the supplied parameter values with the static parts to form a complete connection string as the `output` `value`.

```json {3}
"output": {
  "type": "string",
  "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', parameters('accountName'), ';AccountKey=', parameters('accountKey'), ';EndpointSuffix=core.windows.net')]"
}
```

## Calling the function

With this done, we can replace the original value in our template with the return value of the new method we call.

```json {7}
{
  "type": "Microsoft.KeyVault/vaults/secrets",
  "name": "LoremVault/ConnectionString",
  "apiVersion": "2015-06-01",
  "properties": {
    "contentType": "text/plain",
    "value": "[storage.connectionString('loremipsumstore', listKeys(resourceId('Microsoft.Storage/storageAccounts', 'loremipsumstore'), '2019-06-01').keys[0].value)]"
  },
  "dependsOn": [
    "[resourceId('Microsoft.KeyVault/vaults', 'LoremVault')]",
    "[resourceId('Microsoft.Storage/storageAccounts', 'loremipsumstore')]"
  ]
}
```

Although user-defined functions have quite some limitations in ARM templates,
this makes for a much cleaner and more readable template.

The full example is available as a
[GitHub Gist](https://gist.github.com/eNeRGy164/4daa1ac3d7a383074f19fcb6202d14ef).

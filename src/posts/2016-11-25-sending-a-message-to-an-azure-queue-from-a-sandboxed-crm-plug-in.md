---
id: 911
title: Sending a message to an Azure queue from a sandboxed CRM plug-in
date: 2016-11-25T07:58:11+01:00
updated: 2021-07-16T22:46:57+02:00
author: Michaël Hompus
excerpt: >
  A while back I've introduced Sandboxable.
  It's a means to use NuGet packages that normally are not available for code that runs with Partial Trust.

  In this post, we will walk through the steps to create a Microsoft Dynamics CRM plug-in that will add a message to an Azure queue.
layout: ../layouts/BlogPost.astro
permalink: /2016/11/25/sending-a-message-to-an-azure-queue-from-a-sandboxed-crm-plug-in/
image: /wp-content/uploads/2016/11/post-911-thumbnail.png
categories:
  - Azure
  - C#
  - Dynamics CRM
tags:
  - Azure
  - CRM
  - NuGet
  - Plugin
  - Queue
  - Sandbox
  - SDK
---

A while back I have "[introduced Sandboxable](/2016/07/13/introducing-sandboxable-use-your-favorite-azure-nuget-packages-in-a-sandbox-environment)".
It is a means to use NuGet packages that normally are not available for code that runs with Partial Trust.

In this article, I will walk through the steps to create a Microsoft Dynamics CRM plug-in that will add a message to an Azure queue.

<!--more-->

At the end of the article, you will find the links to the [complete source code](#sample-code) for you to use.

## Setting up the project

1. Create a new `Class Library` project in Visual Studio.
2. Add the following NuGet packages with their dependencies:
   - `Microsoft.CrmSdk.CoreAssemblies`  
      This package will add the base to create a plug-in for CRM
   - `MSBuild.ILMerge.Task`  
      This package makes sure that the generated assembly will also contain all dependencies.  
      More information about this package can be found on the [ILMerge MSBuild task NuGet package CodePlex page](https://web.archive.org/web/20200414123005/https://archive.codeplex.com/?p=ilmergemsbuild)
   - `Sandboxable.Microsoft.WindowsAzure.Storage`  
      This package provides the Azure storage SDK, modified to run in the sandbox.
3. Change the `Copy Local` property for the CRM references to `false`.
   These assemblies are already present in the runtime hosting the sandbox, so they can be kept outside our assembly
4. Enable strong name key signing on your project

Now you can do a test build of the project to check if everything works correctly.

## Writing the plug-in

I've based the plug-in code on the MSDN article "[Write a plug-in](<https://learn.microsoft.com/previous-versions/dynamicscrm-2016/developers-guide/gg328263(v=crm.8)>)".

### Getting the connection details

To connect to an Azure queue, you need 3 details.

1. The storage account name.
2. One of the storage account access keys.
3. The name of the queue.

There are several ways to get these details at runtime.
To name a few: hard-coded, stored as data in an entity,
stored in a web resource as an XML file or in the plug-in step configuration.

For this sample we'll use a JSON string stored in the secure storage property of the plug-in step.

To deserialize these settings we use `JsonConvert` with a nested `PluginSettings` class.

```csharp
PluginSettings pluginSettings =
      JsonConvert.DeserializeObject<PluginSettings>(this.secureString);
```

### Initializing the Cloud Queue Client

The [`CloudQueueClient` class](https://learn.microsoft.com/dotnet/api/microsoft.azure.storage.queue.cloudqueueclient?view=azure-dotnet-legacy) offers a straightforward way to manage and use Azure queues.

To initialize this class, we need to provide the URL and the [StorageCredentials](https://learn.microsoft.com/dotnet/api/microsoft.azure.storage.auth.storagecredentials?view=azure-dotnet-legacy).

```csharp
StorageCredentials storageCredentials =
      new StorageCredentials(pluginSettings.AccountName, pluginSettings.Key);

Uri baseUri =
      new Uri($"https://{pluginSettings.AccountName}.queue.core.windows.net");

CloudQueueClient queueClient =
      new CloudQueueClient(baseUri, storageCredentials);
```

### Creating a reference to the queue

With the queue client, we can create a reference to the [CloudQueue](https://learn.microsoft.com/dotnet/api/microsoft.azure.storage.queue.cloudqueue?view=azure-dotnet-legacy) with the name that is stored in the constant named `QueueName`.

To make sure the queue exists, we call the [`CreateIfNotExists` method](https://learn.microsoft.com/dotnet/api/microsoft.azure.storage.queue.cloudqueue.createifnotexists?view=azure-dotnet-legacy) which ensures us if there is not a queue present yet, it will be created for us at that moment.

```csharp
CloudQueue queue = queueClient.GetQueueReference(QueueName);

queue.CreateIfNotExists();
```

### Adding the message to the queue

We create some message data, using the context of the current plug-in execution.
This data is wrapped in a [CloudQueueMessage](https://learn.microsoft.com/dotnet/api/microsoft.azure.storage.queue.cloudqueuemessage?view=azure-dotnet-legacy).

We add the message to the queue,
using the [`AddMessage` method](https://learn.microsoft.com/dotnet/api/microsoft.azure.storage.queue.cloudqueue.addmessage?view=azure-dotnet-legacy) and we are done!

```csharp
var messageData = new
{
  context.UserId,
  context.MessageName,
  entity.LogicalName,
  entity.Id,
  entity.Attributes
};

CloudQueueMessage queueMessage =
      new CloudQueueMessage(JsonConvert.SerializeObject(messageData));

queue.AddMessage(queueMessage);
```

We must build our project again so we can proceed.

## Register the plug-in assembly

Now the freshly baked assembly needs to be registered on the server.  
The steps to do this are outside the scope for this post but more information can be found in the
[Walkthrough: Register a plug-in using the plug-in registration tool](<https://learn.microsoft.com/previous-versions/dynamicscrm-2016/developers-guide/gg309580(v=crm.8)>).

## Register the plug-in step for an event

To test the plug-in, we’ll register it on the creation event of the `contact` entity.  
For performance optimization we’ll choose the asynchronous execution method.

> [!WARNING]
> External resources should never be part of your synchronous pipeline.

In the `Secure Configuration` property, we set the value with the JSON object containing the connection information:

```json
{
  "AccountName": "loremipsum",
  "Key": "DDWLOREM...IPSUMr0A=="
}
```

<small>(Obviously, these values do not represent real data)</small>

![Register the plug-in step for the creation event of contact entities](/wp-content/uploads/2016/11/register-new-step.png)

## Testing the plug-in

We create a new contact in CRM called _Sample User_.

After a couple of seconds, we see the following message appear on the queue:

```json
{
  "UserId":"d617a1a0-359a-e411-9407-00155d0ae259",
  "MessageName":"Create",
  "LogicalName":"contact",
  "Id":"6e843a34-91b1-e611-80e4-00155d0a0b40",
  "Attributes":[
    {
      "Key":"firstname",
      "Value":"Sample"
    },
    {
      "Key":"lastname",
      "Value":"User"
    },
    {
      "Key":"fullname",
      "Value":"Sample User"
    },
    ...
  ]
}
```

<small>(Formatted for readability)</small>

## Concluding

By utilizing the Azure SDK, we only needed a few lines of code to send messages to an Azure queue and making all sorts of integration with other systems possible.

By using the Sandboxable project we’re no longer limited by the sandbox.

## Sample code

The complete source code is available as [sample project](https://github.com/Winvision/Sandboxable-Samples/tree/master/src/CrmQueue).

Expect more samples in the [**Sandboxable-Samples** repository on GitHub](https://github.com/Winvision/Sandboxable-Samples) in the future.

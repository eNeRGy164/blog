---
id: 1389
title: Link an Azure Web App to a Container Registry using ARM templates
date: 2020-05-22T13:30:19+02:00
updated: 2021-07-29T09:35:44+02:00
author: Michaël Hompus
excerpt: >
  Using Docker images for your Azure web app is not brand-new functionality.
  But if you want to deploy your container-based web app using ARM templates and use your own Azure container registry,
  you might discover it's not as straightforward as you might think.

  In this article we will walk through the steps how we can make a connection to the container registry.
  In the end we will also make sure we do not have to pass along the password during the deployment.
permalink: /2020/05/22/link-an-azure-web-app-to-a-container-registry-using-arm-templates/
image: /wp-content/uploads/2020/05/post-2020-05-22-thumbnail.png
categories:
  - Azure
tags:
  - ARM
  - Azure
  - Container Registry
  - Linux
  - Template
  - Web App
---

Using Docker images for your Azure web app is not brand-new functionality.
But if you want to deploy your container-based web app using ARM templates and use your own Azure container registry,
you might discover it's not as straightforward as you might think.

In this article we will walk through the steps how we can make a connection to the container registry.
In the end we will also make sure we do not have to pass along the password during the deployment.

<!--more-->

## Prerequisites

To begin, I have already an Azure container registry with the latest nginx image pushed as described in the
"[Push your first image to a private Docker container registry using the Docker CLI](https://learn.microsoft.com/azure/container-registry/container-registry-get-started-docker-cli?tabs=azure-cli)" article.

## Deploying the Web App

We will start with the web app, in this case a Linux container.

```json
{
  "type": "Microsoft.Web/sites",
  "apiVersion": "2018-11-01",
  "name": "appName",
  "location": "[resourceGroup().location]",
  "kind": "app,linux,container",
  "properties": {
    "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', 'appPlanName')]"
  }
}
```

Next, we link the Docker image we want to use. This is set with the `linuxFxVersion` property.

```json {6}
{
  "type": "Microsoft.Web/sites/config",
  "apiVersion": "2018-11-01",
  "name": "appName/web",
  "properties": {
    "linuxFxVersion": "DOCKER|hompus.azurecr.io/samples/nginx:latest"
  },
},
```

## The problem

But, unless you deploy in the same resource group as the container registry, this will fail.

If you use the Azure portal to create a web app with a connection to your container registry,
you can see three _appsettings_ on the app that contain the connection properties with a URL,
a username, and a password.

## The solution

So, we will add the URL, username, and password to the template.

```json {6-8}
{
  "type": "Microsoft.Web/sites/config",
  "apiVersion": "2018-11-01",
  "name": "appName/appsettings",
  "properties": {
    "DOCKER_REGISTRY_SERVER_URL": "hompus.azurecr.io",
    "DOCKER_REGISTRY_SERVER_USERNAME": "hompus",
    "DOCKER_REGISTRY_SERVER_PASSWORD": "an admin password",
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE": "false"
  }
}
```

This works! But to be honest, we should not store passwords in our template,
and therefore in a source repository.

Of course, we can set it as a parameter, but you will still need to provide during deployment,
and that means storing/retrieving it somewhere else and surfacing the password outside the Azure Resource Manager.

## A better solution

It would be nice if we could use a [Managed Identity](https://learn.microsoft.com/azure/app-service/overview-managed-identity?tabs=portal%2Cdotnet)
which we grant the [`AcrPull`](https://learn.microsoft.com/azure/role-based-access-control/built-in-roles#acrpull) rights.
But at this moment this is not possible.
So, we will have to settle for using the Resource Manager to get the details of the container registry for us.

For this to work we need a [`resourceId`](https://docs.microsoft.com/en-us/azure/azure-resource-manager/templates/template-functions-resource#resourceid) pointing to the container registry.

Besides the required `resourceType` and `resourceName` of the container registry, you will need to supply the `resourceGroupName` and, if the registry is in another subscription, the `subscriptionId`.

First, we add variables (or parameters) to build the `resourceId`.

```json {5}
"variables": {
  "registrySubscriptionId": "a-subscription-id",
  "registryResourceGroup": "registry-resource-group-name",
  "registryName": "hompus",
  "registryResourceId": "[resourceId(variables('registrySubscriptionId'), variables('registryResourceGroup'), 'Microsoft.ContainerRegistry/registries', variables('registryName'))]"
},
```

Then, we add update the appsettings for the web app.

```json {6-8}
{
  "type": "Microsoft.Web/sites/config",
  "apiVersion": "2018-11-01",
  "name": "appName/appsettings",
  "properties": {
    "DOCKER_REGISTRY_SERVER_URL": "[reference(variables('registryResourceId'), '2019-05-01').loginServer]",
    "DOCKER_REGISTRY_SERVER_USERNAME": "[listCredentials(variables('registryResourceId'), '2019-05-01').username]",
    "DOCKER_REGISTRY_SERVER_PASSWORD": "[listCredentials(variables('registryResourceId'), '2019-05-01').passwords[0].value]",
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE": "false"
  }
}
```

Now, we have removed the need for hardcoded, or supplied secrets.
And the Azure Resource Manager takes care of handling the secrets for us.

The full example is available as a
[GitHub Gist](https://gist.github.com/eNeRGy164/32150b536ae741e68e06dece5f8b16c5).

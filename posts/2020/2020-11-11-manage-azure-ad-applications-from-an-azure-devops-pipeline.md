---
id: 1688
title: Manage Azure AD applications from an Azure DevOps Pipeline
date: 2020-11-11T14:09:22+01:00
updated: 2021-07-16T22:30:49+02:00
author: Michaël Hompus
excerpt: >
  A lot of people prefer to manage their infrastructure as code.
  Some infrastructures might require an App Registration in an Azure AD.
  So, why would we not apply the IaC practice here as well?

  An Azure pipeline might stop you, stating “Insufficient privileges to complete the operation”.
  So, this is not possible, or is it?

  In this article I will show you how to make an Azure pipeline in charge of apps in your Azure AD.
permalink: /2020/11/11/manage-azure-ad-applications-from-an-azure-devops-pipeline/
image: /wp-content/uploads/2020/11/post-1688-thumbnail.jpg
categories:
  - Azure
tags:
  - AAD
  - AD
  - Azure
  - CLI
  - DevOps
  - IaC
  - Infrastructure as Code
  - Pipelines
---

A lot of people prefer, for good reasons, to manage their infrastructure as code (IaC).
Some infrastructures might require an App Registration in an
[Azure AD](https://www.microsoft.com/security/business/identity-access/microsoft-entra-id).
So, why would we not apply the IaC practice here as well?

An [Azure pipeline](https://azure.microsoft.com/products/devops/pipelines/) might stop you,
stating `Insufficient privileges to complete the operation`.
So, this is not possible, or is it?

In this article I will show you how to make an Azure pipeline in charge of apps in your Azure AD.

<!--more-->

## Configuring an Azure pipeline

Before we configure the pipeline a connection to the Azure subscription needs to be in place.

### Connecting to the subscription

If there currently is no connection between the
[Azure DevOps](https://azure.microsoft.com/products/category/devops) environment and the Azure subscription,
it is very straight forward to create one.
There are several ways to do this.
The details can be found on the [Connect to Microsoft Azure](https://learn.microsoft.com/azure/devops/pipelines/library/connect-to-azure)
page of the Azure pipelines documentation site.

![Screenshot of the “new Azure service connection” pane in Azure pipelines. It has an Azure subscription selected and uses “Azure” as Service connection name.](/wp-content/uploads/2020/11/azure_pipeline_service_connection.png "The configuration of a new Azure service connection.")

Using this automatic configuration of a service principal will make sure the Azure pipeline can create resources in the Azure subscription.

### Building a pipeline

To create an Azure pipeline, you need a repository.
An empty one suffices.

An existing pipeline can be modified, or a new one can be created with the "New pipeline" wizard.

For this example, I choose the "Starter pipeline" and removed the two default steps that come with the template.

```yaml
trigger:
  - master

pool:
  vmImage: ubuntu-latest

steps:
```

Add the [Azure CLI Task](https://learn.microsoft.com/azure/devops/pipelines/tasks/reference/azure-cli-v2) as a step.
This task is the place to define scripting commands to execute when the pipeline is running.
Select the Azure subscription that is available, here the `Azure` connection is used that is described in the previous chapter.

For this example, I use PowerShell Core, but this can be done with the other available scripting languages just as easy.

```yaml
steps:
  - task: AzureCLI@2
    inputs:
      azureSubscription: Azure
      scriptType: pscore
      scriptLocation: inlineScript
      inlineScript: |
        # Place scripting here
```

This is the spot to write the commands to create the Azure AD app.
This is done with the [`az ad app create` command](https://learn.microsoft.com/cli/azure/ad/app#az_ad_app_create).

We capture the `appId` for other configuration steps that I will add later.

```powershell title="PowerShell"
$appId = (az ad app create --display-name AuthTest --homepage https://mhauthtest.azurewebsites.net --identifier-uris https://mhauthtest.azurewebsites.net --reply-urls https://mhauthtest.azurewebsites.net/.auth/login/aad/callback --query 'appId' -o tsv)

Write-Host "App ID: $appId"
```

The pipeline can now be committed to the repository.

## Running into issues

When running the pipeline and the Azure CLI task executes, the following output is logged.

```plain {5-6}
/usr/bin/az cloud set -n AzureCloud
/usr/bin/az login --service-principal -u *** --password=*** --tenant *** --allow-no-subscriptions
/usr/bin/az account set --subscription 2036eb16-59ca-***
/usr/bin/pwsh -NoLogo -NoProfile -NonInteractive …
Insufficient privileges to complete the operation.
App ID:
```

Although the service principal is a `Contributor` on the Azure subscription,
no operations on the connected Azure AD are allowed.

## Supplying the right permission

Attempts with assigning administrator roles to the service principal came up fruitless.
But this [bug report from 2018](https://github.com/Microsoft/azure-pipelines-tasks/issues/7710) put me on the right track.

First, go to the Azure app registration for the pipeline in the Azure portal.

![Screenshot of app registrations in the Azure portal with the pipeline app listed.](/wp-content/uploads/2020/11/azure_pipeline_application.png "The Azure pipeline app registration.")

On the <kbd>API permissions</kbd> pane, choose to <kbd>Add a permission</kbd>.
Select the <kbd>Azure Active Directory Graph</kbd> as the API of choice
and select the `Application.ReadWrite.OwnedBy` permission.

![Screenshot of the “Request API permissions” pane. The “Application.ReadWrite.OwnedBy” permission is selected.](/wp-content/uploads/2020/11/azure_pipeline_add_api_permission.png "The `Application.ReadWrite.OwnedBy` permission is selected.")

> [!NOTE]
> You can also choose the `Application.ReadWrite.All` permission if this suits your situation better.

After saving, an administrator with the required privileges needs to consent to this permission.

![Screenshot showing the added permission, but an admin needs to grant consent. There is a button on top for an admin to do so.](/wp-content/uploads/2020/11/azure_pipeline_grant_consent.png "An admin needs to grant consent.")

Now we can go back to the pipeline.

When the pipeline is executed again, the exception is gone, and an application is created.

```plain {5}
/usr/bin/az cloud set -n AzureCloud
/usr/bin/az login --service-principal -u *** --password=*** --tenant *** --allow-no-subscriptions
/usr/bin/az account set --subscription 2036eb16-59ca-***
/usr/bin/pwsh -NoLogo -NoProfile -NonInteractive
App ID: 99ad3d31-0eb5-49b0-b17c-02488d18e232
```

## More configuration in the pipeline

Now that the pipeline can create the application, you can add more configuration.

For example, permissions can be added with the
[`az ad app permission` command](https://learn.microsoft.com/cli/azure/ad/app/permission#az_ad_app_permission_addand)
credentials (like client secrets) can be (re)set with the
[`az ad app credential` command](https://learn.microsoft.com/cli/azure/ad/app/credential#az_ad_app_credential_reset).

```powershell title="PowerShell"
# Add permission to sign in and read user profile
az ad app permission add --id $appId --api 00000002-0000-0000-c000-000000000000 --api-permissions 311a71cc-e848-46a1-bdf8-97ff7156d8e6=Scope

# Generate a new client secret
$password = (head /dev/urandom | tr -dc [:alnum:] | fold -w 30 | head -n 1)
# Set the new client secret
az ad app credential reset --id $appId --password $password -o none
```

When running the pipeline again, the log shows the cli command has recognized the existing application and updates the configuration accordingly.

```plain {1}
Found an existing application instance of "99ad3d31-0eb5-49b0-b17c-02488d18e232". We will patch it
App ID: 99ad3d31-0eb5-49b0-b17c-02488d18e232
```

Now the management of Azure AD apps is part of our Infrastructure as Code.

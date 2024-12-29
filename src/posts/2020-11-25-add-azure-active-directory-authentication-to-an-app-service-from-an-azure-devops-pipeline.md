---
id: 1742
title: Add Azure Active Directory authentication to an App Service from an Azure DevOps Pipeline
date: 2020-11-25T12:44:13+01:00
updated: 2021-07-16T22:28:49+02:00
author: Michaël Hompus
excerpt: >
  Azure App Services make it quite easy for you to add one or more authentication providers to your application.
  But how do you add Azure AD as a provider using Infrastructure as Code?

  In this article I will show you the steps of deploying and securing an Azure App Service with AAD authentication using an Azure pipeline.
permalink: /2020/11/25/add-azure-active-directory-authentication-to-an-app-service-from-an-azure-devops-pipeline/
image: /wp-content/uploads/2020/11/post-1742-thumbnail.jpg
categories:
  - Azure
tags:
  - AAD
  - Active Directory
  - AD
  - ARM
  - Azure
  - CLI
  - DevOps
  - IaC
  - Infrastructure as Code
  - Pipelines
---

Azure App Services make it quite easy for you to add one or more authentication providers to your application.
But how do you add Azure AD as a provider using Infrastructure as Code?

In this article I will show you the steps of deploying and securing an Azure App Service with AAD authentication using an Azure pipeline.

<!--more-->

> [!NOTE]
> I will be referencing some parts of my previous article
> [Manage Azure AD applications from an Azure DevOps Pipeline](/2020/11/11/manage-azure-ad-applications-from-an-azure-devops-pipeline).

## Setting up the web app deployment

Before we can add authentication to a web application, first the infrastructure must be deployed.

For the deployment I will use a simple ARM template that consists of a Linux app service,
a site and a couple of configuration settings.
In this case I will set it up for use with the latest PHP stack.
The ARM template has a single parameter called `siteName` to use for the name of the site and app service.

As this article is not about deploying a web app using an ARM template,
I will not embed the contents here, but you can find the whole
[deployment file](https://github.com/eNeRGy164/AzDO.Pipelines.AppService.AADAuth/blob/main/arm-deployment.json) in my GitHub repo.

### Web content

I have kept the contents of this web page purposely simple.
The [`index.php`](https://github.com/eNeRGy164/AzDO.Pipelines.AppService.AADAuth/blob/main/index.php) file contains some simple scripting to show the web app is working correctly.

```php title="index.php"
<html>
<body>
<h1><?php echo 'Hello World' ?></h1>
<div><?php echo 'Current PHP version: ' . phpversion() ?></div>
</body>
</html>
```

## Configuring the pipeline

I will skip over the steps of connecting an Azure subscription and creating an empty pipeline.
These steps are already described in the chapter "[Configuring an Azure pipeline](/2020/11/11/manage-azure-ad-applications-from-an-azure-devops-pipeline#configuring-an-azure-pipeline)" in my previous article.

With the empty pipeline as a base, we need three tasks to deploy this web application.
I will add the `siteName` as a variable to the pipeline, so it can be reused in the tasks that will be added.

```yaml title="azure-pipelines.yml"
variables:
  siteName: hompus-demo
```

The first step is the [Azure Resource Group Deployment task](https://learn.microsoft.com/azure/devops/pipelines/tasks/reference/azure-resource-group-deployment-v2) to deploy the ARM template into a resource group.

```yaml title="azure-pipelines.yml"
- task: AzureResourceManagerTemplateDeployment@3
  inputs:
    azureResourceManagerConnection: Azure
    resourceGroupName: $(siteName)-resourcegroup
    location: West Europe
    csmFile: arm-deployment.json
    overrideParameters: -siteName $(siteName)
```

As it is not possible to deploy a single php file to a web app,
zip it with the [Archive Files task](https://learn.microsoft.com/azure/devops/pipelines/tasks/reference/archive-files-v2),
then use the [Azure App Service Deploy task](https://learn.microsoft.com/zure/devops/pipelines/tasks/reference/azure-rm-web-app-deployment-v4)
to deploy the archive to the created web site.

```yaml title="azure-pipelines.yml"
- task: ArchiveFiles@2
  inputs:
    rootFolderOrFile: $(Build.SourcesDirectory)/index.php
    includeRootFolder: false
    archiveFile: $(Pipeline.Workspace)/$(Build.BuildId).zip
- task: AzureRmWebAppDeployment@4
  inputs:
    azureSubscription: Azure
    appType: webAppLinux
    WebAppName: $(siteName)
    packageForLinux: $(Pipeline.Workspace)/*.zip
```

After executing the pipeline, there is now an anonymous web site running in Azure.

![Screenshot of a browser showing that the website is working.](/wp-content/uploads/2020/11/azure_pipeline_hello_world.png "The website is working.")

## Adding Azure AD authentication

To add Azure AD as an authentication provider, an Azure AD app needs to be configured. For all details,
I am pointing to my [previous article](/2020/11/11/manage-azure-ad-applications-from-an-azure-devops-pipeline) again.

In summary, an [Azure CLI task](https://learn.microsoft.com/azure/devops/pipelines/tasks/reference/azure-cli-v2) is added.
In this pipeline as the second step, after the ARM template is deployed.

```yaml title="azure-pipelines.yml"
- task: AzureCLI@2
  inputs:
    azureSubscription: Azure
    scriptType: pscore
    scriptLocation: inlineScript
    inlineScript: |
```

It contains the following contents as inline script:

> [!NOTE]
> newlines between parameters are only added for readability

```powershell title="inlineScript" frame="code"
# Create application
$appId = (az ad app create
      --display-name 'Auth $(siteName)'
      --homepage https://$(siteName).azurewebsites.net
      --identifier-uris https://$(siteName).azurewebsites.net
      --reply-urls https://$(siteName).azurewebsites.net/.auth/login/aad/callback
      --query 'appId'
      --output tsv)
Write-Host "App ID: $appId"

# Add permission to sign in and read user profile
az ad app permission add
                    --id $appId
                    --api 00000002-0000-0000-c000-000000000000
                    --api-permissions 311a71cc-e848-46a1-bdf8-97ff7156d8e6=Scope

# Generate new client secret
$password = (head /dev/urandom | tr -dc [:alnum:] | fold -w 30 | head -n 1)
# Set client secret
az ad app credential reset --id $appId
                           --password $password
                           --output none
```

Now, to add authentication, only the [`az webapp auth update` command](https://learn.microsoft.com/cli/azure/webapp/auth#az_webapp_auth_update) has to be added.
This makes the app service use the created Azure AD app as a means to authenticate visitors to the web site.

```powershell title="inlineScript" frame="code"
# Update Web App Authentication
az webapp auth update --name $(siteName)
                      --resourcegroup $(siteName)-resourcegroup
                      --enabled true
                      --action LoginWithAzureActiveDirectory
                      --aad-client-id $appId
                      --aad-client-secret $password
                      --token-store true
                      --output none
```

After executing the pipeline with the updated configuration,
nobody is able to view the page anonymously anymore and visitors need to supply a valid Azure AD account to see the page again.

![Screenshot showing an authentication prompt for the web site.](/wp-content/uploads/2020/11/azure_pipeline_login.png "The Azure AD authentication prompt for the web site.")

Looking in the Azure Portal, it is possible to confirm that the pipeline has configured all settings as requested.

![Screenshot of the Azure portal showing the configured App Service Authentication settings.](/wp-content/uploads/2020/11/azure_pipeline_configured.png)

## Source code

I have shared all the related source code in the [AzDO.Pipelines.AppService.AADAuth](https://github.com/eNeRGy164/AzDO.Pipelines.AppService.AADAuth) GitHub repository.

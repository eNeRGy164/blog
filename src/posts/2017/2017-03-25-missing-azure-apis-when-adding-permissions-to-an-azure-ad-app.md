---
id: 1177
title: “Missing” Azure APIs when adding permissions to an Azure AD app
updated: 2020-12-07T17:29:56+01:00
date: 2017-03-25T12:57:15+01:00
author: Michaël Hompus
excerpt: >
  When I recently was configuring an Azure AD application,
  I couldn’t assign the delegated permissions for an Azure SQL Database.
  It did cost me a full day to find out the Azure Portal user interface has an unexpected user interaction when it comes to selecting APIs.

  In this post, I’ll explain how you can find all APIs available for your application.
permalink: /2017/03/25/missing-azure-apis-when-adding-permissions-to-an-azure-ad-app/
image: /wp-content/uploads/2017/03/post-1177-thumbnail.png
categories:
  - Azure
tags:
  - AD
  - App
  - Azure
  - Portal
  - UI
---

When I recently was configuring an Azure AD application,
I could not assign the delegated permissions for an Azure SQL Database.
It did cost me a full day to find out the Azure Portal user interface has an unexpected user interaction when it comes to selecting APIs.

In this article, I will explain how you can find all APIs available for your application.

<!--more-->

## The problem

When we want to integrate an application with Azure AD, we need to register an app.

In my case I want to let a user access an Azure SQL Database using delegation.
So, the database connection will be created impersonating the user account, not a generic service account.

To grant delegation permissions to an API we go to the <kbd>Required permissions</kbd> section of the Azure AD app:

![Required permissions menu item](/wp-content/uploads/2017/03/required-permissions-link.png "Required permissions menu item")

When we've created a new app there is not much showing yet, other than the default Azure AD delegated permission to sign in as the user:

![Required permissions pane with default entry](/wp-content/uploads/2017/03/required-permissions-pane.png "Required permissions pane with default entry")

We click on the <kbd>Add</kbd> button and choose the <kbd>Select an API</kbd> option:

![Select an API menu item](/wp-content/uploads/2017/03/select-an-api.png "Select an API menu item")

Here we get a list of APIs to choose from. But our Azure SQL Database is not listed.

There is a search function, but entering <kbd>SQL</kbd>, like my colleague [Remco Ploeg](https://www.linkedin.com/in/remcoploeg/) did, did not list any results.

This is where I started to search online if other people encountered the same problem.
One of the few related posts is by Michael Collier:
[Connect to Azure SQL Database by Using Azure AD Authentication](https://michaelcollier.wordpress.com/2016/11/03/connect-to-azure-sql-database-by-using-azure-ad-authentication/).

In his post he mentions not having the API listed:

> Before you can continue, you need to have followed the prerequisites steps stated at the top of this post.
> You especially need to be sure you have created an Azure AD contained database user.
> If you fail to do that, you will not see "Azure SQL Database" in the list (as specified below).

But following all his steps did not make the API appear.

After wasting more time not finding any other related posts,
adjusting multiple settings, and recreating Azure AD apps,
I suddenly found a lead that pointed me in the right direction

## The solution

One of the apps I created was named `AzureSqlAppTest`.
Because the list of registered apps is quite long,
I wanted to use the search function and I entered the word <kbd>SQL</kbd>.

To my surprise no results.

Entering <kbd>AzureSQL</kbd> _did_ show my app, So, …

> [!WARNING]
> The search function in the Azure Portal **is acting as a "Begins With" only filter!**

Desperately, I tried this trick on the API list as well.
Maybe the API search function does not show SQL related APIs because the name does not start with <kbd>SQL</kbd>.

Instead of SQL I entered <kbd>Azure </kbd> in the search box, and to my amazement:
a whole new list of never-before-seen APIs showed up, including our Azure SQL Database:

![Select an API pane listing many APIs that where hidden](/wp-content/uploads/2017/03/select-an-api-search-results.png)

> [!WARNING]
> There are many more APIs available in the Azure Portal, **there is just no indication in the UI!**

After re-reading Michael Colliers blog post,
I found he did mention this at the end of one of the steps:

> 3\. Add a new required permission and select Azure SQL Database as the API.
> _You’ll want to search for “azure” to get “Azure SQL Database” to appear in the list._

Now we can configure our app, and everything will work as expected.

## The conclusion

Just because the Azure Portal UI does not give any hint there are many more APIs hidden behind the search function,
I wasted a lot of good time.

I hope this post will prevent you from wasting yours, and I hope the Portal UI will improve.

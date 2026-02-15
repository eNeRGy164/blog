---
id: 181
title: Using the people picker over a one-way trust
date: 2010-06-01T15:04:56+02:00
updated: 2020-12-06T17:20:46+01:00
author: Michaël Hompus
excerpt: >
  When you have a SharePoint farm and you want to use accounts from another domain you need a partial (one-way) or a full (two-way) trust between those domain.

  A full trust is not always desirable and there your problem begins.
  After setting up the one-way trust you can authenticate with an account from the trusted domain,
  but the SharePoint People Picker doesn't show any accounts from this domain.

  It has been documented by others before, but as I ran into this recently I'll give my summary how I fixed this.
permalink: /2010/06/01/using-the-people-picker-over-a-one-way-trust/
image: /wp-content/uploads/2010/06/post-2010-06-01-thumbnail.png
categories:
  - SharePoint
tags:
  - Domain
  - People Picker
  - SharePoint 2007
  - SharePoint 2010
  - Trust
  - WSS 3.0
thumbnail:
  title: "People Picker Over a One-Way Trust"
  subtitle: >
    Configuring SharePoint People Picker to resolve accounts from a trusted domain over a one-way trust.
---

When you have a SharePoint farm and you want to use accounts from another domain you need a partial (one-way) or a full (two-way) trust between those domains.

A full trust is not always desirable and there your problem begins.
After setting up the one-way trust you can authenticate with an account from the trusted domain,
but the SharePoint People Picker won't show any accounts from this domain.

It has been documented by others before, but as I ran into this recently, I will give my summary how I fixed this.  
This solution is the same for WSS 3.0/SharePoint 2007 as SharePoint 2010.

## The problem

When using a one-way trust, you do not see any accounts from the other domain in the people picker.

![SharePoint People Picker not showing any accounts.](/wp-content/uploads/2010/06/people-picker-no-results.png "People picker not showing accounts from the other domain.")

## The reason

This is an example of how you could use a partial trust.

![Architecture with a company and a development domain setup with a partial trust.](/wp-content/uploads/2010/06/one-way-trust-architecture.png "Example of a one-way trust architecture.")

You want to allow employees to authenticate in a development farm, but you do not want to allow any test or service account from the development domain to authenticate in the company domain.

As the application pool account is based in the development domain it doesn’t have the right to query the company domain.

## The solution

Using [STSADM](<https://learn.microsoft.com/previous-versions/office/sharepoint-2007-products-and-technologies/cc261956(v=office.12)>)
we can configure which forests and domains are searched for accounts by setting the `peoplepicker-searchadforests` property.
The best part is that we can supply a username and password for a trusted domain.

SharePoint does not allow you to store this username and password in plain text on the server.
So, you will have to configure a _secure store_.
If you skip this step, configuring the search account for trusted domains will always fail with the following message.

> "Cannot retrieve the information for application credential key."

To create a credential key, you will have to use the following command.

```shell
stsadm -o setapppassword
       -password <password>
```

This command has to be executed on _every_ server in the farm.

Now you can configure the forests and domains you want to search using the following command.

```shell
stsadm -o setproperty
       -url <web application url>
       -pn peoplepicker-searchadforests
       -pv forest:<source forest>;domain:<trusted domain>,<trusted domain>\<account>,<password>
```

You can combine any number of forests and domains, but you need to specify at least one.  
You also need to include all forests and domains in one statement because every time you execute this command it will reset the current settings.

Also note this setting is per web application, and even per zone.

![SharePoint People Picker showing an account from the one-way trusted domain.](/wp-content/uploads/2010/06/people-picker-with-results.png "People picker showing accounts from the other domain.")

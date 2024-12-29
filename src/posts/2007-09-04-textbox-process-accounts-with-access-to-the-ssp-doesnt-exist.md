---
id: 8
title: "Textbox “Process Accounts with Access to the SSP” doesn’t exist"
date: 2007-09-04T15:23:00+02:00
updated: 2020-12-02T22:22:09+01:00
author: Michaël Hompus
excerpt: >
  I had a lot of trouble using impersonation with the PSI web services in Project Server 2007.
  I found some posts on the web suggesting that you need to add the account to the
  “Process Accounts with Access to the SSP” textbox, but guess what?
  That box was nowhere to find!
permalink: /2007/09/04/textbox-process-accounts-with-access-to-the-ssp-doesnt-exist/
image: /wp-content/uploads/2007/09/post-8-thumnail-1.png
categories:
  - Project Server
tags:
  - Project Server 2007
  - SSP
  - stsadm
  - WSS 3.0

# cSpell:ignore editssp, sspname, enumssp
---

I had a lot of trouble using impersonation with the PSI web services in Project Server 2007.
I found some posts on the web suggesting that you need to add the account to the `Process Accounts with Access to the SSP` textbox,
but guess what? That box was nowhere to be found!

<!--more-->

I found one post in the [Setup/Installation Related FAQ's][SETUP_INSTALLATION_RELATED_FAQ] of the "Project Server 2007 VSTS Connector" on CodePlex.
It says:

> Sometimes the textbox for "Process Accounts with Access to the SSP" will not exist on the web page.
> To add the account in this circumstance, go to the command line, navigate to
> Program Files\Common Files\Microsoft Shared\web server extensions\12\BIN and run:
>
> stsadm.exe -o editssp -title &lt;sspname&gt; -setaccounts &lt;accounts&gt;

So, since my SSP is called `SharedServices1` to following line did miracles:

```shell
stsadm.exe -o editssp -title SharedServices1 -setaccounts domain\user
```

Reading the [documentation][STSADM_EDITSSP] of the `stsadm` application,
it mentions that "New process accounts should be appended to the existing list".
So, if you execute the above line any existing configuration of accounts will be gone.

To view a list of current configured account you can use the `-enumssp` option:

```shell
stsadm.exe -o enumssp -title SharedServices1
```

This will return the details of the SSP (in XML):

```xml
<ssps>
  <ssp name="SharedServices1" default="true" ssl="False" status="Online">
    <account username="NT AUTHORITY\NETWORK SERVICE" />
    <site type="Administration" url="http://server:4389/ssp/admin" />
    <database type="ServiceDatabase"
              server="server\OfficeServers"
              name="SharedServices1_DB_2b6d2c6a-2374-4f0f-8d1e-e4577988aa80"
              authentication="Windows">
    <processaccounts>
      <account username="domain\user">
    </processaccounts>
    <associatedwebapplications>
      <webapplication name="SharePoint - 4389" url="http://server:4389/" />
      <webapplication name="SharePoint - 80" url="http://server/" />
    </associatedwebapplications>
  </ssp>
</ssps>
```

You can use this to prevent loss of your current configured accounts.

[SETUP_INSTALLATION_RELATED_FAQ]: https://web.archive.org/web/20101012014536/https://pstfsconnector.codeplex.com/wikipage?title=Setup%2fInstallation%20Related%20FAQ%27s&referringTitle=Home
[STSADM_EDITSSP]: https://learn.microsoft.com/previous-versions/office/sharepoint-2007-products-and-technologies/cc262727(v=office.12)

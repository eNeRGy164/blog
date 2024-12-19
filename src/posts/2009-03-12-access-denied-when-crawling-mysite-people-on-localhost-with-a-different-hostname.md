---
id: 17
title: Access Denied when crawling mysite / people on localhost with a different hostname
date: 2009-03-12T22:55:34+01:00
updated: 2020-12-02T22:59:25+01:00
author: Michaël Hompus
excerpt: >
  I have a clean install on the latest and greatest: Windows Server 2008, SQL Server 2008 and MOSS 2007 SP1 with all updates.
  Everything works fine, except the search crawl gave Access Denied errors on http://mysite and sps3://mysite.
  This post explains how I fixed the problem.
layout: ../layouts/BlogPost.astro
permalink: /2009/03/12/access-denied-when-crawling-mysite-people-on-localhost-with-a-different-hostname/
image: /wp-content/uploads/2009/03/post-17-thumnail-1.png
categories:
  - SharePoint
  - Windows
tags:
  - Crawl
  - Exception
  - Local loopback
  - MySite
  - regedit
  - Search
  - SharePoint 2007
  - Windows Server 2008

# Spell:ignore mysite
---

I have a clean install on the latest and greatest: Windows Server 2008, SQL Server 2008 and MOSS 2007 SP1 with all updates.
This is the layout of my farm:

```plain
http://<server>:80   - Portal  
http://<server>:8000 - Central Admin  
http://<server>:8001 - SSP
http://mysite        - MySites
```

Everything works fine, except the search crawl gave Access Denied errors on `http://mysite` and `sps3://mysite`.

<!--more-->

I checked everything, but could only find this in the Application event log:

```plain frame="shell" title="Application Event Log"
The start address <http://mysite> cannot be crawled.
Context: Application 'SharedServices1', Catalog 'Portal_Content'
Details:
Access is denied. Check that the Default Content Access Account
has access to this content, or add a crawl rule to crawl this
content.   (0x80041205)
```

Also the Security event log says:

```plain  frame="shell" title="Security Event Log"
An account failed to log on.
Subject:
Security ID:              NULL SID
Account Name:             -
Account Domain:           -
Logon ID:                 0x0
Logon Type:               3
Account For Which Logon Failed:
Security ID:              NULL SID
Account Name:             <DCA account>
Account Domain:           <Domain>
Failure Information:
Failure Reason:           An Error occured during Logon.
Status:                   0xc000006d
Sub Status:               0x0
Process Information:
Caller Process ID:        0x0
Caller Process Name:      -
Network Information:
Workstation Name:         <Server>
Source Network Address:   127.0.0.1
Source Port:              50678
Detailed Authentication Information:
Logon Process:
Authentication Package:   NTLM
Transited Services:       -
Package Name (NTLM only): -
Key Length:               0
```

I had a hard time finding the solution, until I encountered Ron Grzywacz's Blog:
[Crawling Issue with .NET 3.5 SP1](https://techcommunity.microsoft.com/blog/coreinfrastructureandsecurityblog/crawling-issue-with-net-3-5-sp1/333193).

Although **KB896861** only mentions Windows XP and Windows Server 2003, it seems to fix the issue on Windows Server 2008 as well.

So to fix this:

1. Click **Start**, click **Run**, type `regedit`, and then click **OK**
2. In Registry Editor, locate and then click the following registry key: `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa\MSV1_0`
3. Right-click **MSV1_0**, point to **New**, and then click **Multi-String Value**
4. Type `BackConnectionHostNames`, and then press ENTER.
5. Right-click **BackConnectionHostNames**, and then click **Modify**
6. In the **Value data** box, type the host name or the host names for the sites that are on the local computer, and then click **OK**
7. Quit the Registry Editor, and then restart the IISAdmin service

It worked immediately!

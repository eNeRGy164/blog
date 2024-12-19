---
id: 66
title: Remote Desktop Client doesn’t use stored credentials
date: 2010-01-06T19:54:30+01:00
updated: 2023-03-31T17:55:44+02:00
author: Michaël Hompus
excerpt: >
  Learn how I solved the problem of the Remote Desktop Client not using stored credentials due to a local policy setting, and simplified my RDP connections.
layout: ../layouts/BlogPost.astro
permalink: /2010/01/06/remote-desktop-client-doesnt-use-stored-credentials/
image: /wp-content/uploads/2010/01/post-66-thumnail-1.png
categories:
  - Windows
tags:
  - Credentials
  - GPEdit
  - NTLM
  - RDP
  - Remote Desktop
  - Windows
---

When I frequently connect to the same development machine using Remote Desktop Protocol (RDP),
I want to store my credentials for easier access.
However, I still have to provide my password each time I connect.

In this article, I explain the reason behind this issue and how I resolved it by adjusting a local policy setting.

<!--more-->

## The problem

When I connect to the same development machine repeatedly using RDP,
I want to store my credentials for easier access.

![First logon attempt](/wp-content/uploads/2010/01/first-logon-attempt.png "First logon attempt")

However, when I try to connect again, I'm still prompted to provide my password.

![Second logon attempt](/wp-content/uploads/2010/01/second-logon-attempt.png "Second logon attempt")

After entering my password 1387 times in the past year,
I started searching for the reason why it does not use my stored credentials.
As it turns out this is because of a local policy.

## The solution

1. Start <kbd>GPEdit.msc</kbd> and navigate to `Computer Configuration` > `Administrative Templates` > `System` > `Credentials Delegation`
2. Open the policy `Allow Saved Credentials with NTLM-only Server Authentication`
   (or `Allow Delegating Saved Credentials with NTLM-only Server Authentication` for Windows 7)
3. Select `Enabled` and click on <kbd>Show</kbd>
4. Enter the server where you want to connect to with the stored credentials.
   You are allowed to use wildcards, so I choose `TERMSRV/*.int`
   (since my development machines are always in a domain ending with `.int`)
5. Close the screens and run <kbd>gpupdate</kbd>

![Allow delegating saved credentials](/wp-content/uploads/2010/01/allow-delegating-saved-credentials.png "Allow delegating saved credentials")

Now, I can connect to the server without having to provide the same password over and over again.

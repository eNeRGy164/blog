---
id: 534
title: Hyper-V VM’s missing in Windows 10 (Insiders Build, Slow Ring)
date: 2015-10-20T09:03:15+02:00
updated: 2020-12-06T19:31:49+01:00
author: Michaël Hompus
excerpt: >
  My PC just got upgraded to the latest Windows 10 Insiders build (slow ring, build 10565) and suddenly a couple of VMs were missing from the Hyper-V Manager.

  I first suspected the security settings on the directories were the problem, but my changes didn't fix anything.
  After browsing around the internet, I found a couple of fixes that might help you if you have the same problem.
permalink: /2015/10/20/hyper-v-vms-missing-in-windows-10-insiders-build-slow-ring/
image: /wp-content/uploads/2015/10/post-2015-10-20-thumbnail.png
categories:
  - Hyper-V
  - PowerShell
tags:
  - Registry
---

My PC just got upgraded to the latest Windows 10 Insiders build (slow ring, build 10565) and suddenly a couple of VMs were missing from the Hyper-V Manager.

I first suspected the security settings on the directories were the problem, but my changes didn't fix anything.
After browsing around the internet, I found a couple of fixes that might help you if you have the same problem.

<!--more-->

## Save your machine

The post [Windows 10 Preview - VMs Missing In Hyper-V Manager](https://blog.rmilne.ca/2014/10/16/windows-10-preview-vms-missing-in-hyper-v-manager/) by Rhoderick Milne shows he was still able to see the Virtual Machines using PowerShell.  
He got the Virtual Machines to show up again after saving them from the command line:

```powershell
Get-VM | Where { $_.State –eq "Running" }  | Save-VM
```

## Get a heartbeat

Although he could see them again in the Hyper-V Manager, some were stuck when starting up.  
The problem is the integration service is reporting a corrupt heartbeat.
He fixed this by disabling the heartbeat service for these machines.

```powershell
Get-VM
    | Where { $_.Heartbeat -eq "OkApplicationsUnknown" }
    | Disable-VMIntegrationService Heartbeat
```

## Adjust the registry

The command was not sufficient for my situation.
The VMs were still missing.

Then I ran across the article **PSA: Missing Hyper-V VMs on Windows 10 - Build 10547** by Ben Armstrong.  
He indicates that it's a registry problem in this build of Windows.

```powershell
Set-ItemProperty
    -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Virtualization"
    -Name "CurrentVmVersion"
    -Value "6.2"

Restart-Service VMMS
```

## Conclusion

This fixed it for me.

Three Simple PowerShell statements can rescue your VMs from oblivion on the Windows 10 preview.

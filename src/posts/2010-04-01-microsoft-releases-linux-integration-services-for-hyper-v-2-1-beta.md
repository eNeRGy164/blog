---
id: 154
title: Microsoft releases Linux Integration Services for Hyper-V 2.1 Beta
date: 2010-04-01T16:20:32+02:00
updated: 2020-12-06T17:11:39+01:00
author: Michaël Hompus
excerpt: >
  Today the Microsoft Virtualization Team announced the availability of the new beta version of the Linux Integration Services for Hyper-V.

  In this post I will try the new features.
layout: ../layouts/BlogPost.astro
permalink: /2010/04/01/microsoft-releases-linux-integration-services-for-hyper-v-2-1-beta/
image: /wp-content/uploads/2010/04/post-154-thumnail-1.png
categories:
  - Hyper-V
tags:
  - CentOS
  - Clock
  - Hyper-V
  - Integration Components
  - Linux
---

Today the Microsoft Virtualization Team [announced the availability of the new beta version of the Linux Integration Services for Hyper-V](https://techcommunity.microsoft.com/blog/virtualization/announcing-the-availability-of-the-beta-version-of-linux-integration-services-fo/381715). There are three big changes in this version:

- Virtual machines will be able to use up to 4 virtual CPUs.
- Virtual machines will be able to synchronize their time with the parent partition.
- Virtual machines will be able to shutdown gracefully from the Hyper-V manager.

In this post I will try the new features.

## Linux Integration Services for Hyper-V 2.0

First, I got a Virtual Machine (VM) installed as described in my previous post "[Running CentOS 5.x on Hyper-V](/2010/01/07/running-centos-5-x-on-hyper-v)".
I used the current released stable version of the Linux Integration Services (LIS): Version 2.0.

![Screenshot displaying the VMBUS information on booting the virtual machine. Build Date=Jun 29 2009 and Build Description=Version 2.0.](/wp-content/uploads/2010/04/vmbus-boot-version-2-0.png "On boot time, VMBUS displays 'Version 2.0'")

My Hyper-V host only has a dual-core CPU.
So, it is impossible for me to test the 4 CPU support. I could not find any differences with 2 CPUs.

### Shutdown from Hyper-V Console

With the current version of the LIS when I press the shutdown button, I get the following error:

![Screenshot displaying the Hyper-V console showing the error text: "The application encountered an error while attempting to change the state of 'BlogDemo'. Failed to shut down the virtual machine.".](/wp-content/uploads/2010/04/shutdown-error-console.png "Hyper-V Console shows the error 'Failed to shut down the virtual machine'.")

### Time synchronization

With the current version of the LIS I had a lot of trouble with the clock of the VM getting out of sync very fast.
I did a post to fix this: "[Correcting time drift with CentOS on Hyper-V](/2010/01/08/correcting-time-drift-with-centos-on-hyper-v)".

I did not implement the mentioned fix on the VM I created for this post, to demonstrate the problem:

![Screenshot displaying the Hyper-V console showing the VM gets a time difference of multiple=](/wp-content/uploads/2010/04/time-sync-issue.png "The VM gets an offset of multiple seconds within minutes.")

## Linux Integration Services for Hyper-V 2.1 Beta

To get the beta drivers you need to download them from the **Microsoft Connect** website.

I installed the new drivers in exact the same way as the 2.0.

![Screenshot displaying the VMBUS information on booting the virtual machine. Build Date=Mar 23 2010 and Build Description=Version 2.1.2.](/wp-content/uploads/2010/04/vmbus-boot-version-2-1-2.png "On boot time, VMBUS displays Version 2.1.2")

Not only the new version number is displayed, also the new Shutdown and Timesync channels are mentioned!

### Shutdown from Hyper-V Console

Pressing the shutdown button now gives a more expected result:

![Screenshot displaying the virtual machine has received the shutdown command and starts the power-off sequence.](/wp-content/uploads/2010/04/shutdown-halt.png "The VM receives the signal to shut down and calls `/sbin/poweroff`")

![Screenshot displaying the Hyper-V console with the message: "The virtual machine is turned off".](/wp-content/uploads/2010/04/no-shutdown-error-console..png "The VM is gracefully turned off.")

### Time synchronization

With the new LIS the time is pretty much stable, nothing the NTP service cannot handle.
There is no need to change the boot command in grub anymore.

![Screenshot displaying the Hyper-V console showing the VM shows minimal time difference over the course of minutes.](/wp-content/uploads/2010/04/time-sync-stable.png "The VM only shows a minimal time difference over the course of minutes.")

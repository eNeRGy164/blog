---
id: 71
title: Running CentOS 5.x on Hyper-V
date: 2010-01-07T16:31:47+01:00
author: Michaël Hompus
excerpt: >
  I’m running Linux in Hyper-V VMs since the launch of the Windows Server 2008 RTM. It was quite complex to get performance and support for the network drivers.
  Recently with the launch of Windows Server 2008 R2 there are also new Linux Integration Components which also work for 2008 RTM.
  Here is the list of steps to install CentOS with these components.
layout: ../layouts/BlogPost.astro
permalink: /2010/01/07/running-centos-5-x-on-hyper-v/
image: /wp-content/uploads/2010/01/post-71-thumnail-1.png
categories:
  - Hyper-V
tags:
  - CentOS
  - Integration Components
  - LIC
  - Linux
  - Windows Server 2008
  - Windows Server 2008R2

# cSpell:ignore kernel-xen-devel, seth0
---

I am running Linux in Hyper-V VMs since the launch of the Windows Server 2008 RTM.
But in the beginning it was quite complex to get real performance and support for the network drivers.

Recently, with the launch of Windows Server 2008 R2,
there are also new Linux Integration Components which also work for Windows Server 2008 RTM.

<!--more-->

So, here is the list of steps to install CentOS with the integration components.

1. Download the latest CentOS distribution from <https://vault.centos.org/5.0/isos/>
   (I use the x86_64 version).
2. Create a VM, I suggest:

   * >400MB memory
   * Add a Legacy Network Adapter (connect to network)
   * Add a Network Adapter (connect to network)

3. Mount the CD-ROM and install CentOS (I use the minimal setup)
4. After the installation is done make certain you are up to date

   ```shell
   yum update
   ```

5. Install the required components for the Linux Integration Components

   ```shell
   yum install gcc make gnupg kernel-devel
   ```

6. Reboot into the latest kernel
7. Download the [Linux Integration Components](https://www.microsoft.com/en-us/download/details.aspx?id=55106)
8. Mount the CD-ROM and copy the contents  

   ```shell
   mkdir -p /mnt/cdrom
   mount /dev/cdrom /mnt/cdrom
   cp -rp /mnt/cdrom /opt/linux_ic
   umount /mnt/cdrom
   ```

9. Build the drivers

   ```shell
   cd /opt/linux_ic ./setup.pl drivers
   ```

   If you get the message "No kernel-xen-devel or kernel-source package installed. You must install this package before installing the drivers." edit the `setup.pl` file and change the following:

   ```diff
   -$kernel = `rpm -q kernel-xen-devel`;
   +$kernel = `rpm -q kernel-devel`;
   ```

   If everything went OK you can now see a new nic (network interface controller) called `seth0` using `ifconfig`

10. You can now remove the Legacy Network Adapter.

> [!IMPORTANT]
> Remember, every time you update the kernel you have to run the `setup.pl drivers` command.

---
id: 78
title: Correcting time drift with CentOS on Hyper-V
date: 2010-01-08T12:34:58+01:00
author: Michaël Hompus
excerpt: >
  I was having trouble with the clock in my Linux Hyper-V VMs. The time was constantly drifting forward.
  Using NTP only slowed the drift a bit down but often NTP gave up after several days.
layout: ../layouts/BlogPost.astro
permalink: /2010/01/08/correcting-time-drift-with-centos-on-hyper-v/
image: /wp-content/uploads/2010/01/post-78-thumnail-1.png
categories:
  - Hyper-V
tags:
  - CentOS
  - Clock
  - grub
  - Linux
  - NTP
  - VM
---

I was having trouble with the clock in my Linux Hyper-V VM’s.
The time was constantly drifting forward.
Using the Network Time Protocol (NTP) only slowed the drift a bit down but often the NTP-service gave up after several days.

<!--more-->

I tried a lot of NTP configurations, but basically the local clock was just unreliable.
Even using [rdate](https://linux.die.net/man/1/rdate) every 10 minutes was already showing backwards jumps of several seconds.
As one of my VMs is running dovecot this really was a problem because [dovecot](https://www.dovecot.org/) hates [time moving backwards](https://doc.dovecot.org/2.3/admin_manual/errors/time_moved_backwards/).

I finally found the solution posted by Mat Mirabito in the blogpost
"[Linux (specifically CentOS running trixbox) gains excessive time on system clock](https://bloggymcblogface.blog/linux-specifically-centos-running-trixbox-gains-excessive-time-on-system-clock/)".

Edit `grub.conf` and add the following to the kernel line:

```ini
divider=10 clocksource=acpi_pm
```

After this it works like… clockwork 🙂

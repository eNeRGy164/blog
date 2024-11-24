---
id: 246
title: Migrating a catch-all maildir to Office 365
date: 2012-05-18T17:49:12+02:00
updated: 2021-07-16T22:59:42+02:00
author: Michaël Hompus
excerpt: >
  I've been running my own mail server at home for years.
  But it requires a reliable connection and some maintenance once in a while.
  And of course it always breaks when I'm on the other side of the world.

  To free myself of that burden I decided to make the move to Office 365.
  However I discovered there is no way to set my account as a catch-all account.
  This is not possible at all!

  So I made my own scripts to add all email addresses I used in the past as an alias on my mailbox.
layout: ../layouts/BlogPost.astro
permalink: /2012/05/18/migrating-a-catch-all-maildir-to-office-365/
image: /wp-content/uploads/2012/05/post-246-thumnail-1.png
categories:
  - Office
  - PowerShell
tags:
  - Catch-All
  - Maildir
  - Office 365
---

I have been running my own mail server at home for years using [Postfix](https://www.postfix.org/), [dovecot](https://www.dovecot.org/), [amavisd-new](https://amavis.org/), [ClamAV](https://www.clamav.net/) and [SpamAssassin](https://spamassassin.apache.org/).
But it requires a reliable connection and some maintenance occasionally.
And of course, it always breaks when I am on the other side of the world.

To free myself of that burden, I decided to make the move to [Office 365](https://www.microsoft.com/microsoft-365).
I got myself a P1 subscription and started to browse through the configuration screens.
The migration of an account from IMAP to Exchange Online was amazingly fast and easy.

Happy with how everything looked, felt, and connected, I was ready to make the switch.

Just before I wanted to change the MX record to point to Office 365, I double checked the configuration of my account. I discovered I could not find any way to set my account as a catch-all account. After some research I found out this is not possible at all!

<!--more-->

> Catch-all Mailbox
>
> A catch-all mailbox receives messages sent to email addresses in a domain that do not exist.
> Exchange Online anti-spam filters use recipient filtering to reject messages sent to mailboxes that don’t exist, 
> so catch-all mailboxes are not supported.

That left me 2 options:

1. Stop the migration to Office 365 and leave things as they were.
2. Make every email address I used in the past an alias.

I started searching if anyone has done this before.
It looks like this is not the case, so seeing this as a challenge,
I started working on my own solution.

### Extracting all used addresses

First you need to get every email address ever used by others as a recipient.

As my bash scripting is a bit rusty,
I found this [script to convert mdir to mbox format](https://www.linuxquestions.org/questions/linux-general-1/a-script-to-convert-maildir-to-mailbox-format-381568-print/) by Joerg Reinhardt which I have used as base for my own script: [getting email recipient addresses from maildir](https://gist.github.com/eNeRGy164/edd3becb0b3acd6c0f634fca3b108a5e).

The script needs 2 parameters, the `maildir` directory and the `email domain` you want to get the aliases for.

```bash
./maildir-dump.sh <Maildir directory> <Email domain>
```

So, for me:

```bash
./maildir-dump.sh Maildir hompus.nl
```

This results in a long file with a lot of email addresses. To aggregate this list into a CSV file you can use the following command:

```bash
sort Maildir.dump | uniq -c | sort -k1nr | awk 'BEGIN {OFS = ";";} {print $1,$2}' > Maildir.csv
```

This allows you to open the file using Excel and remove all entries you don’t want to be an alias.  
I counted 385 unique email addresses, too many to add manually.

### Adding the aliases to a mailbox

First, I configured and connected to Exchange Online using the "[Windows PowerShell to the Service](https://learn.microsoft.com/powershell/exchange/connect-to-exchange-online-powershell?view=exchange-ps)" article.

Then, read the generated and authored CSV file.

```powershell
$csv = Import-Csv D:\Maildir.csv -Delimiter ';' -Header Count, Email
```

Get a reference to the mailbox you want to add the aliases.

```powershell
$temp = Get-Mailbox -Identity michael
```

Add all the email addresses to the `EmailAddress` property, but I discovered the last email address will become the default address.
So, make sure the primary SMTP address is added last.

```powershell
$temp.EmailAddresses = $temp.EmailAddresses | ? { $_ -ne "SMTP:" + $temp.PrimarySmtpAddress }
$csv | % { $temp.EmailAddresses += ("SMTP:" + $_.Email) }
$temp.EmailAddresses += "SMTP:" + $temp.PrimarySmtpAddress
```

Now set the `EmailAddress` property on the actual mailbox

```powershell
Set-Mailbox -Identity michael -EmailAddresses $temp.EmailAddresses
```

And done!

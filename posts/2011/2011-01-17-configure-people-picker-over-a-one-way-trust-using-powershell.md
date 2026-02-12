---
id: 201
title: Configure people picker over a one-way trust using PowerShell
date: 2011-01-17T19:16:47+01:00
updated: 2021-07-16T23:01:51+02:00
author: Michaël Hompus
excerpt: >
  In a previous post I have written about Using the people picker over a one-way trust.
  In this post I use STSADM commands as there are no other ways to configure this.
  A downside of the STSADM command is your domain password being visible on the command prompt in clear text for everybody to read,
  or to retrieve from the command line history.

  SharePoint 2010 introduces several cmdlets to replace the “old” STSADM commands.
  Microsoft has posted an overview of the STSADM to Windows PowerShell mapping.
  However the commands for configuring the people picker are not available.
permalink: /2011/01/17/configure-people-picker-over-a-one-way-trust-using-powershell/
image: /wp-content/uploads/2011/01/post-2011-01-17-thumbnail.png
categories:
  - PowerShell
  - SharePoint
tags:
  - cmdlet
  - People Picker
  - SharePoint 2010
  - stsadm
  - Trust
---

In a previous article, I have written about
"[Using the people picker over a one-way trust](/2010/06/01/using-the-people-picker-over-a-one-way-trust)".
In that post I use [STSADM](https://learn.microsoft.com/SharePoint/technical-reference/stsadm-to-microsoft-powershell-mapping)
commands as there are no other ways to configure this.

A downside of the STSADM command is your domain password being visible on the command prompt in plain text for everybody to read.

With SharePoint 2010 Microsoft introduces several cmdlets to replace the "old" STSADM commands. But looking at the
[STSADM to Windows PowerShell mapping](https://learn.microsoft.com/SharePoint/technical-reference/stsadm-to-microsoft-powershell-mapping)
you will see the commands for configuring the people picker are not present.

## Creating my own script

PowerShell contains the [`Get-Credential` cmdlet](<https://learn.microsoft.com/previous-versions/dd315327(v=technet.10)>)
which uses a dialog to request credentials from the user and stores the password in a
[`SecureString`](https://learn.microsoft.com/dotnet/api/system.security.securestring?view=netframework-4.0).

This triggered me to write a PowerShell script which will work the same as "`STSADM -o setproperty -pn peoplepicker-searchadforests`",
but instead of typing the credentials on the command line it will use the credential dialog for every trusted domain.

As written in my previous post the configuration is done in two steps.

## SetAppPassword

First you need to create a secure store for the credentials.
This is done by executing the `SetAppPassword` command on every server in your SharePoint Farm with the same password.

### STSADM

```shell
stsadm -o setapppassword
       -password <password>
```

### PowerShell

```powershell
Set-AppPassword "<password>"
```

```powershell
function Set-AppPassword([String]$password) {
  $type =
      [Microsoft.SharePoint.Utilities.SPPropertyBag].Assembly.GetType("Microsoft.SharePoint.Utilities.SPSecureString")

  $method =
      $type.GetMethod("FromString", "Static, NonPublic", $null, @([String]), $null)

  $secureString = $method.Invoke($null, @($password))

  [Microsoft.SharePoint.SPSecurity]::SetApplicationCredentialKey($secureString)
}
```

## PeoplePickerSearchADForests

The second step is to register the (trusted) domains to be visible in the people picker.
Remember this setting is per web application and zone.

### STSADM

```shell
stsadm -o setproperty
       -url <url>
       -pn "peoplepicker-searchadforests"
       -pv "forest:<source forest>;domain:<trusted domain>,<trusted domain>\<account>,<password>"
```

### PowerShell

```powershell
Set-PeoplePickerSearchADForests "<url>"
                                "forest:<source forest>;domain:<trusted domain>"
```

```powershell
function Set-PeoplePickerSearchADForests([String] $webApplicationUrl, [String] $value) {
  $webApplication = Get-SPWebApplication $webApplicationUrl

  $searchActiveDirectoryDomains = $webApplication.PeoplePickerSettings.SearchActiveDirectoryDomains
  $searchActiveDirectoryDomains.Clear()

  $currentDomain = (Get-WmiObject -Class Win32_ComputerSystem).Domain

  if (![String]::IsNullOrEmpty($value)) {
    $value.Split(@(';'), "RemoveEmptyEntries") | ForEach {
        $strArray = $_.Split(@(';'))

        $item = New-Object Microsoft.SharePoint.Administration.SPPeoplePickerSearchActiveDirectoryDomain

        [String]$value = $strArray[0]

        $index = $value.IndexOf(':');
        if ($index -ge 0) {
            $item.DomainName = $value.Substring($index + 1);
        } else {
            $item.DomainName = $value;
        }

        if ([Globalization.CultureInfo]::InvariantCulture.CompareInfo.IsPrefix($value, "domain:","IgnoreCase")) {
            $item.IsForest = $false;
        } else {
            $item.IsForest = $true;
        }

        if ($item.DomainName -ne $currentDomain) {
            $credentials = $host.ui.PromptForCredential("Foreign domain trust"
              + " credentials", "Please enter the trust credentials to"
              + " connect to the " + $item.DomainName + " domain", "", "")

            $item.LoginName = $credentials.UserName;
            $item.SetPassword($credentials.Password);
        }

        $searchActiveDirectoryDomains.Add($item);
    }

    $webApplication.Update()
  }
}
```

## Using the script

I have attached the script so you can use it in any way you want.
You can put the commands in your own `.ps1` file,
or load the script in your current session using the following syntax:

```powershell
. .\<path to file>PeoplePickerSearchADForests.ps1
```

_(Yes, that is a <kbd>**dot**</kbd>, then a <kbd>**space**</kbd>, then the **path** to the script)_

[PeoplePickerSearchADForests.zip](/wp-content/uploads/2011/01/PeoplePickerSearchADForests.zip)

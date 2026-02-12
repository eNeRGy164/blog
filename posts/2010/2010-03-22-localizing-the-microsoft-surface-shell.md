---
id: 123
title: Localizing the Microsoft Surface Shell
date: 2010-03-22T16:17:36+01:00
updated: 2020-12-03T23:40:15+01:00
author: Michaël Hompus
excerpt: >
  The Microsoft Surface is a Windows Vista computer running the Microsoft Surface Shell.
  This shell is by default localized for US English. It is possible to localize for other locales,
  but there is no configuration screen to set the desired localization.
  This post will summarize the different steps to localize the Surface shell.
permalink: /2010/03/22/localizing-the-microsoft-surface-shell/
image: /wp-content/uploads/2010/03/post-2010-03-22-thumbnail.png
categories:
  - Surface
tags:
  - Date
  - Formatting
  - Localization
  - SDK
  - Shell
  - Simulator
  - Time
  - x64
  - x86
---

The **Microsoft Surface** (the table, not the tablet) is a Windows Vista computer running the Microsoft Surface Shell.
This shell is by default localized for US English.

It is possible to localize for other locales, but there is no configuration screen to set the desired localization.

This article will summarize the different steps to localize the Surface shell.

<!--more-->

## Microsoft Surface Device vs. Microsoft Surface Simulator

The settings work for both the Microsoft Surface device and the "Surface Simulator".

### Note for x64 machines (Running the SDK)

If you are running the Surface Simulator on a x64 machine (see my post about "[Installing the Microsoft Surface SDK on Windows 7 x64](/2010/03/03/installing-the-microsoft-surface-sdk-on-windows-7-x64)") the registry entries are slightly different.

For x86:

```plain
HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Surface\v1.0
```

For x64:

```plain
HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Surface\v1.0
```

All my examples in this post will use the x86 path.

## Setting the Surface Shell interface language

With service pack 1, the shell now supports 10 UI languages.

| Language                | UILanguageName value |
| ----------------------- | -------------------- |
| Danish                  | da-DK                |
| Dutch                   | nl-NL                |
| English (United States) | en-US                |
| French                  | fr-FR                |
| German                  | de-DE                |
| Italian                 | it-IT                |
| Korean                  | ko-KR                |
| Norwegian (Bokmål)      | nb-NO                |
| Spanish                 | es-ES                |
| Swedish                 | sv-SE                |

To set the required language you need to edit the registry.

1. Look for the following key `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Surface\v1.0\InternationalSupport`
2. Change the `UILanguageName` value into the desired language name you find in the table.
   For example, to set the language to Dutch you enter `nl-NL`.
3. Restart the shell

![Screenshot displaying the modified registry entry to localize the language of the Shell.](/wp-content/uploads/2010/03/registry-localized-shell.png "The modified registry entry to localize the Surface Shell language.")

![Surface button displaying "Close everything" (English) as caption.](/wp-content/uploads/2010/03/close-everything-button-english.png "Close button with caption <q>Close everything</q> in English (default).")

![Surface button displaying "Alles sluiten" (Dutch) as caption.](/wp-content/uploads/2010/03/image5.png "Close button with caption <q>Alles sluiten</q> in Dutch (localized).")

## Setting the Surface Keyboard mapping

There are 19 supported keyboard mappings.

| Keyboard layout                | InputLanguageID value |
| ------------------------------ | --------------------- |
| Belgian (Comma)                | 0x1080c               |
| Belgian French                 | 0x80c                 |
| Canadian French                | 0x1009                |
| Canadian Multilingual Standard | 0x11009               |
| Danish                         | 0x406                 |
| French                         | 0x40c                 |
| German                         | 0x407                 |
| Italian                        | 0x410                 |
| Korean                         | 0x412                 |
| Latin American                 | 0x80a                 |
| Norwegian                      | 0x414                 |
| Spanish                        | 0x40a                 |
| Swedish                        | 0x41d                 |
| Swiss French                   | 0x100c                |
| Swiss German                   | 0x807                 |
| United Kingdom                 | 0x809                 |
| United Kingdom Extended        | 0x452                 |
| US English                     | 0x409                 |
| US-International               | 0x20409               |

To set the desired keyboard mapping you need to edit the registry.

1. Look for the following key  
   `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Surface\v1.0\InternationalSupport`
2. Change the `InputLanguageID` value into the desired keyboard mapping you find in the table.
   For example, to set the shell to Korean you enter `0x412` (Hexadecimal).
3. Restart the shell

![Screenshot displaying the modified registry entry to localize the mapping of the Surface Keyboard.](/wp-content/uploads/2010/03/registry-localize-keyboard.png "The modified registry entry to localize the Surface Keyboard mapping.")

![Keyboard using US English mapping.](/wp-content/uploads/2010/03/image7.png "Surface Keyboard with US English mapping (default).")

![Keyboard using Korean mapping.](/wp-content/uploads/2010/03/keyboard-localized-in-korean.png "Surface Keyboard with Korean mapping (localized).")

## Setting the Surface Date and Number formatting

For date and number formatting you can use all locales supported by the .NET Framework. The complete list can be found on the [Language Identifier Constants and Strings](https://learn.microsoft.com/windows/win32/intl/language-identifier-constants-and-strings) MSDN page.

Just combine the primary language, for example: Dutch (nl), with the sub-language, for example Netherlands (NL): `nl-NL`.

To set the desired date and number formatting you need to edit the registry.

1. Look for the following key  
   `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Surface\v1.0\InternationalSupport`
2. Change the `LocaleName` value into the desired formatting locale.
   For example, to set the formatting to Dutch you enter `nl-NL`.
3. Restart the shell

![Screenshot displaying the modified registry entry to localize the formatting of date and time values.](/wp-content/uploads/2010/03/image9.png "The modified registry entry to localize the date and number formatting.")

![Date and time formatted in US English: "Monday, March 22, 2010 12:00:00 AM".](/wp-content/uploads/2010/03/date-time-in-english-format.png "Date formatting in US English (default).")

![Date and time formatted in Dutch: "maandag 22 maart 2010 0:00:00".](/wp-content/uploads/2010/03/image11.png "Date formatting in Dutch (localized).")

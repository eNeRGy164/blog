---
id: 7
title: An addition to the Project Server 2007 SDK
date: 2007-08-31T11:39:00+02:00
updated: 2020-12-02T22:12:35+01:00
author: Michaël Hompus
excerpt: >
  Currently I'm working on a project which uses Microsoft Project Server 2007.
  However, the SDK is poorly documented.
permalink: /2007/08/31/an-addition-to-the-project-server-2007-sdk/
image: /wp-content/uploads/2007/08/post-2007-08-31-thumbnail.png
categories:
  - Project Server
tags:
  - Project Server 2007
  - PWA
  - SDK
series: Project Server 2007 SDK additions

# cSpell:ignore WADMIN_PROTECT_ACTUALS
---

Currently I am working on a project which uses Microsoft Project Server 2007.
However, the SDK is poorly documented.
Today I was looking at the Admin web service which can be used to configure settings on the server.
In this article I am not going in to detail how to do this yourself, but the details that I have discovered.

<!--more-->

I have researched the connection between PWA's "Task Settings and Display" page and the properties on the
[`StatusingSettingsRow` class][STATUSING_SETTINGS_ROW_CLASS] which were not described. See the following image:

![Screenshot of "Task Settings and Display"](/wp-content/uploads/2007/08/task-settings-and-display.png)

So, in addition to the SDK:

| Name                             | Description                                                                                                                      | Enumeration                                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| WADMIN_DEFAULT_TRACKING_METHOD   | Specify the default method for reporting progress or tasks,<br>and whether the tracking mode should be enforced on all projects. | 1 = Hours of work done per period.<br>2 = Percent of work complete.<br>3 = Actual work done and work remaining.               |
| WADMIN_IS_TRACKING_METHOD_LOCKED | Force project managers to use the progress reporting method specified above for all projects.                                    |                                                                                                                               |
| WADMIN_PROTECT_ACTUALS           | Restrict updates to Project Web Access.                                                                                          |                                                                                                                               |
| WADMIN_STAT_ENABLE_DOWNLOAD      | Enable ActiveX Gantt view for all users.                                                                                         |                                                                                                                               |
| WADMIN_STAT_LOOK_AHEAD           | Current tasks are those tasks which are not older than or further in the future more than this number of days.                   |                                                                                                                               |
| WADMIN_STAT_TIMESHEET_TIED       | Time entry by Timesheet only.<br>Users will sync to update tasks.                                                                |                                                                                                                               |
| WADMIN_TS_DEF_ENTRY_MODE_ENUM    | Specify how you want resources to report their hours.                                                                            | 0 = Resources should report their hours worked every day.<br>1 = Resources should report their total hours worked for a week. |
| WADMIN_WEEK_START_ON_ENUM        | Week starts on this day.                                                                                                         | 0 = Sunday<br>1 = Monday <br>2 = Tuesday<br>3 = Wednesday<br>4 = Thursday<br>5 = Friday<br>6 = Saturday                       |

[STATUSING_SETTINGS_ROW_CLASS]: https://learn.microsoft.com/previous-versions/office/developer/office-2007/ms419700(v=office.12)

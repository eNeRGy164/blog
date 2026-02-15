---
id: 99
title: Prevent user to recall or delete a timesheet after approving
date: 2010-02-02T13:49:30+01:00
updated: 2020-12-03T23:07:10+01:00
author: Michaël Hompus
excerpt: >
  Working on a Project Server project we discovered it's quite easy to get issues with data integrity when users start retracting and deleting timesheets.
  After discussing the issue with Microsoft they gave us a workaround which solves our problem.
permalink: /2010/02/02/prevent-user-to-recall-or-delete-a-timesheet-after-approving/
image: /wp-content/uploads/2010/02/post-2010-02-02-thumbnail.png
categories:
  - Project Server
tags:
  - Microsoft
  - Project Server 2007
  - PSI
  - Timesheet
thumbnail:
  title: "Lock Timesheets After Approval"
  subtitle: >
    Preventing Project Server users from retracting or deleting approved timesheets to protect data integrity.
---

Working on a Project Server project we discovered it is quite easy to get issues with data integrity when users start retracting and deleting timesheets.
After discussing the issue with Microsoft, they gave us a workaround which solves our problem.

<!--more-->

## The problem

After a user has submitted a timesheet and the timesheet manager approves this timesheet as well, the data is exported to an external system for invoicing.

However, the user is still is able to retract the timesheet, modify it and resubmit it.
It is even possible to delete the timesheet.

Our first thought was to close the period of the submitted timesheets.
But this only works partially. The user cannot modify the timesheet anymore, but is still able to retract and delete it. Not a very solid solution.

## The cause

After discussing the issue with Microsoft, we got this response:

> Period close is designed to block new entries, not changes which include deletions.

So, this is pretty much "_by design_".

## The solution

Lucky enough for us the answer of Microsoft did not stop there:

> There is a Flag field in the PSI dataset that is called `TS_IS_PROCESSED`.
>
> This can be set by a custom event or script when the period is closed for timesheets within the period or as originally designed,
> when the timesheet has been exported to a third-party system for processing.
>
> In 2007, we are looking at the data from a position where the system of record can modify the data and to help customers determine
> when Project Server is no longer the system of record, we are leaving it up to the customer to check that flag.
>
> After the flag is set to true then no action can be performed on the timesheet except by duly authorized system administrators
> for adjustments theoretically coming from the third-party system.

I already knew about the [`TS_IS_PROCESSED` property][TS_IS_PROCESSED_PROPERTY] as it is described by the **Project Server SDK**.
But the description there only states:

> Indicates whether the timesheet is finalized and should not be changed.
>
> When `TS_IS_PROCESSED` is `true`, the timesheet cannot be recalled, changed, or deleted.

The, important, missing piece of information is that this field is supposed to be altered by custom code instead of Project Server itself.

This allows us to lock the timesheet when it is appropriate to do so.

[TS_IS_PROCESSED_PROPERTY]: https://learn.microsoft.com/previous-versions/office/ms507406(v=office.14)

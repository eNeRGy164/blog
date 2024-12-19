---
id: 12
title: An addition to the Project Server 2007 SDK (Part 2)
date: 2007-09-07T14:16:00+02:00
updated: 2020-12-02T22:32:24+01:00
author: Michaël Hompus
excerpt: >
  I was browsing through the Project Server 2007 TimePeriodDataSet.TimePeriodsRow members
  and found the following empty entries I could fill.
layout: ../layouts/BlogPost.astro
permalink: /2007/09/07/an-addition-to-the-project-server-2007-sdk-part-2/
image: /wp-content/uploads/2007/09/post-12-thumnail-1.png
categories:
  - Project Server
tags:
  - Project Server 2007
  - SDK

# cSpell:ignore WPRD_UID
---

I was browsing through the Project Server 2007 [`TimePeriodDataSet.TimePeriodsRow` members](https://learn.microsoft.com/previous-versions/office/developer/office-2007/ms479524(v=office.12)) and found there were some empty entries in the SDK.

The following empty entries I could fill:

| Name                  | Description                                                                                             | Enumeration                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| RES_TIMESHEET_MGR_UID | Specifies the resource unique identifier of the (next)<br>enterprise resource reviewing on this timesheet. |                                                                                      |
| TS_WEEK_STARTS_ON     | Specifies the first day of the week for this timesheet.                                                 | 0 = Sunday<br>1 = Monday<br>2 = Tuesday<br>3 = Wednesday<br>4 = Thursday<br>5 = Friday<br>6 = Saturday |
| WPRD_UID              | Specifies the period unique identifier of the time period.                                              |                                                                                      |

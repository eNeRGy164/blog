---
id: 495
title: Updated pull-down-to-refresh panel to work after navigating
date: 2015-06-18T14:32:06+02:00
updated: 2021-07-16T22:53:08+02:00
author: Michaël Hompus
excerpt: >
  I received a couple of comments on my article about making the pull-down-to-refresh work with a Windows Phone virtualizing list control.
  The problem was that the functionality stopped working after navigating away from the page containing the ItemsControl.
  Today I committed the code to GitHub to fix this issue.
permalink: /2015/06/18/updated-pull-down-to-refresh-panel-to-work-after-navigating/
image: /wp-content/uploads/2015/06/post-2015-06-18-thumbnail.png
categories:
  - C#
  - Windows Phone
tags:
  - ListBox
  - Performance
  - ScrollViewer
  - Silverlight
  - WP8
  - WP8.1
  - Xaml
---

I received a couple of comments on my article about
"[making the pull-down-to-refresh work with a Windows Phone virtualizing list control](/2015/02/04/make-pull-down-to-refresh-work-with-a-windows-phone-virtualizing-list-control)".

The problem was that the functionality stopped working after navigating away from the page containing the [`ItemsControl` control](https://learn.microsoft.com/dotnet/api/system.windows.controls.itemscontrol?view=netframework-4.7).

<!--more-->

To prevent events from triggering when the list is not in view, I deregistered all events.
But when the list came back in view, I did not start monitoring these events again.

Today I committed the code to GitHub to fix this issue.

## Source code

You can download my [Windows Phone 8 example project](https://github.com/eNeRGy164/PullDownToRefreshPanelDemo) on GitHub.

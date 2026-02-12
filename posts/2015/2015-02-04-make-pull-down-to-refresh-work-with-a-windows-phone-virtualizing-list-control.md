---
id: 392
title: Make pull-down-to-refresh work with a Windows Phone virtualizing list control
date: 2015-02-04T19:30:31+01:00
updated: 2021-07-16T22:55:09+02:00
author: Michaël Hompus
excerpt: >
  The other day I was working on a Windows Phone app.
  I wanted to add a "pull down to refresh" panel to a large list of images.
  Just like the Facebook and Twitter apps have.

  As Microsoft does not provide this functionality in their default controls I started searching the web if somebody else has build something like this already.

  I found a blog post by Jason Ginchereau where he provided this functionality for Windows Phone 7.

  In my app I use an ItemsControl with a VirtualizingStackPanel to prevent memory issues.
  After I added the PullDownToRefreshPanel control to my list and started testing it on my phone, I ran into some issues.

  In this blog post I will describe my contributions to fix these 2 issues and I will supply the source code for you to use.
permalink: /2015/02/04/make-pull-down-to-refresh-work-with-a-windows-phone-virtualizing-list-control/
image: /wp-content/uploads/2015/02/post-2015-02-04-thumbnail.png
categories:
  - C#
  - Windows Phone
tags:
  - ListBox
  - Performance
  - ScrollViewer
  - WP8
  - WP8.1
  - Xaml
---

The other day I was working on a Windows Phone app.
I wanted to add a "pull down to refresh" panel to a large list of images.
Just like the Facebook and Twitter apps have.

![Pull-to-refresh in the Twitter app animation. Showing a text to encourage the user pull down further to refresh the list. When pulled down far enough the text changes to let the user know the list will be refreshed after the user releases his finger from the screen.](/wp-content/uploads/2015/01/twitter1.gif "Pull-to-refresh in the Twitter app. Image by David Washington")

As Microsoft does not provide this functionality in their default controls,
I started searching the web if somebody else has built something like this already.

I found a blog post by Jason Ginchereau where he provided this functionality for Windows Phone 7.

In my app I use an [`ItemsControl` control](https://learn.microsoft.com/dotnet/api/system.windows.controls.itemscontrol?view=netframework-4.7) with a [`VirtualizingStackPanel` control](https://learn.microsoft.com/dotnet/api/system.windows.controls.virtualizingstackpanel?view=netframework-4.7) to prevent memory issues.
After I added the PullDownToRefreshPanel control to my list and started testing it on my phone,
I ran into some issues.

<!--more-->

## The issues

Adding the control to my page was easy. But I noticed two things.

1. Performance, it is taking up a lot of processing power, resulting in visual lag.
   Especially when using a low powered phone.
2. Scrolling, when scrolling through the list with a quick flicking motion the same images kept scrolling by,
   making the list scroll endlessly until I stopped flicking.

In this blog post I will describe my contributions to fix these 2 issues and I will [supply the source code](#source-code) for you to use.

## 1. Improving performance

Looking at the code, the first thing I noticed was that the control subscribes to the LayoutUpdated event.
The code in the event handler tries to find the [`ScrollViewer` control](https://learn.microsoft.com/dotnet/api/system.windows.controls.scrollviewer?view=netframework-4.7) control to attach to.
After the ScrollViewer is successfully found, the event is never unsubscribed and keeps firing quite often.
When you add a debug message to the method, you will see the event fires constantly during the actual scrolling, but also fires when the control is not even on the screen.
So, the first fix was to unregister the event if the ScrollViewer is found. There is no need to fire unnecessary code.

```csharp {10} title="PullDownToRefreshPanel.cs"
private void PullDownToRefreshPanel_LayoutUpdated(object sender, EventArgs e)
{
  if (this.targetScrollViewer == null)
  {
    this.targetScrollViewer =
        FindVisualElement<ScrollViewer>(VisualTreeHelper.GetParent(this));

    if (this.targetScrollViewer != null)
    {
      this.LayoutUpdated -= PullDownToRefreshPanel_LayoutUpdated;
      // *snip*
    }
  }
}
```

The second thing I observed were the NegativeValueConverters.
The [`ValueConvertor`](https://learn.microsoft.com/dotnet/api/system.windows.data.ivalueconverter?view=netframework-4.7) adds negative space at the bottom to keep the ScrollViewer positioned on the same location if the PullDownToRefreshPanel was growing in height.

Inside the convertor there is an unnecessary [`Convert.ToDouble` method](https://learn.microsoft.com/dotnet/api/system.convert.todouble?view=netframework-4.7#System_Convert_ToDouble_System_Object_).
When resizing the control this conversion was called a lot of times.

So, this could be written a bit simpler as the value is already of the type Double.

```diff title="NegativeValueConverter.cs" 
-double doubleValue = -System.Convert.ToDouble(value);
+double doubleValue = -(double)value; // No System.Convert needed
```

When looking at the original example project by Jason,
the negative space was needed because the control and the list are in separate rows in a grid.
By changing the XAML to put both controls in the same grid cell there is no need for this negative space because the controls are now floating on top of each other.
Eliminating the ValueConvertors all together made the process much lighter.

My XAML looks a bit like this:

```xml title="MainPage.xaml"
<Grid>
  <rlb:PullDownToRefreshPanel x:Name="refreshPanel"
                              RefreshRequested="refreshPanel_RefreshRequested"
                              VerticalAlignment="Top" />
  <ItemsControl x:Name="listBox" ItemsSource="{Binding}">
      <ItemsControl.ItemsPanel>
        <ItemsPanelTemplate>
          <VirtualizingStackPanel Orientation="Vertical" />
        </ItemsPanelTemplate>
      </ItemsControl.ItemsPanel>
      <ItemsControl.Template>
        <ControlTemplate TargetType="ItemsControl">
          <ScrollViewer ManipulationMode="Control">
            <ItemsPresenter/>
          </ScrollViewer>
        </ControlTemplate>
    </ItemsControl.Template>
  </ItemsControl>
</Grid>
```

## 2. Fixing the scrolling

To make the pull-to-refresh list work, it is mandatory to [change](https://learn.microsoft.com/dotnet/api/system.windows.input.manipulation.setmanipulationmode?view=netframework-4.7) the [`ManipulationMode`](<https://learn.microsoft.com/previous-versions/windows/silverlight/dotnet-windows-silverlight/gg986872(v=vs.95)>) property of the ScrollViewer to `Control`.
This allows you to catch the [`MouseMove` event](https://learn.microsoft.com/dotnet/api/system.windows.uielement.mousemove?view=netframework-4.7) and the [`MouseLeftButtonUp` event](https://learn.microsoft.com/dotnet/api/system.windows.uielement.mouseleftbuttonup?view=netframework-4.7).
With these events you can detect the change of the position of the content inside the ScrollViewer by monitoring the [`TranslateY` property](<https://learn.microsoft.com/previous-versions/windows/apps/ee653034(v=vs.105)>) which changes when the compression happens.

Because I noticed the same images kept scrolling by, I was suspecting the VirtualizingStackPanel was not receiving the correct signals and was recycling the same placeholders (and images) over and over without getting fresh data as it should.

Searching the web again I came across [a blog post by Matthijs Krempel](https://thewp7dev.wordpress.com/2012/04/20/pulltorefreshpanel/) describing that the Mango update added some new candy that would allow you to detect the compression using [VisualStates](https://learn.microsoft.com/dotnet/api/system.windows.visualstate?view=netframework-4.7) and therefore you can leave the ManipulationMode on `System`.
Resulting in a better performance and in a correctly functioning VirtualizingStackPanel.
This does not work out-of-the-box, you need to add a specific template to the ScrollViewer.

Matthijs added this to [his own "PullToRefreshPanel" control](https://web.archive.org/web/20200816071155/https://krempelwp7.codeplex.com/).

However, the VisualStates let you only know if compression has started or ended. It doesn’t let you know how much compression is applied. Without the mouse events I needed another way to detect the amount of compression. Which led me to build my own version of the control.

## Building a new Pull-Down-To-Refresh Panel

Windows Phone provides the [`Touch` class](https://learn.microsoft.com/dotnet/api/system.windows.input.touch?view=netframework-4.7) which is an application-level service that processes touch input from the operating system and raises the [`FrameReported` event](https://learn.microsoft.com/dotnet/api/system.windows.input.touch.framereported?view=netframework-4.7) event.
Inside this event you can read what kind of interaction is happening between the fingers and the screen.

```csharp title="PullDownToRefreshPanel.cs"
private void TouchFrameReported(object sender, TouchFrameEventArgs e)
{
    var primaryTouchPoint = e.GetPrimaryTouchPoint(this);

    switch (primaryTouchPoint.Action)
    {
        case TouchAction.Down:
            this.initialPoint = primaryTouchPoint.Position;

            if (this.isCompressed)
            {
                this.StartMeasuring();
            }

            break;

        case TouchAction.Move:
            if (this.isMeasuring)
            {
                // Only update if the finger moves up/down the screen
                if (this.currentPosition.Y != primaryTouchPoint.Position.Y)
                {
                    this.currentPosition = primaryTouchPoint.Position;
                    this.UpdateControl();
                }
            }
            else
            {
                this.initialPoint = primaryTouchPoint.Position;
            }

            break;

        case TouchAction.Up:
            this.StopMeasuring();

            break;
    }
}
```

So, I combined the control Jason originally wrote with the extensions Matthijs made to detect compression.
Then I replaced the mouse events with touch actions.
Resulting in a faster control that also works with virtualized controls like an `ItemsControl` with a `VirtualizingStackPanel` or the `ListBox`.

I will have to note that the `PullDownToRefreshPanel` control will not work with the `LongListSelector` as that control does not expose a `ScrollViewer`.

## Source code

You can download my [Windows Phone 8 example project](https://github.com/eNeRGy164/PullDownToRefreshPanelDemo) on GitHub.

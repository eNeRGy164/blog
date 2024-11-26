---
id: 504
title: Responsive Pivot Headers in Universal Windows Platform apps
date: 2015-09-04T18:31:48+02:00
updated: 2021-07-16T22:52:38+02:00
author: Michaël Hompus
excerpt: >
  For a Universal Windows App I wanted to implement a Pivot.
  Reading the guidelines for tabs and pivots by Microsoft I got inspired by the examples given.
  However, no code samples are supplied so there is no indication how to actually create this in your own Xaml app.

  In this blogpost I will show the different steps to get the basics done and I will supply the source code for you to use.
layout: ../layouts/BlogPost.astro
permalink: /2015/09/04/responsive-pivot-headers-in-universal-windows-platform-apps/
image: /wp-content/uploads/2015/09/post-2015-09-04-thumbnail.png
categories:
  - C#
  - Windows
tags:
  - AdaptiveTrigger
  - RelativePanel
  - Responsive
  - UWP
  - Xaml
---

For a Universal Windows App I wanted to implement a Pivot.
Reading the [guidelines for tabs and pivots](https://learn.microsoft.com/windows/apps/design/controls/tab-view) by Microsoft, I got inspired by the examples given.

However, no code samples are supplied so there is no indication how to create this in your own Xaml app.

<!--more-->

In this article I will show the different steps to get the basics done and I will [supply the source code](#source-code) for you to use.

## The examples

### For mobile

![Example design from pivot guidelines by Microsoft](/wp-content/uploads/2015/09/microsoft-guidelines-example.png)

### For desktop

![Example design for desktop from pivot guidelines by Microsoft](/wp-content/uploads/2015/09/microsoft-guidelines-example-wide.png)

## The default Pivot

The default [`Pivot` control](https://learn.microsoft.com/uwp/api/Windows.UI.Xaml.Controls.Pivot?view=winrt-10240) looks just like the pivot we know from Windows Phone.

```xml title="MainPage.xaml"
<PivotItem Header="item 1">
    <TextBlock>Content 1</TextBlock>
</PivotItem>
```

![Default Pivot in a UWP app](/wp-content/uploads/2010/06/responsive-header-default.png)

## Adding an icon to the header

So, the first step is to add an icon and do some styling. A bit lazy I used the [Pivot sample](https://github.com/Microsoft/Windows-universal-samples/tree/master/Samples/XamlPivot) from the Windows Universal Samples as a starting point.

```xml title="MainPage.xaml"
<PivotItem>
    <PivotItem.Header>
        <local:TabHeader Label="item 1" Glyph="&#xE716;" />
    </PivotItem.Header>
    <TextBlock>Content 1</TextBlock>
</PivotItem>
```

![Icon in Pivot Header with problem](/wp-content/uploads/2010/06/responsive-header-icon.png)

Immediately we spot a problem. It seems the Pivot Header has a fixed height.

Browsing around I found a [MSDN forum post](https://web.archive.org/web/20230330110717/https://social.msdn.microsoft.com/Forums/en-US/8c123ae3-2884-4d40-a5d1-0a22355fcd5f/uwpxamlhow-to-increase-pivot-header-height-in-uwp?forum=wpdevelop&WT.mc_id=DT-MVP-5004268) and a [Stack Overflow question](https://stackoverflow.com/questions/31426175/how-to-increase-pivot-header-height-in-uwp) about this.
Both are resolved using code to adjust the height of the items.

Because we want a responsive solution where the height is not known beforehand, code is not the best option.
Lucky for us, Microsoft has added the Live Visual Tree tool in Visual Studio 2015 making it possible to debug what is happening in the app at runtime.
This shows that the [`PivotHeaderItem` control](https://learn.microsoft.com/uwp/api/Windows.UI.Xaml.Controls.Primitives.PivotHeaderItem?view=winrt-10240) has a default Style with a fixed height.

![Visual Studio 2015 Live Visual Tree showing the fixed height from the default template](/wp-content/uploads/2015/09/visual-studio-2015-live-visual-tree.png)

The problem is that Visual Studio does not have any option to edit (a copy of) this template.
So, we have to get it the hard way.

To find the default template of every control and style in UWP apps we have to go to the following file:

```plain frame=terminal
%ProgramFiles(x86)%\Windows Kits\10\DesignTime\CommonConfiguration\Neutral\UAP\
10.0.10240.0\Generic\generic.xaml
```

Look for the PivotHeaderItem template and copy it to the Resources Dictionary for your preferred scope.  
In the Style we change the Height to `Auto`.

```xml title="MainPage.xaml"
<Setter Property="Height" Value="Auto" />
```

If the height of your pivot header can be less than 36 you will also need the modify the height of the _Previous_ and _Next_ buttons in the Pivot Header as these have a fixed height too.
These changes are made in the Pivot Style.

```xml title="MainPage.xaml"
<Button x:Name="PreviousButton" ... Height="Auto" ... />
<Button x:Name="NextButton" ... Height="Auto"  ... />
```

### Create a copy of the Pivot Style

If you don’t know how to edit a copy of a Style, here are the 3 steps to follow:

1. Select the Pivot in the <kbd>Document Outline</kbd>
2. Right Click and select <kbd>Edit Template</kbd>
3. Choose <kbd>Edit a Copy...</kbd>

## Make the Pivot Header Item responsive

First, I will list how I want the header items to respond:

- If the app is narrow, the icon is centered above the label
- If the app is wide, the label is on the right side of the icon
- The transition from narrow to wide is at `500`

Getting this working is quite easy in UWP apps without writing any code at all.  
For this we use the new [`AdaptiveTrigger` class](https://learn.microsoft.com/uwp/api/Windows.UI.Xaml.AdaptiveTrigger?view=winrt-10240) and the [`RelativePanel` control](https://learn.microsoft.com/uwp/api/Windows.UI.Xaml.Controls.RelativePanel?view=winrt-10240).

We alter the `TabHeader.xaml` adding a `RelativePanel` for layout and `VisualStates` for the transition. Something like this:

```xml title="TabHeader.xaml"
<VisualStateManager.VisualStateGroups>
  <VisualStateGroup>
    <VisualState x:Name="Narrow">
      <VisualState.StateTriggers>
        <AdaptiveTrigger MinWindowWidth="0" />
      </VisualState.StateTriggers>
      <VisualState.Setters>
        <Setter Target="Icon.(RelativePanel.AlignHorizontalCenterWithPanel)"
                Value="True" />
        <Setter Target="LabelText.(RelativePanel.Below)"
                Value="Icon" />
        <Setter Target="LabelText.(RelativePanel.AlignHorizontalCenterWith)"
                Value="Icon" />
      </VisualState.Setters>
    </VisualState>
    <VisualState x:Name="Wide">
      <VisualState.StateTriggers>
        <AdaptiveTrigger MinWindowWidth="500" />
      </VisualState.StateTriggers>
      <VisualState.Setters>
        <Setter Target="Icon.(RelativePanel.AlignVerticalCenterWithPanel)"
                Value="True" />
        <Setter Target="LabelText.(RelativePanel.RightOf)"
                Value="Icon" />
        <Setter Target="LabelText.(RelativePanel.AlignVerticalCenterWith)"
                Value="Icon" />
        <Setter Target="RelativePanel.Margin"
                Value="0,0,12,0"/>
        <Setter Target="Icon.Margin"
                Value="0,0,0,0"/>
      </VisualState.Setters>
    </VisualState>
  </VisualStateGroup>
</VisualStateManager.VisualStateGroups>
<RelativePanel x:Name="RelativePanel">
  <FontIcon x:Name="Icon"
            HorizontalAlignment="Center"
            Margin="0,12,0,0"
            Glyph="{Binding Glyph}"
            FontSize="16" />
  <TextBlock x:Name="LabelText"
             Text="{Binding Label}"
             Style="{StaticResource CaptionTextBlockStyle}"
             Margin="2,4,2,4" />
</RelativePanel>
```

Run the app and resize it so we see the pivot items change when it's wide enough.

![Responsive Pivot Header Items](/wp-content/uploads/2015/09/responsive-header-wide.png)

## Aligning the Pivot Header Items

I like it when the pivot items are centered in the mobile layout.
To achieve this, we need to add the visual states to the pivot style.

If you do not have a pivot style already, look in the previous section how to create a copy of the style.

We add the Visual State Group the existing `VisualStateManager.VisualStateGroups` in the `RootElement` of the pivot `ControlTemplate`:

```xml title="MainPage.xaml"
<VisualStateGroup>
  <VisualState x:Name="Narrow">
    <VisualState.StateTriggers>
      <AdaptiveTrigger MinWindowWidth="0" />
    </VisualState.StateTriggers>
    <VisualState.Setters>
      <Setter Target="HeaderClipper.HorizontalContentAlignment"
              Value="Center" />
    </VisualState.Setters>
  </VisualState>
  <VisualState x:Name="Wide">
    <VisualState.StateTriggers>
      <AdaptiveTrigger MinWindowWidth="500" />
    </VisualState.StateTriggers>
    <VisualState.Setters>
      <Setter Target="HeaderClipper.HorizontalContentAlignment"
              Value="Stretch" />
    </VisualState.Setters>
  </VisualState>
</VisualStateGroup>
```

Now the items are **centered** when the app is _narrow_; and **left-aligned** when the app is _wide_.

![The Pivot Header Items centered](/wp-content/uploads/2015/09/responsive-header-aligned.png)

## Source code

You can download my [Universal Windows Platform App sample project](https://github.com/eNeRGy164/DynamicPivot) on GitHub.

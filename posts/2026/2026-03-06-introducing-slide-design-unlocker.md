---
id: 2140
title: Introducing Slide Design Unlocker
date: 2026-03-06T12:00:00+01:00
author: Michaël Hompus
excerpt: >
  PowerPoint Designer produces great-looking slides, but the shapes it inserts
  are often locked and cannot be selected, moved, or resized through the normal UI.

  I reverse-engineered the PPTX XML to find out why, then built a small Windows
  app to inspect and remove those locks. It is now available in the Microsoft
  Store.
permalink: /2026/03/06/introducing-slide-design-unlocker/
image: /wp-content/uploads/2026/03/post-2026-03-06-thumbnail.png
categories:
  - Office
tags:
  - PowerPoint
  - Designer
  - WinUI3
  - Open XML
  - Microsoft Store
---

I use [PowerPoint][PPT_STACK] a lot. It is my tool for telling stories, with animations, [emoji][PPT_EMOJI],
and more. To get inspiration, I like to use the [Designer][PPT_SMARTART].
As [Karen Roem][KAREN] describes it, Designer gives you a _smart start_ that you can tweak from there.  
The results are often good enough to keep almost as-is.

Almost.

Sometimes the generated design fits the story but not quite the available space.
I want to nudge a shape a few pixels to the left, or resize it to make room for
an extra label. But nothing happens. The cursor does not change, the shape cannot be selected.
I cannot move it or resize it. It is stuck.

I had to investigate.

<!--more-->

If you need some inspiration for a slide, you can press the <kbd>Designer</kbd> button and get a range of layout suggestions.

![The Design Ideas pane showing several layout suggestions for a slide](/wp-content/uploads/2026/02/powerpoint-designer-options.png "PowerPoint Designer suggesting layout options")

After selecting a layout from the <kbd>Designer</kbd> pane, most visual elements on the slide are locked in place.

![A triangle shape selected on the slide showing no resize or move handles](/wp-content/uploads/2026/02/powerpoint-designer-applied.png "Applied Designer layout: the triangle is selected but not editable")

When you are able to select the shape, for example via the <kbd>Selection</kbd> pane, the ribbon only offers a handful of color options.

![The ribbon showing only limited color-related controls for the locked shape](/wp-content/uploads/2026/02/powerpoint-designer-ribbon.png "The ribbon is mostly grayed out for a locked Designer shape")

The <kbd>Format Shape</kbd> pane is no help either, because it is grayed out too.

![The Format Shape pane with all controls disabled](/wp-content/uploads/2026/02/powerpoint-designer-format-shape.png "Format Shape pane: disabled for locked shapes")

There is one workaround: select the shape through the <kbd>Selection</kbd> pane, then
press the context menu key on your keyboard. That reveals an <kbd>Unlock</kbd> option.
It works one shape at a time, or the whole slide if you select all.
Across multiple slides, that adds up quickly.

![The context menu revealing an Unlock option for a shape selected via the Selection Pane](/wp-content/uploads/2026/02/powerpoint-designer-context-menu.png "Keyboard context menu key revealing the Unlock option")

## Why Designer locks its shapes

I could not find an official Microsoft explanation for this behavior.
My guess is that [Designer][DESIGNER] does not just insert shapes. It also manages them.

When you click a _different_ suggestion in the <kbd>Designer</kbd> pane,
Designer finds all its own shapes on the slide and replaces them as a group, cleanly.
If some of those shapes had been partially edited, that group replacement would no longer produce a predictable result.

When you pick a layout from the <kbd>Designer</kbd> pane,
Designer inserts a set of carefully proportioned and aligned shapes as a unit.
The locks prevent accidental modifications, keeping the visual coherence of the layout intact.

> [!WARNING]
> The locks are there for a reason. Removing them may prevent Designer from
> cleanly replacing or updating the layout later. Proceed at your own risk.

## How the locks are stored

A PPTX file is a ZIP archive. The slides inside are stored as XML, and that is where the
locking mechanism lives.

For each shape it inserts, Designer adds an ownership tag in a proprietary
Microsoft Office 2016 extension namespace:

```xml
<p16:designElem
  xmlns:p16="http://schemas.microsoft.com/office/powerpoint/2015/09/main"
  val="1" />
```

It then sets lock attributes using the DrawingML [`a:spLocks`][SPLOCKS] element:

```xml
<a:spLocks noMove="1" noResize="1" noRot="1" noSelect="1" />
```

The `a:spLocks` element can carry up to ten boolean attributes, each disabling a specific editing action.
PowerPoint respects all of them, but gives you almost no visible clue that it is doing so.

> [!NOTE]
> The `p16:` namespace is a proprietary Microsoft extension and is not part of the public
> [ECMA-376 Open XML][ECMA376] standard.
> The Open XML SDK does expose `p16:designElem` as the [`DesignElement`][DESIGNELEM] class,
> available in Office 2016 and above, but without a formal XML specification.

Once I knew where the locks lived, editing them in a controlled way became a tooling problem
rather than a PowerPoint problem.

## The app

I already wanted to give [WinUI 3][WINUI3] a try and build with XAML again.
It has been a long time since my [UWP development days][WINDOWS_UWP], so this was a fun excuse to do both.

The [Open XML SDK][OPENXML_SDK] (`DocumentFormat.OpenXml`) made reading and
writing the PPTX structure straightforward. There is a typed C# class for almost
every element in the spec, which made the implementation feel clean.

![Slide Design Unlocker start screen with a button to select a .pptx file](/wp-content/uploads/2026/02/slide-design-unlocker-start.png "Slide Design Unlocker: select a .pptx file to get started")

**Slide Design Unlocker** opens a `.pptx` file and shows three panels:

- **Slides** on the left, with a padlock icon on any slide that contains locked
  shapes.
- **Elements** in the middle, listing every shape on the selected slide, again
  with a padlock icon for those that carry active locks.
- **Locks** on the right, with eleven toggle switches for the selected shape.

![Slide Design Unlocker showing the Slides, Elements, and Locks panels with padlock icons](/wp-content/uploads/2026/02/slide-design-unlocker-locks.png "Slide Design Unlocker: main window with the three panels")

The eleven toggles map directly to the XML:

| Description                     | XML attribute / element        |
| ------------------------------- | ------------------------------ |
| Is a design element             | `p16:designElem`               |
| Disallow Shape Movement         | `a:spLocks noMove`             |
| Disallow Shape Resize           | `a:spLocks noResize`           |
| Disallow Shape Rotation         | `a:spLocks noRot`              |
| Disallow Shape Point Editing    | `a:spLocks noEditPoints`       |
| Disallow Showing Adjust Handles | `a:spLocks noAdjustHandles`    |
| Disallow Arrowhead Changes      | `a:spLocks noChangeArrowheads` |
| Disallow Shape Type Change      | `a:spLocks noChangeShapeType`  |
| Disallow Shape Text Editing     | `a:spLocks noTextEdit`         |
| Disallow Aspect Ratio Change    | `a:spLocks noChangeAspect`     |
| Disallow Shape Selection        | `a:spLocks noSelect`           |

![The Locks panel showing eleven toggle switches, now unlocked for the selected rectangle](/wp-content/uploads/2026/02/slide-design-unlocker-unlocking.png "The lock toggles for the selected shape, now unlocked")

Turn off the toggles for the shape you want to edit, save, then reopen the file
in PowerPoint. The shape is now a normal, editable element.

![The triangle shape now showing full resize and move handles after unlocking](/wp-content/uploads/2026/02/powerpoint-designer-editable.png "The triangle is now fully editable in PowerPoint")

> [!NOTE]
> The app only modifies the XML lock flags. Styles, animations, and theme settings stay untouched.

## Bonus: lock shapes the other way

Because the toggles are symmetric, the app works in both directions.
If you want to protect a shape from accidental changes, like a carefully positioned
logo, a decorative element you spent time aligning, or a chart you do not want
nudged, you can enable the relevant locks yourself. Designer is not involved:
the same `a:spLocks` attributes work on any shape in any presentation.

## Get it from the Microsoft Store

That triangle finally moved, all I had to do was build my own application. 😉  
I actually built the application more than four years ago,
when PowerPoint did not have the lock/unlock feature at all in the UI.
I just never got around to finishing and publishing it.

But even now, the granularity of the official unlock option is quite limited,
and I still use my app regularly to unlock individual shapes and control all 11 lock settings directly.

**Slide Design Unlocker** is free, requires no account or sign-in, and transmits no data or telemetry.
It is [available now in the Microsoft Store][STORE], and the source code is also available on [GitHub][GITHUB].

If you run into something unexpected, have a suggestion, or just want to share
what you unlocked, feel free to reach out to me.

[DESIGNELEM]: https://learn.microsoft.com/dotnet/api/documentformat.openxml.office2016.presentation.designelement?view=openxml-3.0.1
[DESIGNER]: https://support.microsoft.com/office/create-professional-slide-layouts-with-designer-53c77d7b-dc40-45c2-b684-81415eac0617
[ECMA376]: https://ecma-international.org/publications-and-standards/standards/ecma-376/
[GITHUB]: https://github.com/eNeRGy164/SlideDesignUnlocker
[KAREN]: https://www.linkedin.com/feed/update/urn:li:activity:7432818388609159168?commentUrn=urn%3Ali%3Acomment%3A%28activity%3A7432818388609159168%2C7433060236074201088%29&dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287433060236074201088%2Curn%3Ali%3Aactivity%3A7432818388609159168%29
[OPENXML_SDK]: https://learn.microsoft.com/office/open-xml/open-xml-sdk
[PPT_EMOJI]: /2022/06/28/quick-powerpoint-tip-switch-between-emoji-and-text-rendering/
[PPT_SMARTART]: /2026/02/26/hidden-powerpoint-smartart-layouts/
[PPT_STACK]: /2022/06/27/quick-powerpoint-tip-stack-emoticons/
[SPLOCKS]: https://learn.microsoft.com/dotnet/api/documentformat.openxml.drawing.shapelocks?view=openxml-3.0.1
[STORE]: https://apps.microsoft.com/detail/9MVBM8LH8397
[WINUI3]: https://learn.microsoft.com/windows/apps/winui/winui3/
[WINDOWS_UWP]: /2015/11/18/highlight-your-selected-pivot-header-in-a-universal-windows-platform-app/

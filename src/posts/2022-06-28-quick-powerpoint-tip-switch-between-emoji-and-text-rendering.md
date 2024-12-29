---
id: 2095
title: "Quick PowerPoint tip: Switch between emoji and text rendering"
date: 2022-06-28T16:32:40+02:00
updated: 2022-06-28T17:01:37+02:00
author: Michaël Hompus
excerpt: >
  When adding emoticons to your PowerPoint slides, sometimes the rendering might not be as expected.

  For example, PowerPoint renders the emoticon only in a textual, monochrome variant on the slide.

  So, how can we influence this behavior?
permalink: /2022/06/28/quick-powerpoint-tip-switch-between-emoji-and-text-rendering/
image: /wp-content/uploads/2022/06/post-2095-thumbnail.png
categories:
  - Office
tags:
  - Emoticon
  - PowerPoint
  - Quick
  - Unicode
---

When adding emoticons to your PowerPoint slides, sometimes the rendering might not be as expected.

<!--more-->

For example, when selecting the _desktop_ emoticon on my system,
PowerPoint renders the emoticon only in a textual, monochrome variant on the slide.

![After selecting the desktop emoticon, it is rendered as text, not an emoji.](/wp-content/uploads/2022/06/monochrome-desktop.png "After selecting the desktop emoticon, it is rendered as text, not an emoji.")

> [!NOTE]
> I encountered this behavior multiple times myself and can depend on the machine used to view the PowerPoint presentation,
> while other persons looking at the same file at the same time can see the emoji rendering.

So, how can we influence this behavior?

## Unicode variation selector

I discovered an old post by [Matias Singers][MTS] about [Unicode symbol as text or emoji][MTS_UNICODE_SYMBOL].  
The article describes the Unicode _variation selectors_.

By adding _variation selector-15_, or _variation selector-16_,
after an emoticon the rendering of the character can be influenced.

## Switch from text to emoji

Using [variation selector-16][VARIATION_SELECTOR_16] after the emoticon,
the character will be forced to be rendered as a colorful image.
Inserting character `U+FE0F` after the _desktop_ character will change it in the expected emoji:

![The _desktop_ emoticon rendered as a colorful emoji after adding variation selector-16.](/wp-content/uploads/2022/06/colorful-desktop.png "The desktop emoticon rendered as a colorful emoji after adding variation selector-16.")

## Switch from emoji to text

This can also be used the other way around.
When a more textual or monochrome variant would be beneficial, this can be forced to render as well.

Let's start with the _house with garden_ emoticon.

![The *house with garden* emoticon rendered as a colorful emoji.](/wp-content/uploads/2022/06/colorful-house.png "The *house with garden* emoticon rendered as a colorful emoji.")

Using [variation selector-15][VARIATION_SELECTOR_15] after the emoticon,
the character will be forced to be rendered in a textual fashion.
Inserting character `U+FE0E` after the _house with garden_ character will change it into a monochrome house with a flower:

![The emoticon rendered in a textual fashion after adding variation selector-15.](/wp-content/uploads/2022/06/monochrome-house.png "The emoticon rendered in a textual fashion after adding variation selector-15.")

[MTS]: https://mts.io/
[MTS_UNICODE_SYMBOL]: https://mts.io/2015/04/21/unicode-symbol-render-text-emoji/
[VARIATION_SELECTOR_16]: https://codepoints.net/U+FE0F
[VARIATION_SELECTOR_15]: https://codepoints.net/U+FE0E

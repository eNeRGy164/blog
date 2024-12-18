---
id: 2063
title: My Advent of Code 2021
date: 2022-01-03T17:11:10+01:00
updated: 2022-01-03T17:11:11+01:00
author: Michaël Hompus
excerpt: >
  I recently joined the Advent of Code 2021.
  During the first 25 days of December, the challenges made me (re)discover many possibilities with C#,
  some that are long available but maybe not that well known.

  I share my code and list of concepts that might inspire you to discover a feature you were not aware of yet!
layout: ../layouts/BlogPost.astro
permalink: /2022/01/03/my-advent-of-code-2021/
image: /wp-content/uploads/2022/01/advent-of-code-2019.jpeg
categories:
  - C#
tags:
  - Advent of Code
  - Code
  - CSharp
  - GitHub
---

Although [Eric Wastl][WASTL] has been organizing the [Advent of Code][AOC] since 2015.
I only discovered it recently when some colleagues invited me to join the 2021 edition.

> _Advent of Code_ is an Advent calendar of small programming puzzles for a variety
> of skill sets and skill levels that can be solved in any programming language you like.
>
> [About][AOC_ABOUT]

During the first 25 days of December, the challenges made me (re)discover many possibilities with C#,
some that are long available but maybe not that well known.

<!--more-->

## Solutions

I had a blast (and some frustration 😉) solving the challenges, starting early morning, every day.

Some of the noteworthy concepts I have used:

- Records, both `class` (C# 9.0) and `struct` (C# 10.0) based.
- Converting data (bits to `int` with bit shifting, `char` to decimal using _addition_ or _subtraction_, etc.).
- Efficiently read and slice strings, arrays, and lists using `Index` and `Range` (C# 8.0).
- Work with `Stack<T>` (.NET Framework 2.0), `SortedSet<T>` (.NET Framework 4.0), and `HashSet<T>` (.NET Framework 4.7.2).
- Using `init` only setters, `with` expressions and target typed `new` expressions (all C#9.0).
- Many, many more…

I have put all my code and descriptions in my [AdventOfCode2021][GITHUB_REPO] repo on GitHub.  
Maybe this also inspires you to discover a new feature you were not aware of yet!

[WASTL]: https://was.tl/
[AOC]: https://adventofcode.com/
[AOC_ABOUT]: https://adventofcode.com/about
[GITHUB_REPO]: https://github.com/eNeRGy164/AdventOfCode2021

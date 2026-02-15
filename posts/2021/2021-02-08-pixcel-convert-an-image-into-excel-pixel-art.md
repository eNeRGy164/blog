---
id: 1940
title: "Pixcel: Convert an image into Excel pixel art"
date: 2021-02-08T17:24:39+01:00
updated: 2021-02-09T08:47:24+01:00
author: Michaël Hompus
excerpt: >
  Last week I received an invitation for a social work meeting about "Pixel art in spreadsheets".

  I thought: "How hard can it be".

  Well, it is about 25 lines of C# 9.0 hard! 😁
permalink: /2021/02/08/pixcel-convert-an-image-into-excel-pixel-art/
image: /wp-content/uploads/2021/02/post-2021-02-08-thumbnail.png
categories:
  - C#
  - Office
tags:
  - EmguCV
  - EPPlus
  - Fun
  - Open Source
  - OpenCV
  - Pixel Art
  - Pixels
thumbnail:
  title: "Pixcel: Image to Excel Pixel Art"
  subtitle: >
    Converting images into Excel pixel art in about 25 lines of C# 9.0.
---

Last week I received an invitation for a social work meeting about "Pixel art in spreadsheets".

I thought: _"How hard can it be?"_.

Well, it is about 25 lines of C# 9.0 hard! 😀

<!--more-->

## The code

Using [my past experience][BLOG_DOTNETFLIX_ML_XBOX] with [EmguCV][EMGUCV] (OpenCV for .NET)
and [EPPlus][EPPLUS] (Excel spreadsheets for .NET), it was quickly built.

```csharp title="Program.cs"
var source = args[0];

if (!File.Exists(source))
  throw new FileNotFoundException($"Input image not found", source);

var sourceImage = CvInvoke.Imread(source);
var mat = new Mat();

CvInvoke
  .ResizeForFrame(sourceImage, mat, new Size(64, 64), Inter.Lanczos4, true);

var image = mat.ToImage<Bgr, byte>();

ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

using var package = new ExcelPackage(
  new FileInfo(source.Replace(Path.GetExtension(source), ".xlsx"))
);

var worksheet = package.Workbook.Worksheets["Pixcel"]
                ?? package.Workbook.Worksheets.Add("Pixcel");

for (var y = 1; y <= image.Height; y++)
{
  worksheet.Row(y).Height = 27.5;

  for (var x = 1; x <= image.Width; x++)
  {
    worksheet.Column(x).Width = 5;
    worksheet.Cells[y, x].Style.Fill.PatternType = ExcelFillStyle.Solid;
    worksheet.Cells[y, x].Style.Fill.BackgroundColor.SetColor(
      0,
      image.Data[y-1, x-1, 2],
      image.Data[y-1, x-1, 1],
      image.Data[y-1, x-1, 0]
    );
  }
}

package.Save();
```

<small>Added wrapping for readability.</small>

## The result

![Animation of using the Pixcel app by dragging a JPG file over the executable in Windows Explorer](/wp-content/uploads/2021/02/demo.gif "Demonstration of the Pixcel app.")

## The source

Liking the result, I christened the project **Pixcel** and shared the [code on GitHub][GITHUB_REPO].

[BLOG_DOTNETFLIX_ML_XBOX]: /2020/10/19/three-episodes-about-machine-learning-and-xbox-achievements-at-dotnetflix
[EMGUCV]: https://www.emgu.com/
[EPPLUS]: https://www.epplussoftware.com/
[GITHUB_REPO]: https://github.com/eNeRGy164/Pixcel

---
id: 2124
title: "Generating PDFs with Playwright in .NET: A Pleasant Surprise"
date: 2025-02-14T22:00:00+01:00
updated: 2025-02-14T22:00:00+01:00
author: Michaël Hompus
excerpt: >
  I expected Playwright to handle browsers,
  but it turned out to be a powerful engine for creating PDFs.
  In this post I walk through building a .NET service that renders HTML templates and exports them as PDFs with Playwright.
permalink: /2025/02/14/playwright-pdf-generation-in-dotnet/
image: /wp-content/uploads/2025/02/post-2025-02-10-thumbnail.png
categories:
  - Development
tags:
  - Playwright
  - PDF
  - .NET
  - Templates
  - Automation
  - Hangfire
  - CSS
---

When I needed a PDF generator for a new .NET application,
I expected to reach for a library like iText or DinkToPdf.
Instead I stumbled upon [Playwright](https://playwright.dev/),
a browser automation tool I already used for end-to-end testing.
It turned out to be a surprisingly great fit for producing rich PDF documents.

In this post I will show how I ended up using Playwright
and how you can reproduce the same approach.

<!--more-->

## 1. Add Playwright to the application

Start by adding the [`Microsoft.Playwright`](https://www.nuget.org/packages/Microsoft.Playwright/) package.
After restoring packages run the Playwright CLI to download the required browsers:

```bash
playwright install
```

With the dependencies in place you can launch Chromium in headless mode:

```csharp
using Microsoft.Playwright;

using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync(new()
{
    Headless = true
});
```

## 2. Create an HTML template with placeholders

Next design an HTML template for the PDF content.
Use simple placeholders that you can replace at runtime:

```html title="Templates/invoice.html"
<html>
  <body>
    <h1>Invoice {{number}}</h1>
    <p>Customer: {{customer}}</p>
    <p>Total: {{total}}</p>
  </body>
</html>
```

## 3. Replace placeholders at runtime

Load the template and swap the placeholders for real values before rendering:

```csharp
var template = await File.ReadAllTextAsync("Templates/invoice.html");
var html = template
    .Replace("{{number}}", invoice.Number)
    .Replace("{{customer}}", invoice.Customer)
    .Replace("{{total}}", invoice.Total.ToString("C"));
```

## 4. Generate the PDF

Finally instruct Playwright to render the HTML and produce a PDF:

```csharp
var page = await browser.NewPageAsync(new() { ViewportSize = new() { Width = 595, Height = 842 } });
await page.SetContentAsync(html);
var pdfBytes = await page.PdfAsync(new() { Format = "A4" });
```

The resulting byte array can be written to disk, returned from an API, or stored in a database.
A complete example project is available on [GitHub](https://github.com/eNeRGy164/CreatePdfs.Playwright).

## Notes and next steps

- **Background jobs** – The same code runs perfectly in a background worker like [Hangfire](https://www.hangfire.io/),
  letting you offload PDF generation from the request pipeline.
- **Fonts and styling** – Any font that the browser can render can be embedded via CSS.
  Add `@font-face` rules and Playwright will include the fonts in the PDF.
- **More control** – Use Playwright's `Page.PdfAsync` options to tweak page size, margins, or headers and footers.

Playwright may not be the first tool you think of for PDF generation,
but it gives you a full browser engine and a flexible API.
If you already use it for testing, you have everything you need to create beautiful PDFs as well.

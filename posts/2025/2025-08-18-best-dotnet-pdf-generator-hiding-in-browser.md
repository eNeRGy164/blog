---
id: 2124
title: The best .NET PDF generator was hiding in your browser all along
date: 2025-08-18T23:00:00+01:00
author: Michaël Hompus
excerpt: >
  Generating PDFs in .NET is often painful—low-level drawing APIs,
  rigid libraries, and pricey licenses all get in the way.

  Playwright flips the script: design with plain HTML and CSS, then export directly to PDF.
  This walkthrough shows how to load a template, replace placeholders at runtime,
  and generate a styled PDF with Playwright in .NET.
permalink: /2025/08/18/playwright-pdf-generation-in-dotnet/
image: /wp-content/uploads/2025/08/post-2025-08-18-thumbnail.png
categories:
  - C#
tags:
  - Playwright
  - PDF
  - CSS
---

Generating a nicely formatted PDF is surprisingly hard with traditional .NET libraries.
Pixel‑perfect layout often requires low‑level drawing APIs or proprietary tooling.

When looking for a solution, I stumbled upon
[Microsoft Playwright](https://playwright.dev/), a library for end-to-end testing in the browser.

This in itself might not sound like a good fit for PDF generation,
but if you know that the print preview inside a Chromium browser is actually a rendered PDF, it makes more sense.

So if we can render HTML in a browser, we can also export it to PDF.
And this gives us all the flexibility of HTML and CSS for layout,
without the hassle of low-level drawing APIs.

<!--more-->

For this article, we will create a simple .NET console application
that generates a PDF from an HTML template using Playwright.
Playwright integration is not limited to .NET, there are also libraries
for JavaScript, Python, and Java, so you can use it in your preferred language.

## 1. Add Playwright to the application

Start by adding the [`Microsoft.Playwright`](https://www.nuget.org/packages/Microsoft.Playwright/) package.
After restoring packages run the Playwright CLI to download the required browsers.

The smallest installation is Chromium with only the shell dependencies, which is sufficient for PDF generation:

```shell
.\bin\Debug\net9.0\playwright.ps1 install chromium --with-deps --only-shell
```

With the dependencies in place you can launch Chromium in headless mode:

```csharp
using Microsoft.Playwright;

// Create an instance of Playwright
using var playwright = await Playwright.CreateAsync();

// Launch a Chromium browser instance
await using var browser = await playwright.Chromium.LaunchAsync();
```

## 2. Create an HTML template with placeholders

Create a template that contains placeholders for the dynamic parts.
The demo project ships with `html-template.html` embedded as a resource.

It also shows how the CSS page rules can be used to set the page size, margins, and headers/footers:

```html title="html-template.html"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>{{title}}</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
      @top-center { content: "Page Header"; }
      @bottom-right { content: counter(page) " of " counter(pages); }
    }
  </style>
</head>
<body>
  <h1>PDF Generation Demo</h1>
  <p>{{body}}</p>
  <p><address>https://blog.hompus.nl</address></p>
</body>
</html>
```

## 3. Replace placeholders at runtime

Load the template and swap the placeholders for real values before rendering.
To keep things simple, we’ll generate some random body text with a
[Lorem Ipsum library](https://www.nuget.org/packages/Lorem.NetCore):

```csharp
// Create a temporary directory to store the generated files
var tempDir = Directory.CreateTempSubdirectory("pdfs_");
// Define the path for the HTML file that will be used as input for the PDF
var outputPath = Path.Combine(tempDir.FullName, "pdf-input.html");

// Load the embedded HTML template resource from the assembly
using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("CreatePdfs.Playwright.html-template.html");

// Read the HTML template into a byte buffer
Span<byte> buffer = new byte[stream.Length];
stream.ReadExactly(buffer);

// Convert the byte buffer to a UTF-8 string
var templateHtml = Encoding.UTF8.GetString(buffer);

// Generate placeholder content for the body using Lorem.NETCore
// Settings: Generate 20 paragraphs with between 3 and 8 sentences per paragraph, and between 8 and 10 words per sentence.
var generatedBody = string.Join("</p><p>", LoremNETCore.Generate.Paragraphs(8, 20, 3, 8, 20));

// Replace placeholders in the HTML template with actual content
using var outputFile = File.CreateText(outputPath);
outputFile.Write(templateHtml!
    .Replace("{{title}}", "Hello, World!") // Replace the title placeholder
    .Replace("{{body}}", generatedBody)  // Replace the body placeholder with generated content
);
outputFile.Close();
```

## 4. Generate the PDF

Finally instruct Playwright to navigate to the generated HTML file and export a PDF:

```csharp
// The output path for the generated PDF file
var pdfPath = outputPath.Replace(".html", ".pdf");

// Create a new browser page
var page = await browser.NewPageAsync();

// Navigate to the generated HTML file
await page.GotoAsync(outputPath); // The browser can load files from the local file system

// Generate a PDF from the HTML content
await page.PdfAsync(new PagePdfOptions
{
    DisplayHeaderFooter = true, // Enable header and footer in the PDF
    Landscape = false,          // Use portrait orientation
    PreferCSSPageSize = true,   // Use CSS-defined page size
    Tagged = true,              // Enable tagged PDF for accessibility (e.g., helps screen readers navigate)
    Path = pdfPath,             // Define the output path for the PDF
    Outline = true,             // Include an outline (bookmarks) in the PDF
});
```

The resulting file can be saved, returned from an API or just opened.
The complete example project is available on [GitHub](https://github.com/eNeRGy164/CreatePdfs.Playwright).

## Notes and next steps

- **Background jobs** – The same code runs perfectly in a background worker like [Hangfire](https://www.hangfire.io/),
  letting you offload PDF generation from the request pipeline.
- **Fonts and styling** – Any font that the browser can render can be embedded via CSS.
  Add `@font-face` rules and Playwright will include the fonts in the PDF. Just remember that fonts might not be available in a container, so to be safe, add the font as `woff` files to your project and reference them in the CSS.

  ```css
  @font-face {
    font-family: "Open Sans";
    src: url("/fonts/OpenSans.woff") format("woff");
  }

  body {
    font-family: "Open Sans", sans-serif;
  }
  ```

Playwright may not be the first tool you think of for PDF generation,
but it gives you a full browser engine and a flexible API.

It turns out the best PDF library is… a browser pretending it's a printer.

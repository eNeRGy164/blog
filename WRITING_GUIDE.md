# Blog writing style guide

## Voice and audience

- Audience: software engineers and IT pros; assume technical context but explain non-obvious choices.
- Voice: first person, practical, calm; mix “I” (experience) with “you” (guidance); avoid hype.
- Language: clear and direct, non-native English is fine; prefer simple sentences and plain wording.
- Tone: matter-of-fact and helpful; avoid marketing language, slang, and heavy idioms.

## Quotes and punctuation

- The renderer converts "quotes" to smartquotes, so in the markdown we can use simple quotes like `'` and `"`.
- Use plain double quotes for simple quoting.
- Use <q>...</q> only for short quoted phrases, not for titles or headings.
- Avoid em dashes. Use commas or separate sentences instead.

## Language patterns

- Use a short opener in the excerpt or intro to set expectations (e.g., "In this article I show…", "Learn what belongs…").
  Vary the phrasing naturally; avoid copy/pasting the same formula across posts.
- Prefer short paragraphs (1–3 sentences) and a steady, step-by-step flow.
- Avoid contractions when clarity matters (`do not`, `cannot`, `it is`).
- Use occasional questions to frame the problem (“How do I know?”, “But what if…?”).
- Close with a practical next step, a link, or a short "I might come back to this" note.
- Use `<q>...</q>` for short quoted phrases and dialogue (e.g., `<q>this was never negotiable</q>`), not for titles or long quotations.
- For technical tutorials, include context before diving into steps (the "why" before the "how").
- Reference your own previous articles when building on earlier work (e.g., "In my previous article...").
- When explaining code, describe what it does before showing the implementation.

## Structure

- Keep the intro focused on the article content.
- Then insert `<!--more-->`.
- Place banners, event promos, and big CTAs after `<!--more-->` unless the post is primarily an announcement.
- Sections: use `##` headings (and occasional `###`).
- Lists: numbered steps for procedures; bullets for lists and summaries.
- Images: include descriptive alt text and titles for accessibility; use screenshot annotations when helpful.
- Videos: embed YouTube videos using the full URL format: `<https://www.youtube.com/embed/{id}?list={listId}>`.

## Formatting

- Short paragraphs.
- Backtick identifiers, classes, paths, and config keys.
- Prefer tables for enumerations and constant lists.
- Code fences with language tags; add titles when it helps (e.g., ` ```md title="04-solution-strategy.md" `).
- Add `showlinenumbers` and `startlinenumber="<number>"` to code blocks when showing specific line ranges from real files.
- Use callouts like `> [!NOTE]` for caveats or additional context, `> [!TIP]` for practical advice, and `> [!WARNING]` for common pitfalls or easy-to-miss gotchas.
- Checkboxes for actionable checklists: `🔲` for unchecked items.
- Use `<kbd>...</kbd>` for keyboard shortcuts and UI navigation (e.g., `<kbd>Font</kbd> > <kbd>Subscript</kbd>`).
- Add `<small>...</small>` for inline clarifications like measurement units or readability notes (e.g., `<small>(0.475kg CO₂/kWh is an average for The Netherlands)</small>`).
- Use italic text with underscores for emphasis on specific words (e.g., `_running_`, `_local_`).
- Use blockquotes (`>`) to present filled-in examples (e.g., a completed template), so they are visually distinct from the surrounding guidance.

## Links and wrap-up

- Prefer reference-style links at the end for docs/GitHub; inline links are fine for quick mentions.
- For series posts, link back to earlier chapters and forward to the next one.
- End with one of:
  - a short conclusion plus a next step
  - a link to source code
  - a pointer to the next post in the series

## Series posts

When writing a series of related posts, maintain consistency:

- Use the `series: <Series Name>` field in frontmatter for all posts in the series.
- Cross-link between posts: reference earlier chapters when building on concepts, preview next chapters in the wrap-up.
- Use the pattern `Next up: [chapter title](link), where we…` to close series posts and lead readers forward.
- Use reference-style links for recurring references (e.g., `[ARC42]`, `[CH1]`, `[CH2]` at the end).
- When a new post adds cross-links to earlier posts, bump the `updated` field of all affected posts to the new post's `date`.
- Consider a consistent structure across posts if it helps readers navigate (e.g., "What belongs", "Minimum viable", "Example", "Common mistakes", "Checklist").
- If providing templates or skeleton code, use titled code blocks for clarity.

## Post types

The blog contains several types of posts beyond standard tutorials:

- **Technical tutorials**: Step-by-step guides with code examples, explanations, and practical outcomes.
- **Speaking/conference posts**: Recaps of presentations, conferences, or meetups; include embedded videos when available.
- **Quick tips**: Short, focused posts on a single technique or trick (e.g., PowerPoint tips, small code snippets).
- **Migration/case studies**: Multi-part stories about technology changes with lessons learned.
- **Year-in-review**: Reflective posts summarizing speaking engagements, projects, or achievements.

For speaking posts:

- List conferences/events chronologically.
- Include context about co-speakers and meetups.
- Embed presentation videos when available.
- Link to speaker profiles using reference-style links.
- Close with a forward-looking note about upcoming events.

## Categories hierarchy and guidance

The blog categories follow this structure, organized by technology stack and domain.
When selecting a category for a new post, find the most specific match that encompasses the primary focus.

### Azure

Cloud platform and infrastructure on Microsoft Azure. Covers:

- Resource management (VMs, App Services, Container Registry)
- Database services (SQL Database, failover groups, backups)
- Networking and security (Virtual Networks, Private Link, AppGateway)
- Infrastructure as Code (ARM templates, deployment automation)
- New posts: any post primarily about Azure cloud services

### C\#

C# language features, libraries, and development patterns. Covers:

- Language constructs, LINQ, async/await patterns
- Libraries and NuGet packages (YAML.NET, OpenCV, ML.NET)
- Desktop and console applications
- New posts: C# tutorials, framework usage, language features

#### Visual Studio

IDE, tooling, and debugging within the C# ecosystem.

- New posts: VS settings, debugging workflows, project configuration

#### SQL

SQL Server and database topics, both standalone and paired with other categories.

- SQL queries, optimization, management, and administration
- New posts: T-SQL, database design, query performance

### Machine Learning

Machine learning models, frameworks, and deployment. Covers:

- Model training and inference (ONNX, ML.NET, Custom Vision)
- Data processing and model deployment
- ML pipeline integration with C#/.NET
- New posts: ML tutorials, model usage, framework guides

### Microsoft 365

Microsoft 365 enterprise services and productivity platform. Covers:

- Platform-wide patterns and governance
- Cross-service scenarios and integration points
- New posts: M365 announcements, best practices, multi-service guidance

#### CRM

Dynamics CRM and customer relationship management within M365.

- Data models, customization, extensibility
- New posts: CRM plugins, form scripting, data operations

#### SharePoint

SharePoint Online and on-premises. Covers:

- Site provisioning, web parts, content management
- Development and customization (CSOM, REST APIs)
- Search, managed metadata, governance
- New posts: SharePoint configuration, feature usage, troubleshooting

#### Project Server

Project Server and project management within M365.

- Project data, timesheets, resource management
- Portfolio management, custom fields
- New posts: Project Server setup, PSI usage, data queries

### Office

Microsoft Office applications (Word, Excel, PowerPoint, etc.).

- Add-ins, document automation, formatting
- Tips, tricks, and lesser-known features
- New posts: Office hacks, add-in development, productivity tips

### PowerShell

PowerShell scripting and automation. Covers:

- System administration and infrastructure automation
- Module development and best practices
- Integration with Azure, Windows, and enterprise systems
- New posts: PS scripts, cmdlet usage, automation patterns

### Windows

Windows operating system and system administration. Covers:

- OS installation, configuration, and deployment
- System utilities, performance, and troubleshooting
- Hyper-V virtualization platform
- New posts: Windows setup, admin tasks, system optimization

#### Hyper-V

Hyper-V virtualization platform on Windows.

- VM creation, networking, storage, live migration
- New posts: Hyper-V configuration, VM management, troubleshooting

#### Surface

Microsoft Surface devices and device-specific configurations.

- Hardware setup, drivers, firmware updates
- New posts: Surface tips, device configuration

### Architecture

Software architecture, design patterns, and system design. Covers:

- Architecture documentation frameworks (arc42)
- Design patterns, SOLID principles, architectural decisions
- System design and technical strategy
- New posts: Architecture guides, design patterns, documentation practices

## Tags usage

Stats from 98 posts:

- Tags: 286 unique, 548 total. Typical post has 6 tags (median 6, average 5.59). Most posts fall in the 4–7 range; only 1 post has 11 tags.

Most-used tags (top 20):

- Azure (22), SharePoint 2007 (13), Project Server 2007 (9), SharePoint 2010 (8), Presenting (8), Speaking (8), CSharp (8), SDK (7), WSS 3.0 (7), Machine Learning (7), ML.NET (7), Exception (6), x64 (6), WordPress (6), ARM (6), Search (5), ONNX (5), LINQ (4), Windows Server 2008 (4), Windows 7 (4).

Guidance:

- Use 1 category by default. Use 2 only when a post genuinely bridges two major areas (e.g., Azure + SQL for a failover group tutorial); 3 is rare.
- Choose the most specific subcategory when it applies (e.g., "Visual Studio" instead of "C#" for IDE tips; "Hyper-V" instead of "Windows" for VM topics).
- Aim for 4–7 tags. Keep under 8 unless the post spans multiple distinct topics.
- Prefer existing tag casing.
- Default to Title Case, except when the canonical name is lower case (arc42, x64).
- Add a new tag only if the topic will likely recur.
- Use versioned tags when the version matters (for example, `SharePoint 2007`, `SharePoint 2010`, `Windows 7`).
- Keep categories broad (product/stack), and tags more specific (tool, version, technique, event).

## Post frontmatter template

- `id` is a unique integer for the post, at least 1 higher than the last post.
- `updated` is optional; include only when changed after publish.
- `series` is optional; include only when the post is part of a series.

```yaml
---
id: <number>
title: <Title>
date: <ISO datetime with offset>
updated: <ISO datetime with offset>
author: Michaël Hompus
excerpt: >
  <2–6 lines summary; focus on the problem and the solution>
permalink: /YYYY/MM/DD/slug/
image: /wp-content/uploads/YYYY/MM/post-<yyyy>-<mm>-<dd>-thumbnail.(png|jpg)
categories:
  - <Category>
tags:
  - <Tag>
  - <Tag>
series: <Series Name>
---
```

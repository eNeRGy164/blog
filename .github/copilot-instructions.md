# Copilot Instructions for Blog Repository

## Repository Overview

This is an Astro-based blog with posts written in Markdown. The blog is deployed to Azure Static Web Apps and uses TypeScript, with custom rehype/remark plugins for content processing.

**Key facts:**

- Framework: Astro 5.17.1
- Runtime: Node.js 20
- Deployment: Azure Static Web Apps
- Content: Markdown blog posts in `/posts/` directory organized by year
- Images: Legacy WordPress images in `/wp-content/uploads/`

## Build and Validation

### Initial Setup

Always run dependency installation before building:

```bash
npm ci
```

**Note:** Use `npm ci` (not `npm install`) to ensure reproducible builds from the lockfile.

### Build Commands

**To build the site:**

```bash
npm run build
```

**Expected behavior:**

- Build takes 1-2 minutes (or longer on first run)
- Output directory: `dist/`
- Build warnings about missing image cache entries for `/wp-content/uploads/2010/03/*.png` and `/wp-content/uploads/2010/04/*.png` are **safe to ignore** (legacy WordPress migration artifacts)

**To run dev server:**

```bash
npm run dev
```

**To preview built site:**

```bash
npm run preview
```

### Testing

**Important:** There is no `npm test` script in this repository. When making changes:

1. Verify the site builds successfully with `npm run build`
2. If tests are skipped, note this in the PR description

### Code Formatting

Always format touched Markdown files with Prettier:

```bash
npx prettier --write <files>
```

**Prettier configuration:**

- Double quotes (not single)
- Print width: 80 characters
- One attribute per line in HTML/JSX

### Build Timing

- `npm run build`: 1-2 minutes (can be longer on first run due to image processing)
- `npm ci`: 30-60 seconds

## Project Layout

### Directory Structure

```
/
├── .github/              # GitHub configuration and workflows
│   ├── workflows/        # CI/CD workflows (Azure Static Web Apps)
│   ├── dependabot.yml    # Dependabot configuration
│   └── AGENTS.md         # Agent-specific instructions (already exists)
├── posts/                # Blog posts organized by year (YYYY/*.md)
├── public/               # Static assets
├── src/                  # Astro source files
│   ├── components/       # Astro/React components
│   ├── config/           # Configuration files (acronyms, theme)
│   ├── layouts/          # Page layouts
│   ├── pages/            # Astro pages (routes)
│   ├── plugins/          # Custom rehype/remark plugins
│   ├── styles/           # CSS stylesheets
│   └── utils/            # Utility functions
├── wp-content/uploads/   # Legacy WordPress images (DO NOT MODIFY)
├── astro.config.mjs      # Astro configuration
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── WRITING_GUIDE.md      # Blog writing style guide
├── .markdownlint.yaml    # Markdown linting rules
├── prettierrc.yaml       # Prettier formatting rules
└── cspell.json          # Spell check configuration
```

### Key Configuration Files

- **astro.config.mjs**: Astro configuration with integrations (sitemap, expressive-code) and rehype/remark plugins
- **WRITING_GUIDE.md**: Comprehensive style guide for blog posts (frontmatter, categories, tags, voice/tone)
- **package.json**: Dependencies and npm scripts (dev, build, preview)
- **.github/workflows/azure-static-web-apps-ashy-ocean-0ac866803.yml**: CI/CD pipeline

### Custom Plugins

Located in `src/plugins/`:

- `rehypeAbbreviate.js`: Adds abbreviation markup
- `rehypeAddMvpContributorId.js`: Adds MVP contributor ID
- `rehypeYouTubeEmbed.js`: Embeds YouTube videos
- `rehypeCustomImage.js`: Custom image processing

## CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/azure-static-web-apps-ashy-ocean-0ac866803.yml`

**Triggers:**

- Push to `main` branch
- Pull requests to `main` branch

**Build process:**

1. Checkout code
2. Setup Node.js 20 with npm caching
3. Run `npm ci` to install dependencies
4. Cache Astro build artifacts (`.astro/`)
5. Cache processed images (`.cache/images/`)
6. Run `npm run build`
7. Deploy to Azure Static Web Apps

**Caching strategy:**

- npm dependencies cached by setup-node action
- Astro build cache (`.astro/`) speeds up incremental builds
- Processed images (`.cache/images/`) avoid regenerating ~867 image variants from 199 source images

**Key points:**

- Build must succeed before deployment
- Image cache invalidates only when source images in `wp-content/uploads/` change
- Skip app build in Azure deploy step (already built by npm run build)

## Content Guidelines

### Blog Posts

When creating or editing blog posts, **always** refer to `WRITING_GUIDE.md` for:

- Post frontmatter structure (id, title, date, categories, tags, etc.)
- Writing voice and tone (first person, practical, clear)
- Categories hierarchy (Azure, C#, Machine Learning, Microsoft 365, etc.)
- Tags usage (aim for 4-7 tags, prefer existing tag casing)
- Formatting rules (short paragraphs, code fences, callouts)

**Post location:** `/posts/YYYY/YYYY-MM-DD-slug.md`

**Frontmatter template:**

```yaml
---
id: <number>
title: <Title>
date: <ISO datetime with offset>
author: Michaël Hompus
excerpt: >
  <2–6 lines summary>
permalink: /YYYY/MM/DD/slug/
image: /wp-content/uploads/YYYY/MM/post-<yyyy>-<mm>-<dd>-thumbnail.(png|jpg)
categories:
  - <Category>
tags:
  - <Tag>
---
```

## Working with This Repository

### Making Code Changes

1. Make focused, minimal changes
2. Run `npm run build` to verify the site builds
3. Format any touched Markdown with `npx prettier --write <files>`
4. Check that no unintended files are added (use `.gitignore` for build artifacts)

### Debugging Build Issues

If build fails:

1. Check for TypeScript errors in `src/` files
2. Verify frontmatter in any new/modified posts matches the template
3. Check for missing images referenced in posts
4. Review custom plugin errors in `src/plugins/`

### Safe to Ignore

- Build warnings about missing image cache for `/wp-content/uploads/2010/03|04/*.png`
- These are legacy WordPress migration artifacts and don't affect the site

## Additional Notes

- **Legacy content:** The `wp-content/` directory contains images from WordPress migration. Do not modify or delete.
- **Image processing:** Astro/Sharp processes images automatically during build. First builds take longer.
- **Dependencies:** Keep dependencies up to date but test builds carefully due to custom plugins.
- **TypeScript:** Project uses TypeScript with strict mode enabled.

---

**Trust these instructions:** Only search for additional information if these instructions are incomplete or incorrect.

# AGENTS instructions

- Use `npx astro build` to verify the site builds. This takes a while.
- There is no `npm test` script; note skipped tests in PRs.
- Run `npx prettier --write <files>` to format touched Markdown.
- Blog writing style guide lives in `WRITING_GUIDE.md`. Use it when drafting new posts.
- Build warning: missing image cache entries for `/wp-content/uploads/2010/03|04/*.png` are safe to ignore.
- All styles should be in `/src/styles/global.css` for client-side caching, not in component `<style>` blocks.

## Thumbnail generation

- This section is the source of truth for thumbnail generation and styling.
  Keep technical thumbnail rules here and avoid duplicating them in `WRITING_GUIDE.md`.

- Primary social image: `1200x630` PNG.
- Dedicated square image: `185x185` PNG (generated from scratch, not cropped).
- Naming pattern: `post-YYYY-MM-DD-thumbnail.png`.
- If multiple posts are on the same day, use publish-time order:
  oldest has no suffix, then `-2`, `-3`, etc.
- Keep post frontmatter `image:` pointing to the primary social image only.

### Visual/layout rules

- Keep one consistent system across years:
  gradient background, subtle grid, rounded glass-like card, soft circles, year watermark.
- Typography must match the archive style and use explicit sans-serif stack on all SVG text:
  `"Segoe UI", "Segoe UI Variable", "DejaVu Sans", Arial, sans-serif`.
- Use category-based colors (gradient start -> end):
  - Architecture: `amber` (`#5a4300` -> `#b7860b`)
  - Azure: `azure` (`#0b3d91` -> `#0078d4`)
  - C#: `csharp` (`#3d2a6e` -> `#7c4dff`)
  - Docker: `docker` (`#0f3042` -> `#2496ed`)
  - Dynamics CRM: `dynamics` (`#4b2b6b` -> `#8e44ad`)
  - Hyper-V: `hyperv` (`#10345a` -> `#2f74c0`)
  - Machine Learning: `machinelearning` (`#1f4a32` -> `#5faa4a`)
  - Office: `office` (`#6b2b00` -> `#d24726`)
  - PowerShell: `powershell` (`#012456` -> `#5391fe`)
  - Project Server: `projectserver` (`#1d3f4d` -> `#3f93a9`)
  - SQL: `sql` (`#1f4f3b` -> `#2f9d72`)
  - SharePoint: `sharepoint` (`#004b50` -> `#00a4aa`)
  - Surface: `surface` (`#3a3a3a` -> `#7b8794`)
  - Visual Studio: `visualstudio` (`#3b1f66` -> `#68217a`)
  - Windows: `windows` (`#0e4a7b` -> `#168dd9`)
  - Windows Phone: `windowsphone` (`#7a1f57` -> `#c03f8f`)
  - Unknown categories: deterministic hash-based palette fallback.
- Social (`1200x630`) includes:
  `From the YYYY archive`, title, subtitle, and 2-3 chips.
- Keep social text inside the left safe area; do not add footer branding.
- Square (`185x185`) includes:
  small archive label, title-only, and year watermark.
- Rendered text must be plain text only; markdown/HTML/URLs must be stripped.

### Related posts square handling

- Dedicated square source filename:
  `post-YYYY-MM-DD[-N]-thumbnail-185x185.png`.
- Default behavior is non-destructive:
  existing socials/squares are not replaced unless `--overwrite` is set.
- `RelatedPosts` requests `-185x185.webp` when a dedicated square PNG exists.
- The image handler resolves that request to same-name PNG and serves optimized WebP.
- The `150x150` variant also prefers a dedicated square source (`-185x185` or `-182x185`) when present.
- If no dedicated square PNG exists, fallback remains the auto-generated `-185x185.webp`.

### Workflow

- Generate thumbnails:
  `node scripts/generate-archive-thumbnails.mjs --year YYYY`
- Regenerate existing images when needed:
  `node scripts/generate-archive-thumbnails.mjs --year YYYY --overwrite`
- Regenerate only specific thumbnail basenames:
  `node scripts/generate-archive-thumbnails.mjs --year YYYY --overwrite --include post-YYYY-MM-DD-thumbnail,post-YYYY-MM-DD-2-thumbnail`
- If `sharp` is unavailable locally, install temporarily:
  `npm install --no-save sharp`

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
- Category colors are defined in `src/config/category-colors.ts` (single source of truth).
  The thumbnail generator mirrors the same derivation logic locally.
- Derivation rules (gradient start → end):
  - Main color per top-level category (7 categories):
    Architecture `#9E9D24`, Azure `#0078D4`, C# `#9B4DCA`,
    Machine Learning `#2E7D32`, Microsoft 365 `#D32F2F`,
    PowerShell `#283593`, Windows `#0097A7`.
  - Gradient start = darken(main, 45%), gradient end = main color.
  - Sub-category colors = lighten(parent, n×6%) + desaturate(parent, n×8%)
    where n = child index (1-based).
  - Fallback palettes = hueRotate(`#607D8B`, [0°, 60°, 120°, 240°]).
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

### Thumbnail text source

- Title and subtitle rendered on generated thumbnails come from the optional
  `thumbnail` frontmatter block in each post (`thumbnail.title`, `thumbnail.subtitle`).
- Only posts with generated thumbnails (`post-YYYY-MM-DD-thumbnail.png`) should
  have this block. Posts with custom-designed images omit it.
- When no `thumbnail` block is present, the generator falls back to
  a mechanical extraction from the post title and excerpt.

### Workflow

- Generate thumbnails:
  `node scripts/generate-archive-thumbnails.mjs --year YYYY`
- Regenerate existing images when needed:
  `node scripts/generate-archive-thumbnails.mjs --year YYYY --overwrite`
- Regenerate only specific thumbnail basenames:
  `node scripts/generate-archive-thumbnails.mjs --year YYYY --overwrite --include post-YYYY-MM-DD-thumbnail,post-YYYY-MM-DD-2-thumbnail`
- If `sharp` is unavailable locally, install temporarily:
  `npm install --no-save sharp`

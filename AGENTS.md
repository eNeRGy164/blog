# AGENTS instructions

- Use `npx astro build` to verify the site builds. This takes a while.
- There is no `npm test` script; note skipped tests in PRs.
- Run `npx prettier --write <files>` to format touched Markdown.
- Blog writing style guide lives in `WRITING_GUIDE.md`. Use it when drafting new posts.
- Build warning: missing image cache entries for `/wp-content/uploads/2010/03|04/*.png` are safe to ignore.
- All styles should be in `/src/styles/global.css` for client-side caching, not in component `<style>` blocks.

## Image generation

- Primary social image: `1200x630` PNG.
- Naming pattern: `post-YYYY-MM-DD-thumbnail.png`.
- If multiple posts are on the same day, use publish-time order:
  oldest has no suffix, then `-2`, `-3`, etc.
  Example: `post-2007-09-07-thumbnail.png`, `post-2007-09-07-2-thumbnail.png`.
- Keep post frontmatter `image:` pointing to the primary social image only.

### Visual strategy

- Keep one consistent visual system across years:
  gradient background, subtle grid, rounded glass-like card, soft circles, year watermark.
- Use one gradient per post and reuse that same gradient for both aspect ratios.
- Color assignment by content type:
  blue/teal for SDK, configuration, and tutorial posts;
  purple/magenta for troubleshooting and error-focused posts;
  amber/brown for pitfall/warning posts;
  blue for conference or event recap posts.

### Layout spec

- Social (`1200x630`): `From the YYYY archive` label, title, subtitle, and 2-3 chips.
- Keep all social text in the left safe area (about left 70%).
- Do not include footer branding text.
- Square (`185x185`): create from scratch with the same style and colors; use title-only
  (plus a small archive label and year watermark). Do not reuse by cropping social cards.

### Square related thumbnails

- Dedicated square source filename pattern: `post-YYYY-MM-DD[-N]-thumbnail-185x185.png`.
- Never overwrite an existing `-185x185.png` file; create only when missing.
- `RelatedPosts` requests `-185x185.webp` when a dedicated square PNG exists.
- The image handler resolves that `.webp` request to the same-name `.png` source and serves optimized WebP.
- Fallback behavior (when no dedicated square PNG exists): use existing auto-generated `-185x185.webp`.

### Practical generation workflow

- Determine target posts (for example from last commit):
  `git show --name-only --pretty=format: HEAD`
- Read each post's `image:` path and derive square PNG target by replacing extension with `-185x185.png`.
- Generate only missing square PNG files from scratch using the same color and style as the post's social image.
- If `sharp` is unavailable locally, install temporarily with:
  `npm install --no-save sharp`

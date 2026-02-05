# AGENTS instructions

- Use `npx astro build` to verify the site builds. This takes a while.
- There is no `npm test` script; note skipped tests in PRs.
- Run `npx prettier --write <files>` to format touched Markdown.
- Blog writing style guide lives in `WRITING_GUIDE.md`. Use it when drafting new posts.
- Build warning: missing image cache entries for `/wp-content/uploads/2010/03|04/*.png` are safe to ignore.
- All styles should be in `/src/styles/global.css` for client-side caching, not in component `<style>` blocks.

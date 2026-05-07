# Ryan Carter Portfolio 2026

Static React/Vite portfolio rebuilt from the live `ryancarter.io` Webflow content and the 2026 homepage Figma direction.

## Commands

- `npm run dev` starts the local dev server.
- `npm run build` creates the GitHub Pages-ready `dist` output and copies `index.html` to `404.html` for deep links.
- `npm run scrape:content` regenerates `src/data/scraped-content.json` from saved HTML in `scrape/pages`.
- `npm run scrape:assets` downloads scraped media into `public/assets` and regenerates `src/data/asset-manifest.json`.

## Deployment

The repo includes `.github/workflows/deploy.yml` for GitHub Pages and `public/CNAME` for `ryancarter.io`.

# Ryan Carter Portfolio 2026

Static React/Vite portfolio rebuilt from the live `ryancarter.io` Webflow content and the 2026 homepage Figma direction.

## Commands

- `npm run dev` starts the local dev server.
- `npm run build` creates the GitHub Pages-ready `dist` output, including real entry pages for every published case-study route and a `404.html` fallback for unknown deep links.
- `npm run scrape:content` regenerates the non-case-study pages in `src/data/scraped-content.json` from saved HTML in `scrape/pages`; case studies are maintained as Markdown in `src/data`.
- `npm run scrape:assets` downloads scraped media into `public/assets` and regenerates `src/data/asset-manifest.json`.

## Deployment

The repo includes `.github/workflows/deploy.yml` for GitHub Pages and `public/CNAME` for `ryancarter.io`.

## Social previews

`index.html` defines the browser title, Open Graph metadata, and X large-image card metadata. All routes share the portfolio preview; the build gives each published case study its own `og:url`.

`public/og-image.png` is the supplied 1200 × 630 share image (`ryancarter-og.png`). To change it, replace this PNG and update the image dimensions and alt text in `index.html` if needed.

Changes become public after the GitHub Pages deployment workflow runs. Re-scrape the deployed URL in the social platform's sharing inspector to refresh any cached preview.

# Open Budget: Sacramento (SvelteKit rewrite)

This folder is the in-progress rewrite of the site, tracked in
[opensacorg/openbudgetsac.org#76](https://github.com/opensacorg/openbudgetsac.org/issues/76).
It lives beside the current Eleventy site in `_src/` until it reaches parity.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5 and TypeScript, prerendered to static HTML by `@sveltejs/adapter-static`.
- `src/lib/viz/` is a framework-free visualization engine (d3-sankey, d3-hierarchy). It turns data into layouts and has no DOM code, so it is unit tested in Node and can be reused by future map views.
- `src/lib/components/` renders those layouts as accessible SVG with Svelte.
- `src/lib/config/years.ts` lists every budget year and the column names of its data file. **Adding a year is one entry here plus the data files in `_src/data/`.**

## Data

`_src/data/` and `_src/images/` stay the single source of truth for both sites.
`scripts/sync-data.js` copies them into `static/` (gitignored) before `dev` and `build`.

- Cash flow pages read `data/flow/<year>.csv` at build time, so each year ships as finished HTML.
- Breakdown pages fetch `data/tree/Approved.<Expense|Revenue>.<year>.json` in the browser.

## Commands

Use Node 24 (see `.nvmrc`).

```sh
npm ci
npm run dev          # http://localhost:5173
npm run lint         # Prettier + ESLint
npm run check        # svelte-check (types and a11y)
npm run test:unit    # Vitest (watch mode; add -- --run for one pass)
npm run build        # static site in build/
npm run preview      # serve build/ on http://localhost:4173
npx playwright install chromium   # once
npm run test:e2e     # Playwright on desktop and phone, with axe checks
```

With Docker or Podman, `docker compose --profile app up app` runs the dev server with file polling, so edits reload on macOS and Windows.

To build for a sub-path such as GitHub Pages project pages, set `BASE_PATH=/openbudgetsac.org npm run build`.

## Routes

| Path                                             | Page                                                     |
| ------------------------------------------------ | -------------------------------------------------------- |
| `/budget/`                                       | All budget years                                         |
| `/budget/<year>/flow/`                           | Cash flow (Sankey) for a year, e.g. `/budget/FY26/flow/` |
| `/budget/<year>/tree/`                           | Detailed breakdown (treemap) for a year                  |
| `/adopted-budget-flow/`, `/adopted-budget-tree/` | Redirect old links to the latest year                    |

## CI/CD

`.github/workflows/app-ci.yml` runs on changes to `app/` or the shared data:

1. **verify**: lint, typecheck, unit tests, build, and upload the build.
2. **e2e**: Playwright on desktop and phone viewports, including axe WCAG 2.1 AA checks.
3. **preview**: deploys the build to Cloudflare Pages. It only runs when the repository variable `CLOUDFLARE_PAGES_PROJECT` and the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set, and never for pull requests from forks.

## Not yet ported

- Compare page (links to the current site for now).
- Spanish translations. The plan is Paraglide, so translations are compiled and tree-shaken per page.

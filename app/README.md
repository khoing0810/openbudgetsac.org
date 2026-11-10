# Open Budget: Sacramento (SvelteKit rewrite)

This folder is the in-progress rewrite of the site, tracked in
[opensacorg/openbudgetsac.org#76](https://github.com/opensacorg/openbudgetsac.org/issues/76).
It lives beside the current Eleventy site in `_src/` until it reaches parity.

## Stack

- [SvelteKit](https://svelte.dev/docs/kit) with Svelte 5 and TypeScript, prerendered to static HTML by `@sveltejs/adapter-static`.
- `src/lib/viz/` is a framework-free visualization engine (d3-sankey, d3-hierarchy). It turns data into layouts and has no DOM code, so it is unit tested in Node and can be reused by future map views.
- `src/lib/components/` renders those layouts as accessible SVG with Svelte.
- `src/lib/config/years.ts` lists every budget year and the column names of its data file. Years from FY 2024–25 on come from `src/lib/config/open-data.json`, which `npm run data:update` writes, so **new years need no code change**.

## Data

`_src/data/` and `_src/images/` stay the single source of truth for both sites.
`scripts/sync-data.js` copies them into `static/` (gitignored) before `dev` and `build`.

- Cash flow pages read `data/flow/<year>.csv` at build time, so each year ships as finished HTML.
- Breakdown pages fetch `data/tree/Approved.<Expense|Revenue>.<year>.json` in the browser.
- The Explore page fetches `/explore/data.json`, which the build condenses from the City's whole table (`data/approved-budgets.csv`, also offered as a download).

### Updating the data

The City publishes its approved budgets as one table on its open data portal:
[City of Sacramento Approved Budgets](https://data.cityofsacramento.org/datasets/7b8b3680603c4894bd3faaa41c986c7c_0)
(ArcGIS Hub; the query API needs no key).

```sh
npm run data:update                # download the table and rebuild FY25 onward
npm run data:update -- --offline   # rebuild from the CSV already in the repo
```

The script rewrites `_src/data/City_of_Sacramento_Approved_Budgets.csv`, then each year's flow CSV, treemap JSON and compare JSON from FY 2024–25 on, and lists the years in `src/lib/config/open-data.json`. Earlier years came from other exports and are left as published. It refuses to run if the City returns far fewer rows than we already have.

`.github/workflows/budget-data.yml` runs it every Monday and opens a pull request when anything changed, so a person checks the numbers before they go live. It needs **Settings → Actions → General → Allow GitHub Actions to create and approve pull requests**. You can also start it by hand from the Actions tab.

### Updating the budget calendar

`/budget-process/` reads `src/lib/content/budget-calendar.ts`: the yearly phases, the dates of the latest cycle (each with a source link), and ways to take part. Each fall, when the City publishes the next year's calendar (usually in its Budget Development Policy report to the Council), add the new dates to `events` and update `cycle`. Until then the page says the next dates aren't out yet.

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

| Path                                                | Page                                                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/budget/`                                          | All budget years                                                                                                        |
| `/budget/<year>/flow/`                              | Cash flow (Sankey) for a year, e.g. `/budget/FY26/flow/`                                                                |
| `/compare/?from=FY25&to=FY26`                       | Compare any two years: what changed, the long-run trend, and a full table. The URL keeps the choice so it can be shared |
| `/budget/<year>/tree/`                              | Detailed breakdown (treemap) for a year                                                                                 |
| `/explore/?year=FY26&by=category&department=Police` | Filter every year by department, fund and category; drill in, see the trend, download a CSV                             |
| `/budget-process/`                                  | How the yearly budget cycle works, where it stands today, and every step of the latest cycle                            |
| `/adopted-budget-flow/`, `/adopted-budget-tree/`    | Redirect old links to the latest year                                                                                   |

## CI/CD

`.github/workflows/app-ci.yml` runs on changes to `app/` or the shared data:

1. **verify**: lint, typecheck, unit tests, build, and upload the build.
2. **e2e**: Playwright on desktop and phone viewports, including axe WCAG 2.1 AA checks.
3. **preview**: deploys the build to Cloudflare Pages. It only runs when the repository variable `CLOUDFLARE_PAGES_PROJECT` and the secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set, and never for pull requests from forks.

`.github/workflows/budget-data.yml` checks the City's budget table weekly (see [Updating the data](#updating-the-data)).

## Not yet ported

- Spanish translations. The plan is Paraglide, so translations are compiled and tree-shaken per page.

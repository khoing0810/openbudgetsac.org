// Refreshes the site's budget data from the City of Sacramento's open data
// portal.
//
//   npm run data:update              download the latest table from the City
//   npm run data:update -- --offline rebuild from the CSV already in the repo
//
// It rewrites _src/data/City_of_Sacramento_Approved_Budgets.csv, then, for
// every year from FIRST_MANAGED_YEAR on, that year's flow CSV, treemap JSON
// and compare JSON, and finally src/lib/config/open-data.json, which tells the
// site which years exist. Earlier years are left as published.
//
// The scheduled "Budget data" workflow runs this and opens a pull request
// when anything changed, so a person reviews new numbers before they go live.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { csvParse } from 'd3-dsv';
import {
	APPROVED_BUDGETS_PAGE,
	FIRST_MANAGED_YEAR,
	buildCompareFiles,
	buildTree,
	fetchApprovedBudgets,
	fetchLastEdit,
	fyId,
	summarize,
	toBudgetRow,
	toCsv,
	type BudgetRow
} from '#lib/data/approved-budgets.ts';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(appDir, '..', '_src', 'data');
const masterCsv = join(dataDir, 'City_of_Sacramento_Approved_Budgets.csv');
const manifestPath = join(appDir, 'src', 'lib', 'config', 'open-data.json');

interface Manifest {
	source: string;
	/** When the City last changed the table (YYYY-MM-DD), if known. */
	updated: string | null;
	/** Years built from the open dataset, oldest first. */
	years: number[];
}

const offline = process.argv.includes('--offline');

const write = (path: string, body: string) => {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, body);
};
const writeJson = (path: string, value: unknown) => write(path, JSON.stringify(value));

const readMaster = (): BudgetRow[] =>
	csvParse(readFileSync(masterCsv, 'utf8').replace(/^\uFEFF/, '')).map((r) => toBudgetRow(r));

const readManifest = (): Manifest => JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;

const previous = readMaster();
let rows: BudgetRow[];
let updated = readManifest().updated;

if (offline) {
	rows = previous;
} else {
	console.log('Downloading the Approved Budgets table from the City…');
	rows = await fetchApprovedBudgets(fetch);
	updated = (await fetchLastEdit(fetch)) ?? updated;
	// A half-empty response should never replace good data.
	if (rows.length < previous.length * 0.8) {
		throw new Error(
			`The City returned ${rows.length} rows, far fewer than the ${previous.length} we have. ` +
				'Not updating; check the dataset by hand.'
		);
	}
	// Keep the CSV's BOM so Excel opens it as UTF-8.
	write(masterCsv, '\uFEFF' + toCsv(rows));
}

const years = [...new Set(rows.map((r) => r.year))]
	.filter((y) => y >= FIRST_MANAGED_YEAR)
	.sort((a, b) => a - b);

const totalsPath = join(dataDir, 'compare', 'fiscal-years-expenses', 'totals.json');
const totals = JSON.parse(readFileSync(totalsPath, 'utf8')) as { fiscal_year_range: string }[];

for (const year of years) {
	const id = fyId(year);
	const yearRows = rows.filter((r) => r.year === year);
	write(join(dataDir, 'flow', `${id}.csv`), toCsv(yearRows));
	writeJson(join(dataDir, 'tree', `Approved.Expense.${id}.json`), buildTree(yearRows, 'Expenses'));
	writeJson(join(dataDir, 'tree', `Approved.Revenue.${id}.json`), buildTree(yearRows, 'Revenues'));

	const compare = buildCompareFiles(rows, year);
	const cmp = (kind: string, dim: string) =>
		join(dataDir, 'compare', `fiscal-years-${kind}`, dim, `${id}.json`);
	writeJson(cmp('expenses', 'depts'), compare.expenseDepartments);
	writeJson(cmp('expenses', 'account-cats'), compare.expenseCategories);
	writeJson(cmp('revenue', 'depts'), compare.revenueDepartments);
	writeJson(cmp('revenue', 'account-cats'), compare.revenueCategories);
	const at = totals.findIndex((t) => t.fiscal_year_range === id);
	if (at >= 0) totals[at] = compare.totals;
	else totals.push(compare.totals);
}
totals.sort((a, b) => (a.fiscal_year_range < b.fiscal_year_range ? -1 : 1));
writeJson(totalsPath, totals);

const manifest: Manifest = { source: APPROVED_BUDGETS_PAGE, updated, years };
write(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');

const usd = (n: number) => `$${(n / 1e6).toFixed(1)}M`;
console.log(`\n${rows.length} rows; City last updated ${updated ?? 'unknown'}\n`);
console.log('Year     Rows   Spending     Revenue');
for (const [year, s] of summarize(rows)) {
	const mark = year >= FIRST_MANAGED_YEAR ? ' (rebuilt)' : '';
	console.log(
		`${fyId(year)}  ${String(s.rows).padStart(6)}  ${usd(s.spending).padStart(10)}  ${usd(s.revenue).padStart(10)}${mark}`
	);
}

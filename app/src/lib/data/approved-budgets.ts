/**
 * The City of Sacramento's "Approved Budgets" open dataset, and everything
 * the site derives from it.
 *
 * The City publishes one table on its ArcGIS Hub portal
 * (https://data.cityofsacramento.org) with a row per year, department, fund
 * and category. `scripts/update-budget-data.ts` downloads it with
 * {@link fetchApprovedBudgets} and writes the files below with the `build*`
 * functions. Everything here is plain data in, data out, so it is unit-tested
 * without the network.
 */

/** The table's query endpoint. It needs no key and allows any origin. */
export const APPROVED_BUDGETS_LAYER =
	'https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/City_of_Sacramento_Approved_Budgets/FeatureServer/0';

/** The dataset's page on the City's portal, for people. */
export const APPROVED_BUDGETS_PAGE =
	'https://data.cityofsacramento.org/datasets/SacCity::city-of-sacramento-approved-budgets';

/**
 * Years from this one on are built entirely from the open dataset. Earlier
 * years' files came from other exports (some with more detail), so they are
 * kept as published.
 */
export const FIRST_MANAGED_YEAR = 2025;

export type BudgetType = 'Expenses' | 'Revenues';

export interface BudgetRow {
	/** Calendar year the fiscal year ends in: 2026 is FY 2025–26. */
	year: number;
	department: string;
	fund: string;
	category: string;
	amount: number;
	type: BudgetType;
	fundCategory: string;
	objectId: number;
}

/** Column order of the City's export, which the flow CSVs keep. */
export const CSV_COLUMNS = [
	'Fiscal_Year',
	'Department',
	'Fund',
	'CATEGORY',
	'Amount',
	'ExpenseRevenue',
	'Fund_Category',
	'ObjectId'
] as const;

type RawRecord = Record<string, unknown>;

/** The City used R/E until FY25 and spells them out since. */
export function normalizeType(value: unknown): BudgetType {
	const v = String(value ?? '')
		.trim()
		.toLowerCase();
	if (v === 'e' || v === 'expense' || v === 'expenses') return 'Expenses';
	if (v === 'r' || v === 'revenue' || v === 'revenues') return 'Revenues';
	throw new Error(`Unknown ExpenseRevenue value: ${JSON.stringify(value)}`);
}

const text = (v: unknown) => String(v ?? '').trim();

/** Turns one record (an API feature's attributes or a CSV row) into a checked row. */
export function toBudgetRow(record: RawRecord): BudgetRow {
	const year = Number(record.Fiscal_Year);
	const amount = Number(String(record.Amount ?? '').replace(/[$,\s]/g, ''));
	if (!Number.isInteger(year) || year < 2000 || year > 2100) {
		throw new Error(`Bad Fiscal_Year: ${JSON.stringify(record.Fiscal_Year)}`);
	}
	if (!Number.isFinite(amount)) throw new Error(`Bad Amount: ${JSON.stringify(record.Amount)}`);
	return {
		year,
		department: text(record.Department),
		fund: text(record.Fund),
		category: text(record.CATEGORY),
		amount,
		type: normalizeType(record.ExpenseRevenue),
		fundCategory: text(record.Fund_Category),
		objectId: Number(record.ObjectId)
	};
}

type Fetch = (url: string) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

interface ArcgisPage {
	features?: { attributes: RawRecord }[];
	exceededTransferLimit?: boolean;
	error?: { message?: string };
}

async function getJson<T>(fetchFn: Fetch, url: string): Promise<T> {
	const res = await fetchFn(url);
	if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
	const body = (await res.json()) as T & { error?: { message?: string } };
	if (body.error) throw new Error(`ArcGIS error: ${body.error.message ?? 'unknown'}`);
	return body;
}

/**
 * Downloads every row, a page at a time (the service returns at most 1,000
 * rows per request), in a stable order.
 */
export async function fetchApprovedBudgets(
	fetchFn: Fetch,
	{ layer = APPROVED_BUDGETS_LAYER, pageSize = 1000 } = {}
): Promise<BudgetRow[]> {
	const rows: BudgetRow[] = [];
	for (let offset = 0; ; offset += pageSize) {
		const q = new URLSearchParams({
			where: '1=1',
			outFields: CSV_COLUMNS.join(','),
			orderByFields: 'ObjectId',
			resultOffset: String(offset),
			resultRecordCount: String(pageSize),
			f: 'json'
		});
		const page = await getJson<ArcgisPage>(fetchFn, `${layer}/query?${q}`);
		const features = page.features ?? [];
		for (const f of features) rows.push(toBudgetRow(f.attributes));
		if (!page.exceededTransferLimit && features.length < pageSize) break;
		if (features.length === 0) break;
	}
	return rows;
}

/** When the City last changed the table, as YYYY-MM-DD, or null if unknown. */
export async function fetchLastEdit(
	fetchFn: Fetch,
	layer = APPROVED_BUDGETS_LAYER
): Promise<string | null> {
	const info = await getJson<{ editingInfo?: { lastEditDate?: number } }>(
		fetchFn,
		`${layer}?f=json`
	);
	const ms = info.editingInfo?.lastEditDate;
	return typeof ms === 'number' ? new Date(ms).toISOString().slice(0, 10) : null;
}

const csvCell = (v: string | number) => {
	const s = String(v);
	return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Writes rows in the City's column order. */
export function toCsv(rows: readonly BudgetRow[]): string {
	const lines = [CSV_COLUMNS.join(',')];
	for (const r of rows) {
		lines.push(
			[r.year, r.department, r.fund, r.category, r.amount, r.type, r.fundCategory, r.objectId]
				.map(csvCell)
				.join(',')
		);
	}
	return lines.join('\n') + '\n';
}

const byName = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

function sumBy(rows: readonly BudgetRow[], key: (r: BudgetRow) => string) {
	const out = new Map<string, number>();
	for (const r of rows) out.set(key(r), (out.get(key(r)) ?? 0) + r.amount);
	return [...out.entries()].sort(([a], [b]) => byName(a, b));
}

/** The treemap file format: nested `{ key, data, values }` nodes. */
export interface TreeFileNode {
	key: string;
	data: { amount: number; revenue: number; expense: number };
	values?: TreeFileNode[];
}

type Level = (r: BudgetRow) => string;

/**
 * Spending goes fund → department → category; revenue goes fund → category.
 * The breakdown page regroups these on the fly.
 */
export function buildTree(rows: readonly BudgetRow[], type: BudgetType): TreeFileNode {
	const levels: Level[] =
		type === 'Expenses'
			? [(r) => r.fund, (r) => r.department, (r) => r.category]
			: [(r) => r.fund, (r) => r.category];
	const node = (key: string, amount: number, values?: TreeFileNode[]): TreeFileNode => ({
		data: {
			amount,
			revenue: type === 'Revenues' ? amount : 0,
			expense: type === 'Expenses' ? amount : 0
		},
		key,
		...(values ? { values } : {})
	});
	const level = (items: readonly BudgetRow[], depth: number): TreeFileNode[] => {
		const groups = new Map<string, BudgetRow[]>();
		for (const r of items) {
			const k = levels[depth](r);
			const g = groups.get(k);
			if (g) g.push(r);
			else groups.set(k, [r]);
		}
		return [...groups.entries()]
			.sort(([a], [b]) => byName(a, b))
			.map(([k, g]) =>
				node(
					k,
					g.reduce((t, r) => t + r.amount, 0),
					depth + 1 < levels.length ? level(g, depth + 1) : undefined
				)
			);
	};
	const mine = rows.filter((r) => r.type === type);
	return node(
		'Budget',
		mine.reduce((t, r) => t + r.amount, 0),
		level(mine, 0)
	);
}

/** One row of a compare file (the format the legacy compare page used). */
export interface CompareFileRow {
	budget_type: '1';
	fiscal_year_range: number;
	department?: string;
	account_category?: string;
	total: string;
	general_fund: '0';
}

export interface CompareFiles {
	expenseDepartments: CompareFileRow[];
	expenseCategories: CompareFileRow[];
	revenueDepartments: CompareFileRow[];
	revenueCategories: CompareFileRow[];
	/** This year's entry in totals.json. */
	totals: { budget_type: '1'; fiscal_year_range: string; total: string; general_fund: string };
}

export function buildCompareFiles(rows: readonly BudgetRow[], year: number): CompareFiles {
	const mine = rows.filter((r) => r.year === year);
	const spend = mine.filter((r) => r.type === 'Expenses');
	const revenue = mine.filter((r) => r.type === 'Revenues');
	const file = (items: BudgetRow[], key: 'department' | 'account_category'): CompareFileRow[] =>
		sumBy(items, (r) => (key === 'department' ? r.department : r.category)).map(
			([name, total]) => ({
				budget_type: '1',
				fiscal_year_range: year,
				[key]: name,
				total: String(Math.round(total)),
				general_fund: '0'
			})
		);
	const total = (items: BudgetRow[]) => String(Math.round(items.reduce((t, r) => t + r.amount, 0)));
	return {
		expenseDepartments: file(spend, 'department'),
		expenseCategories: file(spend, 'account_category'),
		revenueDepartments: file(revenue, 'department'),
		revenueCategories: file(revenue, 'account_category'),
		totals: {
			budget_type: '1',
			fiscal_year_range: fyId(year),
			total: total(spend),
			general_fund: total(spend.filter((r) => r.fund === 'General Fund'))
		}
	};
}

/** 2026 -> "FY26". */
export const fyId = (year: number) => `FY${String(year % 100).padStart(2, '0')}`;

/** Per-year row counts and totals, for logs and sanity checks. */
export function summarize(rows: readonly BudgetRow[]) {
	const out = new Map<number, { rows: number; spending: number; revenue: number }>();
	for (const r of rows) {
		const s = out.get(r.year) ?? { rows: 0, spending: 0, revenue: 0 };
		s.rows += 1;
		if (r.type === 'Expenses') s.spending += r.amount;
		else s.revenue += r.amount;
		out.set(r.year, s);
	}
	return [...out.entries()].sort(([a], [b]) => a - b);
}

/**
 * The Explore page's data: every line of the City's Approved Budgets table,
 * summed to one row per year, side, department, fund and category, with names
 * stored once. All years together are under 10,000 rows, so the browser
 * filters them instantly and the page never waits on a server.
 */
import type { BudgetRow } from '#lib/data/approved-budgets.ts';
import { normalizeName } from '#lib/viz/compare/data.ts';

export type ExploreSide = 'spending' | 'revenue';
export type ExploreDimension = 'department' | 'fund' | 'category';
export const dimensions: readonly ExploreDimension[] = ['department', 'fund', 'category'];

/** [year index, 0 = spending | 1 = revenue, department, fund, category, amount] */
export type ExploreRow = [number, 0 | 1, number, number, number, number];

export interface ExploreData {
	/** Calendar years the fiscal years end in, oldest first. */
	years: number[];
	names: Record<ExploreDimension, string[]>;
	rows: ExploreRow[];
}

export function buildExploreData(rows: readonly BudgetRow[]): ExploreData {
	const years = [...new Set(rows.map((r) => r.year))].sort((a, b) => a - b);
	const yearIndex = new Map(years.map((y, i) => [y, i]));
	const lists: Record<ExploreDimension, string[]> = { department: [], fund: [], category: [] };
	const indexes = {
		department: new Map<string, number>(),
		fund: new Map<string, number>(),
		category: new Map<string, number>()
	};
	const id = (dim: ExploreDimension, name: string) => {
		let i = indexes[dim].get(name);
		if (i === undefined) {
			i = lists[dim].push(name) - 1;
			indexes[dim].set(name, i);
		}
		return i;
	};

	const sums = new Map<string, ExploreRow>();
	for (const r of rows) {
		const row: ExploreRow = [
			yearIndex.get(r.year)!,
			r.type === 'Expenses' ? 0 : 1,
			id('department', normalizeName(r.department)),
			id('fund', r.fund.replace(/\s{2,}/g, ' ')),
			id('category', normalizeName(r.category)),
			0
		];
		const key = row.slice(0, 5).join(',');
		const into = sums.get(key) ?? (sums.set(key, row), row);
		into[5] += r.amount;
	}
	return {
		years,
		names: lists,
		rows: [...sums.values()]
			.filter((r) => r[5] !== 0)
			.map((r) => [...r.slice(0, 5), Math.round(r[5])] as ExploreRow)
	};
}

export interface ExploreFilters {
	side: ExploreSide;
	department: string | null;
	fund: string | null;
	category: string | null;
}

const column: Record<ExploreDimension, 2 | 3 | 4> = { department: 2, fund: 3, category: 4 };

/** Row indexes that match the filters, ignoring the year. */
function matcher(data: ExploreData, f: ExploreFilters) {
	const want = dimensions.map((d) => {
		const name = f[d];
		return name === null ? null : data.names[d].indexOf(name);
	});
	const side = f.side === 'spending' ? 0 : 1;
	return (r: ExploreRow) =>
		r[1] === side && want.every((w, i) => w === null || r[column[dimensions[i]]] === w);
}

/** The filtered total for every year, oldest first (null where nothing matched). */
export function totalsByYear(data: ExploreData, f: ExploreFilters): (number | null)[] {
	const totals: (number | null)[] = data.years.map(() => null);
	const match = matcher(data, f);
	for (const r of data.rows) if (match(r)) totals[r[0]] = (totals[r[0]] ?? 0) + r[5];
	return totals;
}

/** Everything on one side for every year, to give the filtered total a share. */
export function sideTotals(data: ExploreData, side: ExploreSide): number[] {
	return totalsByYear(data, { side, department: null, fund: null, category: null }).map(
		(t) => t ?? 0
	);
}

export interface BreakdownRow {
	name: string;
	amount: number;
	/** The same line the year before, or null if it didn't exist then. */
	previous: number | null;
}

/** The filtered lines in one year, grouped by a dimension, largest first. */
export function breakdown(
	data: ExploreData,
	f: ExploreFilters,
	year: number,
	by: ExploreDimension
): BreakdownRow[] {
	const yi = data.years.indexOf(year);
	const match = matcher(data, f);
	const now = new Map<number, number>();
	const before = new Map<number, number>();
	for (const r of data.rows) {
		if (!match(r)) continue;
		const into = r[0] === yi ? now : r[0] === yi - 1 && yi > 0 ? before : null;
		if (into) into.set(r[column[by]], (into.get(r[column[by]]) ?? 0) + r[5]);
	}
	return [...now.entries()]
		.map(([i, amount]) => ({
			name: data.names[by][i],
			amount,
			previous: before.get(i) ?? null
		}))
		.sort((a, b) => b.amount - a.amount || (a.name < b.name ? -1 : 1));
}

/** Names that ever appear on this side, alphabetically, for the filter menus. */
export function namesFor(data: ExploreData, side: ExploreSide, dim: ExploreDimension): string[] {
	const s = side === 'spending' ? 0 : 1;
	const seen = new Set<number>();
	for (const r of data.rows) if (r[1] === s) seen.add(r[column[dim]]);
	return [...seen].map((i) => data.names[dim][i]).sort((a, b) => a.localeCompare(b));
}

/** Turns breakdown rows into a CSV for download. */
export function breakdownCsv(
	rows: readonly BreakdownRow[],
	labels: { name: string; year: string; previous: string }
): string {
	const cell = (v: string | number | null) => {
		const s = v === null ? '' : String(v);
		return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
	};
	return [
		[labels.name, labels.year, labels.previous].map(cell).join(','),
		...rows.map((r) => [r.name, r.amount, r.previous].map(cell).join(','))
	].join('\n');
}

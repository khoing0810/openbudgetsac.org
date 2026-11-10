import type { Series } from './data.ts';

export type ChangeStatus = 'changed' | 'new' | 'gone';

export interface DiffRow {
	name: string;
	from: number;
	to: number;
	change: number;
	/** Percent change, or null when the item had nothing in the first year. */
	pct: number | null;
	status: ChangeStatus;
}

export type DiffSort = 'change' | 'pct' | 'to' | 'name';

/** Rows for every name present in either year, with the change between them. */
export function diffSeries(series: Series, from: string, to: string): DiffRow[] {
	const rows: DiffRow[] = [];
	for (const [name, byYear] of Object.entries(series)) {
		const a = byYear[from] ?? 0;
		const b = byYear[to] ?? 0;
		if (a === 0 && b === 0) continue;
		rows.push({
			name,
			from: a,
			to: b,
			change: b - a,
			pct: a !== 0 ? ((b - a) / Math.abs(a)) * 100 : null,
			status: a === 0 ? 'new' : b === 0 ? 'gone' : 'changed'
		});
	}
	return rows;
}

/** Sorts a copy of the rows. `change` and `pct` sort by size of the move, largest first. */
export function sortDiff(rows: readonly DiffRow[], by: DiffSort): DiffRow[] {
	const copy = [...rows];
	switch (by) {
		case 'name':
			return copy.sort((a, b) => a.name.localeCompare(b.name));
		case 'to':
			return copy.sort((a, b) => b.to - a.to);
		case 'pct':
			return copy.sort(
				(a, b) =>
					Math.abs(b.pct ?? Number.POSITIVE_INFINITY) -
						Math.abs(a.pct ?? Number.POSITIVE_INFINITY) || b.to - a.to
			);
		default:
			return copy.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
	}
}

/** Percent change between two totals, or null without a base. */
export const pctChange = (from: number, to: number): number | null =>
	from !== 0 ? ((to - from) / Math.abs(from)) * 100 : null;

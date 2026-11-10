/**
 * Year-over-year comparison data: for each budget side (spending or revenue)
 * and each breakdown (department or category), the amount per name per year.
 */

export type CompareSide = 'spending' | 'revenue';
export type CompareDimension = 'department' | 'category';

/** name -> year id -> amount */
export type Series = Record<string, Record<string, number>>;

export interface CompareData {
	/** Year ids, oldest first. */
	years: string[];
	series: Record<CompareSide, Record<CompareDimension, Series>>;
	/** Total per side per year (sum of the department breakdown). */
	totals: Record<CompareSide, Record<string, number>>;
	/** General Fund spending per year, or null where the City didn't publish it. */
	generalFund: Record<string, number | null>;
}

/** One row of a published compare file. */
export interface RawRow {
	department?: string;
	account_category?: string;
	total: string | number;
}

/**
 * Departments were renamed over the years ("Parks & Recreation" became
 * "Parks and Recreation"). Folding them to one name keeps a department's
 * history on one line instead of showing it as cut and created.
 */
const ALIASES: Record<string, string> = {
	Technology: 'Information Technology',
	'City Auditor': 'Office of the City Auditor',
	// Renamed in FY 2018–19.
	'Parks and Recreation': 'Youth, Parks, and Community Enrichment',
	'Non Appropriated': 'Non-Appropriated',
	'Fines, Forfeitures, and  Penalties': 'Fines, Forfeitures, and Penalties',
	// Category spellings that changed over the years in the City's open dataset.
	'Fines Forfeitures Penalties': 'Fines, Forfeitures, and Penalties',
	'Interest, Rents, Concessions': 'Interest, Rents, and Concessions',
	'Licenses  Permits': 'Licenses and Permits',
	'Labor/Supply Offset': 'Labor and Supply Offset'
};

export function normalizeName(raw: string): string {
	const trimmed = raw
		.trim()
		.replace(/\s+&\s+/g, ' and ')
		.replace(/\s{2,}/g, ' ');
	return ALIASES[raw.trim()] ?? ALIASES[trimmed] ?? trimmed;
}

const toNumber = (v: string | number): number => {
	const n = typeof v === 'number' ? v : Number(String(v).replace(/[$,\s]/g, ''));
	return Number.isFinite(n) ? n : 0;
};

/** Adds one year's rows to a series, summing rows that normalize to the same name. */
export function addYear(
	series: Series,
	year: string,
	rows: readonly RawRow[],
	key: 'department' | 'account_category'
): number {
	let total = 0;
	for (const row of rows) {
		const raw = row[key];
		if (!raw) continue;
		const name = normalizeName(raw);
		const value = toNumber(row.total);
		const byYear = (series[name] ??= {});
		byYear[year] = (byYear[year] ?? 0) + value;
		total += value;
	}
	return total;
}

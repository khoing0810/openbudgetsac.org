import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { budgetYears, dataPaths } from '#lib/config/years.ts';
import { addYear, type CompareData, type RawRow } from '#lib/viz/compare/data.ts';

const readJson = async <T>(path: string): Promise<T> =>
	JSON.parse(await readFile(join(process.cwd(), 'static', path), 'utf8')) as T;

/**
 * Builds every year's comparison data at build time. The result is small
 * (a few thousand numbers), so the compare page ships it whole and switching
 * years never waits on the network.
 */
export async function loadCompareData(): Promise<CompareData> {
	const years = budgetYears.map((y) => y.id).reverse();
	const data: CompareData = {
		years,
		series: {
			spending: { department: {}, category: {} },
			revenue: { department: {}, category: {} }
		},
		totals: { spending: {}, revenue: {} },
		generalFund: {}
	};

	for (const year of years) {
		for (const [side, kind] of [
			['spending', 'expenses'],
			['revenue', 'revenue']
		] as const) {
			const depts = await readJson<RawRow[]>(dataPaths.compare(kind, 'depts', year));
			const cats = await readJson<RawRow[]>(dataPaths.compare(kind, 'account-cats', year));
			data.totals[side][year] = addYear(data.series[side].department, year, depts, 'department');
			addYear(data.series[side].category, year, cats, 'account_category');
		}
	}

	// totals.json carries General Fund spending; the City left it blank (0) some years.
	const totals = await readJson<{ fiscal_year_range: string; general_fund: string }[]>(
		'data/compare/fiscal-years-expenses/totals.json'
	);
	for (const year of years) {
		const gf = Number(totals.find((t) => t.fiscal_year_range === year)?.general_fund ?? 0);
		data.generalFund[year] = gf > 0 ? gf : null;
	}
	return data;
}

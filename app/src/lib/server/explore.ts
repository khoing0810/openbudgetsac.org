import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { csvParse } from 'd3-dsv';
import { toBudgetRow } from '#lib/data/approved-budgets.ts';
import { dataPaths } from '#lib/config/years.ts';
import { buildExploreData, type ExploreData } from '#lib/viz/explore/data.ts';

/** Reads the City's full Approved Budgets table from static/ and condenses it. Build time only. */
export async function loadExploreData(): Promise<ExploreData> {
	const csv = await readFile(join(process.cwd(), 'static', dataPaths.approvedBudgets), 'utf8');
	return buildExploreData(csvParse(csv.replace(/^\uFEFF/, '')).map((r) => toBudgetRow(r)));
}

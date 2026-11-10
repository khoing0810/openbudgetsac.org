import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { error } from '@sveltejs/kit';
import { csvParse } from 'd3-dsv';
import { budgetYears, dataPaths, findYear } from '#lib/config/years.ts';
import { buildFlowGraph } from '#lib/viz/flow/graph.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One prerendered page per configured year.
export const entries: EntryGenerator = () => budgetYears.map((y) => ({ year: y.id }));

// Runs at build time only. The CSV stays on the server; pages ship the small
// precomputed graph instead.
export const load: PageServerLoad = async ({ params }) => {
	const year = findYear(params.year);
	if (!year) error(404, `No budget data for ${params.year}`);

	const csv = await readFile(join(process.cwd(), 'static', dataPaths.flow(year.id)), 'utf8');
	const graph = buildFlowGraph(csvParse(csv.replace(/^\uFEFF/, '')), year.flow);

	return { year: { id: year.id, label: year.label }, graph };
};

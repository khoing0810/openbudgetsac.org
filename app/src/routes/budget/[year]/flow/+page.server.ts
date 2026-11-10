import { error } from '@sveltejs/kit';
import { budgetYears, findYear } from '#lib/config/years.ts';
import { loadFlowGraph } from '#lib/server/flow.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One prerendered page per configured year.
export const entries: EntryGenerator = () => budgetYears.map((y) => ({ year: y.id }));

// Runs at build time only. The CSV stays on the server; pages ship the small
// precomputed graph instead.
export const load: PageServerLoad = async ({ params }) => {
	const year = findYear(params.year);
	if (!year) error(404, `No budget data for ${params.year}`);
	const graph = await loadFlowGraph(year);
	return { year: { id: year.id, label: year.label }, graph };
};

import { error } from '@sveltejs/kit';
import { budgetYears, findYear } from '#lib/config/years.ts';
import { loadFlowGraph } from '#lib/server/flow.ts';
import { sourcesAndUses } from '#lib/viz/flow/sources.ts';
import { summarizeFlow } from '#lib/viz/flow/summary.ts';
import type { EntryGenerator, PageServerLoad } from './$types';

// One prerendered page per configured year.
export const entries: EntryGenerator = () => budgetYears.map((y) => ({ year: y.id }));

// Runs at build time only. The CSV stays on the server; pages ship the small
// precomputed graph, a summary, and last year's totals for comparison.
export const load: PageServerLoad = async ({ params }) => {
	const year = findYear(params.year);
	if (!year) error(404, `No budget data for ${params.year}`);
	const prevYear = budgetYears[budgetYears.indexOf(year) + 1] ?? null;

	const graph = await loadFlowGraph(year);
	const previous = prevYear ? await loadFlowGraph(prevYear) : null;
	const summary = summarizeFlow(graph);

	return {
		year: { id: year.id, label: year.label },
		previousYear: prevYear ? { id: prevYear.id, label: prevYear.label } : null,
		graph,
		summary: { ...summary, departments: summary.departments.slice(0, 1) },
		previousTotals: previous ? previous.totals : null,
		sourcesUses: sourcesAndUses(graph, previous)
	};
};

import { budgetYears, latestYear } from '#lib/config/years.ts';
import { loadFlowGraph } from '#lib/server/flow.ts';
import { percentChange, summarizeFlow } from '#lib/viz/flow/summary.ts';
import type { PageServerLoad } from './$types';

// Build-time headline numbers for the latest year, compared with the year before.
export const load: PageServerLoad = async () => {
	const previousYear = budgetYears[1];
	const [current, previous] = await Promise.all([
		loadFlowGraph(latestYear).then(summarizeFlow),
		previousYear ? loadFlowGraph(previousYear).then(summarizeFlow) : null
	]);
	return {
		year: { id: latestYear.id, label: latestYear.label },
		previousLabel: previousYear?.label ?? null,
		summary: { ...current, departments: current.departments.slice(0, 6) },
		change: previous ? percentChange(previous.expense, current.expense) : null
	};
};

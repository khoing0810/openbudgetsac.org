import { GENERAL_FUND, type FlowGraph } from './graph.ts';

export interface FlowSummary {
	revenue: number;
	expense: number;
	/** Spending paid from the General Fund, the part the City Council can direct. */
	generalFund: number;
	/** Departments by spending, largest first. */
	departments: { name: string; value: number }[];
}

/** Headline numbers for one year's flow graph. Pure. */
export function summarizeFlow(graph: FlowGraph): FlowSummary {
	const byDept = new Map<string, number>();
	let generalFund = 0;
	for (const link of graph.links) {
		if (!link.target.startsWith('expense:')) continue;
		const name = link.target.slice('expense:'.length);
		byDept.set(name, (byDept.get(name) ?? 0) + link.value);
		if (link.source === `fund:${GENERAL_FUND}`) generalFund += link.value;
	}
	const departments = [...byDept]
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value);
	return {
		revenue: graph.totals.revenue,
		expense: graph.totals.expense,
		generalFund,
		departments
	};
}

/** Percent change from `before` to `after`, or null when there is no base. */
export const percentChange = (before: number, after: number): number | null =>
	before > 0 ? ((after - before) / before) * 100 : null;

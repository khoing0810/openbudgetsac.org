import { GENERAL_FUND, type FlowGraph } from './graph.ts';

export interface SourceUseRow {
	name: string;
	total: number;
	/** Part that goes to (sources) or comes from (uses) the General Fund. */
	generalFund: number;
	/** Same item's total the year before, or null if it wasn't there. */
	previous: number | null;
}

export interface SourcesAndUses {
	sources: SourceUseRow[];
	uses: SourceUseRow[];
}

const GF = `fund:${GENERAL_FUND}`;

function collect(graph: FlowGraph, side: 'revenue' | 'expense') {
	const rows = new Map<string, { total: number; generalFund: number }>();
	for (const l of graph.links) {
		const end = side === 'revenue' ? l.source : l.target;
		if (!end.startsWith(`${side}:`)) continue;
		const name = end.slice(side.length + 1);
		const row = rows.get(name) ?? { total: 0, generalFund: 0 };
		row.total += l.value;
		if ((side === 'revenue' ? l.target : l.source) === GF) row.generalFund += l.value;
		rows.set(name, row);
	}
	return rows;
}

/**
 * Where the money comes from and where it goes, as ranked lists, each split
 * into its General Fund part and the rest, with last year's total alongside.
 * A phone-friendly reading of the same flow graph the Sankey draws.
 */
export function sourcesAndUses(graph: FlowGraph, previous?: FlowGraph | null): SourcesAndUses {
	const build = (side: 'revenue' | 'expense'): SourceUseRow[] => {
		const now = collect(graph, side);
		const before = previous ? collect(previous, side) : null;
		return [...now]
			.map(([name, r]) => ({
				name,
				total: r.total,
				generalFund: r.generalFund,
				previous: before ? (before.get(name)?.total ?? null) : null
			}))
			.sort((a, b) => b.total - a.total);
	};
	return { sources: build('revenue'), uses: build('expense') };
}

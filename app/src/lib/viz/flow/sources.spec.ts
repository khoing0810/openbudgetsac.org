import { describe, expect, it } from 'vitest';
import type { FlowGraph } from './graph.ts';
import { sourcesAndUses } from './sources.ts';

const graph = (scale = 1): FlowGraph => ({
	nodes: [],
	links: [
		{ source: 'revenue:Taxes', target: 'fund:General Fund', value: 60 * scale },
		{ source: 'revenue:Taxes', target: 'fund:Non-discretionary funds', value: 10 * scale },
		{ source: 'revenue:Fees', target: 'fund:Non-discretionary funds', value: 30 * scale },
		{ source: 'fund:General Fund', target: 'expense:Police', value: 50 * scale },
		{ source: 'fund:Non-discretionary funds', target: 'expense:Utilities', value: 40 * scale }
	],
	totals: { revenue: 100 * scale, expense: 90 * scale }
});

describe('sourcesAndUses', () => {
	it('ranks sources and uses and splits out the General Fund part', () => {
		const { sources, uses } = sourcesAndUses(graph());
		expect(sources.map((s) => [s.name, s.total, s.generalFund])).toEqual([
			['Taxes', 70, 60],
			['Fees', 30, 0]
		]);
		expect(uses.map((u) => [u.name, u.generalFund])).toEqual([
			['Police', 50],
			['Utilities', 0]
		]);
	});

	it('carries last year’s totals when given, and null without them', () => {
		expect(sourcesAndUses(graph(2), graph()).uses[0].previous).toBe(50);
		expect(sourcesAndUses(graph()).uses[0].previous).toBeNull();
	});
});

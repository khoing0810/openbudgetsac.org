import { describe, expect, it } from 'vitest';
import type { FlowGraph } from './graph.ts';
import { percentChange, summarizeFlow } from './summary.ts';

const graph: FlowGraph = {
	nodes: [],
	links: [
		{ source: 'revenue:Taxes', target: 'fund:General Fund', value: 100 },
		{ source: 'fund:General Fund', target: 'expense:Police', value: 60 },
		{ source: 'fund:Non-discretionary funds', target: 'expense:Police', value: 10 },
		{ source: 'fund:Non-discretionary funds', target: 'expense:Utilities', value: 80 }
	],
	totals: { revenue: 100, expense: 150 }
};

describe('summarizeFlow', () => {
	it('totals departments across funds and sorts them largest first', () => {
		expect(summarizeFlow(graph).departments).toEqual([
			{ name: 'Utilities', value: 80 },
			{ name: 'Police', value: 70 }
		]);
	});

	it('counts only General Fund spending as General Fund', () => {
		expect(summarizeFlow(graph).generalFund).toBe(60);
	});

	it('passes the graph totals through', () => {
		const s = summarizeFlow(graph);
		expect([s.revenue, s.expense]).toEqual([100, 150]);
	});
});

describe('percentChange', () => {
	it('returns the change as a percentage', () => {
		expect(percentChange(200, 250)).toBe(25);
	});
	it('returns null without a base', () => {
		expect(percentChange(0, 10)).toBeNull();
	});
});

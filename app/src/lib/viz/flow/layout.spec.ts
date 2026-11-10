import { describe, expect, it } from 'vitest';
import type { FlowGraph } from './graph.ts';
import { layoutFlow } from './layout.ts';

const graph: FlowGraph = {
	nodes: [
		{ id: 'fund:a', name: 'A', kind: 'fund' },
		{ id: 'revenue:r', name: 'R', kind: 'revenue' },
		{ id: 'expense:e1', name: 'E1', kind: 'expense' },
		{ id: 'expense:e2', name: 'E2', kind: 'expense' }
	],
	links: [
		{ source: 'revenue:r', target: 'fund:a', value: 100 },
		{ source: 'fund:a', target: 'expense:e1', value: 60 },
		{ source: 'fund:a', target: 'expense:e2', value: 40 }
	],
	totals: { revenue: 100, expense: 100 }
};

describe('layoutFlow', () => {
	const layout = layoutFlow(graph, { width: 600, height: 300 });
	const node = (id: string) => layout.nodes.find((n) => n.id === id)!;

	it('places revenue, funds and departments in three columns, left to right', () => {
		expect(node('revenue:r').x0).toBe(0);
		expect(node('fund:a').x0).toBeGreaterThan(node('revenue:r').x1);
		expect(node('expense:e1').x1).toBe(600);
	});

	it('keeps input order within a column', () => {
		expect(node('expense:e1').y0).toBeLessThan(node('expense:e2').y0);
	});

	it('stays inside the extent and emits a path per link', () => {
		for (const n of layout.nodes) {
			expect(n.y0).toBeGreaterThanOrEqual(0);
			expect(n.y1).toBeLessThanOrEqual(300 + 1e-9);
		}
		expect(layout.links).toHaveLength(3);
		expect(layout.links.every((l) => l.path.startsWith('M'))).toBe(true);
	});
});

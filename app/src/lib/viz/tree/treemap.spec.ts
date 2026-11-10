import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { findByPath, layoutTreeLevel, type BudgetTreeNode } from './treemap.ts';

const leaf = (key: string, amount: number): BudgetTreeNode => ({
	key,
	data: { amount, revenue: 0, expense: amount }
});

const root: BudgetTreeNode = {
	key: 'Budget',
	data: { amount: 100, revenue: 0, expense: 100 },
	values: [
		{ ...leaf('Police', 70), values: [leaf('Patrol', 50), leaf('Investigations', 20)] },
		leaf('Fire', 30),
		leaf('Refunds', -5)
	]
};

describe('treemap', () => {
	it('finds nodes by key path', () => {
		expect(findByPath(root, ['Police', 'Patrol'])?.data.amount).toBe(50);
		expect(findByPath(root, ['Nope'])).toBeUndefined();
	});

	it('lays out one level, largest first, skipping non-positive amounts', () => {
		const view = layoutTreeLevel(root, [], { width: 400, height: 200 });
		expect(view.total).toBe(100);
		expect(view.tiles.map((t) => t.name)).toEqual(['Police', 'Fire']);
		expect(view.tiles[0].hasChildren).toBe(true);
		const area = (t: (typeof view.tiles)[number]) => (t.x1 - t.x0) * (t.y1 - t.y0);
		expect(area(view.tiles[0])).toBeGreaterThan(area(view.tiles[1]) * 2);
	});

	it('drills into a child and gives tiles path-based ids', () => {
		const view = layoutTreeLevel(root, ['Police'], { width: 400, height: 200 });
		expect(view.total).toBe(70);
		expect(view.tiles.map((t) => t.id)).toEqual(['Police / Patrol', 'Police / Investigations']);
	});

	it('lays out the published FY26 expense tree', () => {
		const json = readFileSync(
			new URL('../../../../../_src/data/tree/Approved.Expense.FY26.json', import.meta.url),
			'utf8'
		);
		const view = layoutTreeLevel(JSON.parse(json), [], { width: 800, height: 500 });
		expect(view.tiles.length).toBeGreaterThan(5);
		expect(view.total).toBeGreaterThan(1_000_000_000);
	});
});

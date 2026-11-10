import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { swapTopLevels } from './regroup.ts';
import { indexTree, searchTree } from './search.ts';
import type { BudgetTreeNode } from './treemap.ts';

const d = (amount: number) => ({ amount, revenue: 0, expense: amount });
const tree: BudgetTreeNode = {
	key: 'Budget',
	data: d(100),
	values: [
		{
			key: 'General Fund',
			data: d(70),
			values: [
				{ key: 'Police', data: d(50), values: [{ key: 'Salaries', data: d(50) }] },
				{ key: 'Parks', data: d(20) }
			]
		},
		{
			key: 'Measure U',
			data: d(30),
			values: [{ key: 'Police', data: d(30), values: [{ key: 'Overtime', data: d(30) }] }]
		}
	]
};

describe('swapTopLevels', () => {
	const swapped = swapTopLevels(tree, 'All spending');

	it('groups by the second level, merging it across the first', () => {
		expect(swapped.key).toBe('All spending');
		expect(swapped.values!.map((v) => [v.key, v.data.amount])).toEqual([
			['Police', 80],
			['Parks', 20]
		]);
	});

	it('keeps the original first level underneath, largest first, with its subtree', () => {
		const police = swapped.values![0];
		expect(police.values!.map((v) => v.key)).toEqual(['General Fund', 'Measure U']);
		expect(police.values![1].values![0].key).toBe('Overtime');
	});

	it('keeps the grand total for the published file', () => {
		const file = JSON.parse(
			readFileSync(
				new URL('../../../../../_src/data/tree/Approved.Expense.FY26.json', import.meta.url),
				'utf8'
			)
		) as BudgetTreeNode;
		const sum = (n: BudgetTreeNode) => (n.values ?? []).reduce((t, c) => t + c.data.amount, 0);
		expect(Math.abs(sum(swapTopLevels(file)) - sum(file))).toBeLessThan(1);
	});
});

describe('searchTree', () => {
	const index = indexTree(tree);

	it('indexes every node below the root with its path', () => {
		expect(index).toHaveLength(7);
		expect(index.find((e) => e.name === 'Overtime')?.path).toEqual([
			'Measure U',
			'Police',
			'Overtime'
		]);
	});

	it('ranks prefix matches first, then larger amounts', () => {
		expect(searchTree(index, 'pol').map((e) => e.path.join(' / '))).toEqual([
			'General Fund / Police',
			'Measure U / Police'
		]);
	});

	it('matches the start of later words and ignores very short queries', () => {
		expect(searchTree(index, 'fund').map((e) => e.name)).toEqual(['General Fund']);
		expect(searchTree(index, 'p')).toEqual([]);
	});
});

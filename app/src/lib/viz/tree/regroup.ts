import type { BudgetTreeNode } from './treemap.ts';

type Totals = BudgetTreeNode['data'];

const add = (a: Totals, b: Totals): Totals => ({
	amount: a.amount + b.amount,
	revenue: (a.revenue ?? 0) + (b.revenue ?? 0),
	expense: (a.expense ?? 0) + (b.expense ?? 0)
});
const zero = (): Totals => ({ amount: 0, revenue: 0, expense: 0 });

/**
 * Swaps the first two levels of a budget tree. The published files go
 * fund → department → …; most residents look for a department first, so this
 * turns it into department → fund → …, merging each department's slices from
 * every fund. Everything below the second level is kept as is.
 */
export function swapTopLevels(root: BudgetTreeNode, rootKey = root.key): BudgetTreeNode {
	const groups = new Map<string, { data: Totals; children: BudgetTreeNode[] }>();
	for (const outer of root.values ?? []) {
		for (const inner of outer.values ?? []) {
			const g = groups.get(inner.key) ?? { data: zero(), children: [] };
			g.data = add(g.data, inner.data);
			g.children.push({ key: outer.key, data: inner.data, values: inner.values });
			groups.set(inner.key, g);
		}
	}
	return {
		key: rootKey,
		data: root.data,
		values: [...groups].map(([key, g]) => ({
			key,
			data: g.data,
			values: g.children.sort((a, b) => b.data.amount - a.data.amount)
		}))
	};
}

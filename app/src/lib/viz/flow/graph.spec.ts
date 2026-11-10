import { readFileSync } from 'node:fs';
import { csvParse } from 'd3-dsv';
import { describe, expect, it } from 'vitest';
import { budgetYears, findYear } from '#lib/config/years.ts';
import { buildFlowGraph, GENERAL_FUND, OTHER_FUNDS, orderBy } from './graph.ts';

const schema = findYear('FY26')!.flow;

const row = (over: Partial<Record<string, string>>): Record<string, string> => ({
	CATEGORY: 'Taxes',
	Department: 'Police',
	ExpenseRevenue: 'Revenues',
	Fund: 'General Fund',
	Amount: '100',
	...over
});

describe('buildFlowGraph', () => {
	it('routes revenue into funds and funds out to departments', () => {
		const g = buildFlowGraph(
			[
				row({ Amount: '100' }),
				row({ Amount: '50', Fund: 'Water Fund' }),
				row({ ExpenseRevenue: 'Expenses', Amount: '120' }),
				row({ ExpenseRevenue: 'Expenses', Department: 'Fire', Fund: 'Water Fund', Amount: '30' })
			],
			schema
		);
		expect(g.links).toEqual([
			{ source: 'revenue:Taxes', target: `fund:${GENERAL_FUND}`, value: 100 },
			{ source: 'revenue:Taxes', target: `fund:${OTHER_FUNDS}`, value: 50 },
			{ source: `fund:${GENERAL_FUND}`, target: 'expense:Police', value: 120 },
			{ source: `fund:${OTHER_FUNDS}`, target: 'expense:Fire', value: 30 }
		]);
		expect(g.totals).toEqual({ revenue: 150, expense: 150 });
	});

	it('sums rows, parses formatted amounts and drops non-positive links', () => {
		const g = buildFlowGraph(
			[
				row({ Amount: '$1,000' }),
				row({ Amount: '500' }),
				row({ CATEGORY: 'Licenses and Permits', Amount: '-20' })
			],
			schema
		);
		expect(g.links).toEqual([
			{ source: 'revenue:Taxes', target: `fund:${GENERAL_FUND}`, value: 1500 }
		]);
		expect(g.nodes.map((n) => n.id)).not.toContain('revenue:Licenses and Permits');
	});

	it('ignores rows that are neither revenue nor expense', () => {
		const g = buildFlowGraph([row({ ExpenseRevenue: 'Transfer' })], schema);
		expect(g.links).toHaveLength(0);
	});

	it('orders by the city reading order, then alphabetically', () => {
		const names = ['Zoo', 'Interest, Rents, and Concessions', 'Taxes', 'Apples'];
		expect(names.sort(orderBy(['Taxes', 'Interest, Rents, and Concessions']))).toEqual([
			'Taxes',
			'Interest, Rents, and Concessions',
			'Apples',
			'Zoo'
		]);
	});

	for (const year of budgetYears) {
		it(`builds a non-empty graph from the published ${year.id} data`, () => {
			const csv = readFileSync(
				new URL(`../../../../../_src/data/flow/${year.id}.csv`, import.meta.url),
				'utf8'
			);
			const g = buildFlowGraph(csvParse(csv.replace(/^\uFEFF/, '')), year.flow);
			expect(g.nodes.filter((n) => n.kind === 'revenue').length).toBeGreaterThan(3);
			expect(g.nodes.filter((n) => n.kind === 'expense').length).toBeGreaterThan(5);
			expect(g.totals.revenue).toBeGreaterThan(100_000_000);
			expect(g.totals.expense).toBeGreaterThan(100_000_000);
		});
	}
});

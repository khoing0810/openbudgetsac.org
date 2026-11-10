import { describe, expect, it } from 'vitest';
import type { BudgetRow } from '#lib/data/approved-budgets.ts';
import {
	breakdown,
	breakdownCsv,
	buildExploreData,
	namesFor,
	sideTotals,
	totalsByYear,
	type ExploreFilters
} from './data.ts';

const row = (over: Partial<BudgetRow>): BudgetRow => ({
	year: 2026,
	department: 'Police',
	fund: 'General Fund',
	category: 'Employee Services',
	amount: 100,
	type: 'Expenses',
	fundCategory: '',
	objectId: 0,
	...over
});

const data = buildExploreData([
	row({ year: 2025, amount: 80 }),
	row({ amount: 60 }),
	row({ amount: 40 }), // same line, summed
	row({ department: 'Parks & Recreation', year: 2015, amount: 5 }),
	row({ department: 'Youth, Parks, and Community Enrichment', amount: 30 }),
	row({ fund: 'Measure U Fund', amount: 20 }),
	row({ category: 'Licenses  Permits', type: 'Revenues', department: 'Finance', amount: 7 }),
	row({ amount: 0, department: 'Ghost' })
]);

const all: ExploreFilters = { side: 'spending', department: null, fund: null, category: null };

describe('buildExploreData', () => {
	it('stores names once, folds renamed lines together and drops zeros', () => {
		expect(data.years).toEqual([2015, 2025, 2026]);
		expect(data.names.department).toContain('Youth, Parks, and Community Enrichment');
		expect(data.names.department).not.toContain('Parks & Recreation');
		expect(data.names.category).toContain('Licenses and Permits');
		expect(data.rows.some((r) => data.names.department[r[2]] === 'Ghost')).toBe(false);
		expect(data.rows.filter((r) => r[0] === 2 && r[1] === 0)).toHaveLength(3);
	});
});

describe('totalsByYear', () => {
	it('sums every matching line per year and leaves gaps as null', () => {
		expect(totalsByYear(data, all)).toEqual([5, 80, 150]);
		expect(totalsByYear(data, { ...all, department: 'Police' })).toEqual([null, 80, 120]);
		expect(totalsByYear(data, { ...all, department: 'Police', fund: 'Measure U Fund' })).toEqual([
			null,
			null,
			20
		]);
		expect(sideTotals(data, 'revenue')).toEqual([0, 0, 7]);
	});
});

describe('breakdown', () => {
	it('groups one year by a dimension, largest first, with last year alongside', () => {
		expect(breakdown(data, all, 2026, 'department')).toEqual([
			{ name: 'Police', amount: 120, previous: 80 },
			{ name: 'Youth, Parks, and Community Enrichment', amount: 30, previous: null }
		]);
		expect(breakdown(data, { ...all, department: 'Police' }, 2026, 'fund')).toEqual([
			{ name: 'General Fund', amount: 100, previous: 80 },
			{ name: 'Measure U Fund', amount: 20, previous: null }
		]);
	});
	it('has no previous year for the first year', () => {
		expect(breakdown(data, all, 2015, 'department')[0].previous).toBeNull();
	});
});

describe('namesFor', () => {
	it('lists the names on one side alphabetically', () => {
		expect(namesFor(data, 'revenue', 'department')).toEqual(['Finance']);
		expect(namesFor(data, 'spending', 'fund')).toEqual(['General Fund', 'Measure U Fund']);
	});
});

describe('breakdownCsv', () => {
	it('writes a header and quotes names with commas', () => {
		const csv = breakdownCsv([{ name: 'Youth, Parks', amount: 3, previous: null }], {
			name: 'Department',
			year: 'FY 2025–26',
			previous: 'FY 2024–25'
		});
		expect(csv).toBe('Department,FY 2025–26,FY 2024–25\n"Youth, Parks",3,');
	});
});

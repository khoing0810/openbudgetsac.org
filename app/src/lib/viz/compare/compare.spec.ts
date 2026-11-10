import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { budgetYears } from '#lib/config/years.ts';
import { addYear, normalizeName, type RawRow, type Series } from './data.ts';
import { diffSeries, pctChange, sortDiff } from './diff.ts';
import { layoutDiverging } from './diverging.ts';
import { layoutTrend } from './trend.ts';

describe('normalizeName', () => {
	it('folds renamed departments onto one name', () => {
		expect(normalizeName('Parks & Recreation')).toBe('Youth, Parks, and Community Enrichment');
		expect(normalizeName('City Auditor')).toBe('Office of the City Auditor');
		expect(normalizeName('Technology')).toBe('Information Technology');
		expect(normalizeName('Fines, Forfeitures, and  Penalties')).toBe(
			'Fines, Forfeitures, and Penalties'
		);
	});
});

describe('addYear', () => {
	it('sums rows that normalize to the same name and returns the total', () => {
		const series: Series = {};
		const rows: RawRow[] = [
			{ department: 'Parks & Recreation', total: '10' },
			{ department: 'Parks and Recreation', total: 5 },
			{ department: 'Police', total: '$1,000' }
		];
		expect(addYear(series, 'FY26', rows, 'department')).toBe(1015);
		expect(series['Youth, Parks, and Community Enrichment']).toEqual({ FY26: 15 });
	});
});

describe('diffSeries', () => {
	const series: Series = {
		Police: { FY25: 100, FY26: 120 },
		Fire: { FY25: 80, FY26: 60 },
		New: { FY26: 5 },
		Gone: { FY25: 7 },
		Never: { FY24: 9 }
	};
	const rows = diffSeries(series, 'FY25', 'FY26');

	it('includes names present in either year only', () => {
		expect(rows.map((r) => r.name).sort()).toEqual(['Fire', 'Gone', 'New', 'Police']);
	});

	it('computes change, percent and status', () => {
		const police = rows.find((r) => r.name === 'Police')!;
		expect([police.change, police.pct, police.status]).toEqual([20, 20, 'changed']);
		expect(rows.find((r) => r.name === 'New')).toMatchObject({ pct: null, status: 'new' });
		expect(rows.find((r) => r.name === 'Gone')).toMatchObject({ change: -7, status: 'gone' });
	});

	it('sorts by size of change, largest first', () => {
		expect(sortDiff(rows, 'change').map((r) => r.name)).toEqual(['Police', 'Fire', 'Gone', 'New']);
	});
});

describe('pctChange', () => {
	it('handles a zero base', () => {
		expect(pctChange(0, 5)).toBeNull();
		expect(pctChange(200, 150)).toBe(-25);
	});
});

describe('layoutDiverging', () => {
	it('puts zero between the extremes and sizes bars by value', () => {
		const { zero, bars } = layoutDiverging([-50, 150, 0]);
		expect(zero).toBe(25);
		expect(bars[0]).toEqual({ left: 0, width: 25, direction: 'down' });
		expect(bars[1]).toEqual({ left: 25, width: 75, direction: 'up' });
		expect(bars[2].direction).toBe('flat');
	});

	it('keeps zero at the left edge when everything grew', () => {
		expect(layoutDiverging([10, 20]).zero).toBe(0);
	});
});

describe('layoutTrend', () => {
	it('starts the y axis at zero and leaves gaps for missing values', () => {
		const t = layoutTrend(['A', 'B', 'C'], [{ id: 's', label: 'S', values: [10, null, 30] }], {
			width: 300,
			height: 200
		});
		expect(t.ticks[0].value).toBe(0);
		expect(t.lines[0].points).toHaveLength(2);
		expect(t.lines[0].path.match(/M/g)).toHaveLength(2);
	});
});

describe('published compare data', () => {
	const read = (path: string): RawRow[] =>
		JSON.parse(
			readFileSync(new URL(`../../../../../_src/data/compare/${path}`, import.meta.url), 'utf8')
		);

	for (const { id } of budgetYears) {
		it(`spending and revenue for ${id} add up the same by department and by category`, () => {
			for (const kind of ['expenses', 'revenue']) {
				const byDept = addYear({}, id, read(`fiscal-years-${kind}/depts/${id}.json`), 'department');
				const byCat = addYear(
					{},
					id,
					read(`fiscal-years-${kind}/account-cats/${id}.json`),
					'account_category'
				);
				expect(byDept).toBeGreaterThan(100_000_000);
				expect(Math.abs(byDept - byCat)).toBeLessThan(1);
			}
		});
	}
});

import { describe, expect, it } from 'vitest';
import {
	buildCompareFiles,
	buildTree,
	fetchApprovedBudgets,
	fetchLastEdit,
	fyId,
	normalizeType,
	toBudgetRow,
	toCsv,
	type BudgetRow
} from './approved-budgets.ts';

const row = (over: Partial<BudgetRow>): BudgetRow => ({
	year: 2026,
	department: 'Police',
	fund: 'General Fund',
	category: 'Employee Services',
	amount: 100,
	type: 'Expenses',
	fundCategory: 'General Fund',
	objectId: 1,
	...over
});

const rows: BudgetRow[] = [
	row({ objectId: 1, amount: 100 }),
	row({ objectId: 2, amount: 50, fund: 'Measure U Fund' }),
	row({ objectId: 3, amount: 25, department: 'Fire' }),
	row({ objectId: 4, amount: 10, category: 'Other Services and Supplies' }),
	row({ objectId: 5, amount: 300, type: 'Revenues', category: 'Taxes', department: 'Finance' }),
	row({ objectId: 6, amount: 999, year: 2025 })
];

describe('normalizeType', () => {
	it('reads both the old letters and the spelled-out values', () => {
		expect(normalizeType('E')).toBe('Expenses');
		expect(normalizeType(' Revenues ')).toBe('Revenues');
		expect(normalizeType('revenue')).toBe('Revenues');
	});
	it('refuses anything else, so a schema change fails loudly', () => {
		expect(() => normalizeType('Transfers')).toThrow(/Unknown/);
	});
});

describe('toBudgetRow', () => {
	it('parses API attributes and CSV strings alike', () => {
		const r = toBudgetRow({
			Fiscal_Year: '2027',
			Department: ' Fire ',
			Fund: 'General Fund',
			CATEGORY: 'Taxes',
			Amount: '1,250',
			ExpenseRevenue: 'R',
			Fund_Category: 'General Fund',
			ObjectId: 9
		});
		expect(r).toMatchObject({ year: 2027, department: 'Fire', amount: 1250, type: 'Revenues' });
	});
	it('rejects a missing year or amount', () => {
		expect(() => toBudgetRow({ Fiscal_Year: '', Amount: 1, ExpenseRevenue: 'E' })).toThrow();
		expect(() => toBudgetRow({ Fiscal_Year: 2026, Amount: 'n/a', ExpenseRevenue: 'E' })).toThrow();
	});
});

describe('fetchApprovedBudgets', () => {
	const attrs = (id: number) => ({
		Fiscal_Year: 2027,
		Department: 'Police',
		Fund: 'General Fund',
		CATEGORY: 'Employee Services',
		Amount: id,
		ExpenseRevenue: 'Expenses',
		Fund_Category: 'General Fund',
		ObjectId: id
	});
	const respond = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

	it('pages through the table until the service says there is no more', async () => {
		const urls: string[] = [];
		const result = await fetchApprovedBudgets(
			async (url) => {
				urls.push(url);
				const offset = Number(new URL(url).searchParams.get('resultOffset'));
				const ids = offset === 0 ? [1, 2] : offset === 2 ? [3, 4] : [5];
				return respond({
					features: ids.map((i) => ({ attributes: attrs(i) })),
					exceededTransferLimit: ids.length === 2
				});
			},
			{ pageSize: 2 }
		);
		expect(result.map((r) => r.objectId)).toEqual([1, 2, 3, 4, 5]);
		expect(urls).toHaveLength(3);
		expect(urls[0]).toContain('orderByFields=ObjectId');
	});

	it('surfaces ArcGIS errors and HTTP failures', async () => {
		await expect(
			fetchApprovedBudgets(async () => respond({ error: { message: 'Invalid query' } }))
		).rejects.toThrow(/Invalid query/);
		await expect(
			fetchApprovedBudgets(async () => ({ ok: false, status: 503, json: async () => ({}) }))
		).rejects.toThrow(/HTTP 503/);
	});

	it('reads the last edit date', async () => {
		const date = await fetchLastEdit(async () =>
			respond({ editingInfo: { lastEditDate: Date.UTC(2026, 6, 1, 22, 54) } })
		);
		expect(date).toBe('2026-07-01');
	});
});

describe('toCsv', () => {
	it("keeps the City's column order and quotes commas", () => {
		const csv = toCsv([row({ category: 'Charges, Fees, and Services' })]);
		const [header, line] = csv.trim().split('\n');
		expect(header).toBe(
			'Fiscal_Year,Department,Fund,CATEGORY,Amount,ExpenseRevenue,Fund_Category,ObjectId'
		);
		expect(line).toBe(
			'2026,Police,General Fund,"Charges, Fees, and Services",100,Expenses,General Fund,1'
		);
	});
});

describe('buildTree', () => {
	const year = rows.filter((r) => r.year === 2026);

	it('nests spending by fund, then department, then category', () => {
		const tree = buildTree(year, 'Expenses');
		expect(tree.data.amount).toBe(185);
		expect(tree.values?.map((n) => n.key)).toEqual(['General Fund', 'Measure U Fund']);
		const gf = tree.values![0];
		expect(gf.data.amount).toBe(135);
		expect(gf.values?.map((n) => [n.key, n.data.amount])).toEqual([
			['Fire', 25],
			['Police', 110]
		]);
		expect(gf.values![1].values?.map((n) => n.key)).toEqual([
			'Employee Services',
			'Other Services and Supplies'
		]);
		expect(gf.values![1].values![0].values).toBeUndefined();
	});

	it('nests revenue by fund, then category', () => {
		const tree = buildTree(year, 'Revenues');
		expect(tree.data).toEqual({ amount: 300, revenue: 300, expense: 0 });
		expect(tree.values![0].values![0].key).toBe('Taxes');
	});
});

describe('buildCompareFiles', () => {
	it('sums each department and category and the General Fund total', () => {
		const files = buildCompareFiles(rows, 2026);
		expect(files.expenseDepartments.map((r) => [r.department, r.total])).toEqual([
			['Fire', '25'],
			['Police', '160']
		]);
		expect(files.revenueCategories).toEqual([
			{
				budget_type: '1',
				fiscal_year_range: 2026,
				account_category: 'Taxes',
				total: '300',
				general_fund: '0'
			}
		]);
		expect(files.totals).toEqual({
			budget_type: '1',
			fiscal_year_range: 'FY26',
			total: '185',
			general_fund: '135'
		});
	});
});

describe('fyId', () => {
	it('uses the year the fiscal year ends in', () => {
		expect(fyId(2027)).toBe('FY27');
		expect(fyId(2009)).toBe('FY09');
	});
});

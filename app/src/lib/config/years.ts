/**
 * The single list of budget years the site publishes.
 *
 * Adding a year: drop the source files into `_src/data/flow/<id>.csv` and
 * `_src/data/tree/Approved.{Expense,Revenue}.<id>.json`, then add one entry
 * here. Every route under `/budget/[year]` is prerendered from this list.
 */

/** Column names and discriminator values for one year's flow CSV export. */
export interface FlowSchema {
	/** Revenue category column. */
	category: string;
	/** Expense department column. */
	department: string;
	/** Column that says whether a row is revenue or expense. */
	type: string;
	revenueValue: string;
	expenseValue: string;
	/** Fund column, compared against `generalFund`. */
	fund: string;
	generalFund: string;
	amount: string;
}

export interface BudgetYear {
	/** Short id used in URLs and file names, e.g. `FY26`. */
	id: string;
	/** Human label, e.g. `FY 2025–26`. */
	label: string;
	flow: FlowSchema;
}

/** City open-data exports from FY13–FY14 and FY19 onward. */
const OPEN_DATA_SCHEMA: FlowSchema = {
	category: 'CATEGORY',
	department: 'Department',
	type: 'ExpenseRevenue',
	revenueValue: 'R',
	expenseValue: 'E',
	fund: 'Fund',
	generalFund: 'General Fund',
	amount: 'Amount'
};

/** FY25 onward spell out the revenue/expense discriminator. */
const OPEN_DATA_SCHEMA_SPELLED: FlowSchema = {
	...OPEN_DATA_SCHEMA,
	revenueValue: 'Revenues',
	expenseValue: 'Expenses'
};

/** FY15–FY18 came from the budget office's detailed export. */
const BUDGET_OFFICE_SCHEMA: FlowSchema = {
	category: 'account_category',
	department: 'department',
	type: 'account_type',
	revenueValue: 'Revenues',
	expenseValue: 'Expenses',
	fund: 'fund_code',
	generalFund: 'General Funds',
	amount: 'amount'
};

const year = (n: number, flow: FlowSchema): BudgetYear => {
	const yy = String(n).padStart(2, '0');
	const prev = String(n - 1).padStart(2, '0');
	return { id: `FY${yy}`, label: `FY 20${prev}–${yy}`, flow };
};

/** Newest first. */
export const budgetYears: readonly BudgetYear[] = [
	year(26, OPEN_DATA_SCHEMA_SPELLED),
	year(25, OPEN_DATA_SCHEMA_SPELLED),
	year(24, OPEN_DATA_SCHEMA),
	year(23, OPEN_DATA_SCHEMA),
	year(22, OPEN_DATA_SCHEMA),
	year(21, OPEN_DATA_SCHEMA),
	year(20, OPEN_DATA_SCHEMA),
	year(19, OPEN_DATA_SCHEMA),
	year(18, BUDGET_OFFICE_SCHEMA),
	year(17, BUDGET_OFFICE_SCHEMA),
	year(16, BUDGET_OFFICE_SCHEMA),
	year(15, BUDGET_OFFICE_SCHEMA),
	year(14, OPEN_DATA_SCHEMA),
	year(13, OPEN_DATA_SCHEMA)
];

export const latestYear: BudgetYear = budgetYears[0];

export function findYear(id: string): BudgetYear | undefined {
	return budgetYears.find((y) => y.id === id);
}

/** Tree data is split by account type. */
export const treeAccounts = ['Expense', 'Revenue'] as const;
export type TreeAccount = (typeof treeAccounts)[number];

/** Paths are relative to `static/`, for use with `asset()`. */
export const dataPaths = {
	flow: (y: string) => `data/flow/${y}.csv` as const,
	tree: (y: string, account: TreeAccount) => `data/tree/Approved.${account}.${y}.json` as const
};

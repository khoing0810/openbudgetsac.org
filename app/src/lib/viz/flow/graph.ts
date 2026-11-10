import type { FlowSchema } from '#lib/config/years.ts';

export type FlowNodeKind = 'revenue' | 'fund' | 'expense';

export interface FlowNode {
	/** Stable id, unique within a graph. */
	id: string;
	name: string;
	kind: FlowNodeKind;
}

export interface FlowLink {
	source: string;
	target: string;
	value: number;
}

export interface FlowGraph {
	nodes: FlowNode[];
	links: FlowLink[];
	totals: { revenue: number; expense: number };
}

export const GENERAL_FUND = 'General Fund';
export const OTHER_FUNDS = 'Non-discretionary funds';

/** Sacramento's own reading order, not alphabetical. Unlisted names sort after, A–Z. */
export const REVENUE_ORDER = [
	'Taxes',
	'Charges, Fees, and Services',
	'Miscellaneous Revenue',
	'Intergovernmental',
	'Contributions from Other Funds',
	'Licenses and Permits',
	'Fines, Forfeitures, and  Penalties',
	'Interest, Rents, and Concessions'
];

export const EXPENSE_ORDER = [
	'Police',
	'Utilities',
	'Citywide and Community Support',
	'General Services',
	'Fire',
	'Debt Service',
	'Public Works',
	'Human Resources',
	'Parks and Recreation',
	'Community Development',
	'Convention and Cultural Services',
	'Finance',
	'Information Technology',
	'City Attorney',
	'Mayor/Council',
	'City Manager',
	'City Treasurer',
	'Economic Development',
	'City Clerk',
	'Non-Appropriated'
];

export function orderBy(order: readonly string[]) {
	const rank = new Map(order.map((name, i) => [name, i]));
	return (a: string, b: string): number => {
		const ra = rank.get(a) ?? Number.MAX_SAFE_INTEGER;
		const rb = rank.get(b) ?? Number.MAX_SAFE_INTEGER;
		return ra !== rb ? ra - rb : a.localeCompare(b);
	};
}

const parseAmount = (raw: string | undefined): number => {
	if (!raw) return 0;
	const n = Number(raw.replace(/[$,\s]/g, ''));
	return Number.isFinite(n) ? n : 0;
};

const fundId = (bucket: string) => `fund:${bucket}`;

/**
 * Builds the revenue → fund → department graph for one year.
 *
 * Revenue categories flow into the General Fund or the non-discretionary
 * funds; those funds flow out to departments. Rows that net to zero or less
 * for a link are dropped, since a flow diagram can't draw negative widths.
 */
export function buildFlowGraph(
	rows: ReadonlyArray<Record<string, string>>,
	schema: FlowSchema
): FlowGraph {
	const revenue = new Map<string, Map<string, number>>();
	const expense = new Map<string, Map<string, number>>();

	for (const row of rows) {
		const kind = row[schema.type];
		const target =
			kind === schema.revenueValue ? revenue : kind === schema.expenseValue ? expense : null;
		if (!target) continue;
		const name = (
			kind === schema.revenueValue ? row[schema.category] : row[schema.department]
		)?.trim();
		if (!name) continue;
		const bucket = row[schema.fund] === schema.generalFund ? GENERAL_FUND : OTHER_FUNDS;
		const byFund = target.get(name) ?? new Map<string, number>();
		byFund.set(bucket, (byFund.get(bucket) ?? 0) + parseAmount(row[schema.amount]));
		target.set(name, byFund);
	}

	const nodes: FlowNode[] = [
		{ id: fundId(GENERAL_FUND), name: GENERAL_FUND, kind: 'fund' },
		{ id: fundId(OTHER_FUNDS), name: OTHER_FUNDS, kind: 'fund' }
	];
	const links: FlowLink[] = [];
	const totals = { revenue: 0, expense: 0 };

	for (const name of [...revenue.keys()].sort(orderBy(REVENUE_ORDER))) {
		const id = `revenue:${name}`;
		let added = false;
		for (const [bucket, value] of revenue.get(name)!) {
			if (value <= 0) continue;
			links.push({ source: id, target: fundId(bucket), value });
			totals.revenue += value;
			added = true;
		}
		if (added) nodes.push({ id, name, kind: 'revenue' });
	}

	for (const name of [...expense.keys()].sort(orderBy(EXPENSE_ORDER))) {
		const id = `expense:${name}`;
		let added = false;
		for (const [bucket, value] of expense.get(name)!) {
			if (value <= 0) continue;
			links.push({ source: fundId(bucket), target: id, value });
			totals.expense += value;
			added = true;
		}
		if (added) nodes.push({ id, name, kind: 'expense' });
	}

	return { nodes, links, totals };
}

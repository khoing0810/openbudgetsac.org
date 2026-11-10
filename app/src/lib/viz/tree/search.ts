import type { BudgetTreeNode } from './treemap.ts';

export interface TreeEntry {
	name: string;
	/** Keys from the root's children down to this node. */
	path: string[];
	amount: number;
	/** True for nodes with children to drill into. */
	branch: boolean;
}

/** Flattens every node below the root into a searchable list. */
export function indexTree(root: BudgetTreeNode): TreeEntry[] {
	const out: TreeEntry[] = [];
	const walk = (node: BudgetTreeNode, path: string[]) => {
		for (const child of node.values ?? []) {
			const p = [...path, child.key];
			out.push({
				name: child.key,
				path: p,
				amount: child.data?.amount ?? 0,
				branch: (child.values?.length ?? 0) > 0
			});
			walk(child, p);
		}
	};
	walk(root, []);
	return out;
}

/**
 * Case-insensitive search. Names that start with the query rank first, then
 * names with a word that starts with it, then any match; ties go to the larger
 * amount, so "Police" finds the department before a small account named after it.
 */
export function searchTree(index: readonly TreeEntry[], query: string, limit = 8): TreeEntry[] {
	const q = query.trim().toLowerCase();
	if (q.length < 2) return [];
	const scored: { e: TreeEntry; score: number }[] = [];
	for (const e of index) {
		const name = e.name.toLowerCase();
		const at = name.indexOf(q);
		if (at < 0) continue;
		const score = at === 0 ? 0 : /[\s(/-]/.test(name[at - 1]) ? 1 : 2;
		scored.push({ e, score });
	}
	return scored
		.sort(
			(a, b) => a.score - b.score || b.e.amount - a.e.amount || a.e.path.length - b.e.path.length
		)
		.slice(0, limit)
		.map((s) => s.e);
}

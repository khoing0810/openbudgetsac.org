import { hierarchy, treemap, treemapSquarify, type HierarchyNode } from 'd3-hierarchy';

/** Shape of `data/tree/Approved.<Account>.<Year>.json`. */
export interface BudgetTreeNode {
	key: string;
	data: { amount: number; revenue: number; expense: number };
	values?: BudgetTreeNode[];
}

export interface TreeTile {
	/** Path of keys from the root, joined with ` / `. Unique per tile. */
	id: string;
	name: string;
	value: number;
	x0: number;
	y0: number;
	x1: number;
	y1: number;
	/** True when the tile has children to drill into. */
	hasChildren: boolean;
}

export interface TreeView {
	/** Keys from the root down to the focused node; empty at the root. */
	path: string[];
	total: number;
	tiles: TreeTile[];
}

/** Finds a node by its key path. Returns undefined if any step is missing. */
export function findByPath(
	root: BudgetTreeNode,
	path: readonly string[]
): BudgetTreeNode | undefined {
	let node: BudgetTreeNode | undefined = root;
	for (const key of path) {
		node = node?.values?.find((child) => child.key === key);
		if (!node) return undefined;
	}
	return node;
}

const amountOf = (node: BudgetTreeNode) => Math.max(0, node.data?.amount ?? 0);

/**
 * Lays out one level of the tree: the focused node's children as tiles,
 * sized by amount. Showing one level at a time keeps it readable on phones.
 */
export function layoutTreeLevel(
	root: BudgetTreeNode,
	path: readonly string[],
	size: { width: number; height: number }
): TreeView {
	const focus = findByPath(root, path) ?? root;
	const level: BudgetTreeNode = {
		key: focus.key,
		data: focus.data,
		values: (focus.values ?? []).filter((c) => amountOf(c) > 0)
	};

	const h: HierarchyNode<BudgetTreeNode> = hierarchy(level, (d) =>
		d === level ? d.values : undefined
	)
		.sum((d) => (d === level ? 0 : amountOf(d)))
		.sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

	const laid = treemap<BudgetTreeNode>()
		.tile(treemapSquarify.ratio(1.4))
		.size([size.width, size.height])
		.paddingInner(2)
		.round(true)(h);

	const prefix = path.length ? `${path.join(' / ')} / ` : '';
	return {
		path: [...path],
		total: laid.value ?? 0,
		tiles: (laid.children ?? []).map((c) => ({
			id: `${prefix}${c.data.key}`,
			name: c.data.key,
			value: c.value ?? 0,
			x0: c.x0,
			y0: c.y0,
			x1: c.x1,
			y1: c.y1,
			hasChildren: (c.data.values?.length ?? 0) > 0
		}))
	};
}

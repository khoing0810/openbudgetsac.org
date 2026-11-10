import { sankey, sankeyLinkHorizontal, sankeyJustify } from 'd3-sankey';
import type { FlowGraph, FlowNode, FlowNodeKind } from './graph.ts';

export interface PlacedNode {
	id: string;
	name: string;
	kind: FlowNodeKind;
	x0: number;
	x1: number;
	y0: number;
	y1: number;
	value: number;
}

export interface PlacedLink {
	/** Index into `links` of the input graph. */
	index: number;
	source: string;
	target: string;
	value: number;
	width: number;
	/** SVG path data for the link's centre line; stroke it with `width`. */
	path: string;
}

export interface FlowLayout {
	width: number;
	height: number;
	nodes: PlacedNode[];
	links: PlacedLink[];
}

export interface FlowLayoutOptions {
	width: number;
	height: number;
	nodeWidth?: number;
	nodePadding?: number;
}

type SNode = FlowNode & { x0?: number; x1?: number; y0?: number; y1?: number; value?: number };
type SLink = {
	index?: number;
	source: string | SNode;
	target: string | SNode;
	value: number;
	width?: number;
};

/**
 * Positions a flow graph with d3-sankey. Pure: same input, same output, no DOM.
 * Node order within each column follows the graph's input order.
 */
export function layoutFlow(graph: FlowGraph, options: FlowLayoutOptions): FlowLayout {
	const { width, height, nodeWidth = 14, nodePadding = 8 } = options;

	const generator = sankey<SNode, SLink>()
		.nodeId((d) => d.id)
		.nodeAlign(sankeyJustify)
		.nodeSort(null)
		.nodeWidth(nodeWidth)
		.nodePadding(nodePadding)
		.extent([
			[0, 0],
			[width, height]
		]);

	const result = generator({
		nodes: graph.nodes.map((n) => ({ ...n })),
		links: graph.links.map((l) => ({ ...l }))
	});

	const path = sankeyLinkHorizontal<SNode, SLink>();

	return {
		width,
		height,
		nodes: result.nodes.map((n) => ({
			id: n.id,
			name: n.name,
			kind: n.kind,
			x0: n.x0 ?? 0,
			x1: n.x1 ?? 0,
			y0: n.y0 ?? 0,
			y1: n.y1 ?? 0,
			value: n.value ?? 0
		})),
		links: result.links.map((l, index) => ({
			index,
			source: (l.source as SNode).id,
			target: (l.target as SNode).id,
			value: l.value,
			width: Math.max(1, l.width ?? 0),
			path: path(l as never) ?? ''
		}))
	};
}

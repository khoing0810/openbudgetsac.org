<script lang="ts">
	import type { FlowGraph } from '#lib/viz/flow/graph.ts';
	import { layoutFlow, type PlacedLink, type PlacedNode } from '#lib/viz/flow/layout.ts';
	import { formatShare, formatUsd, formatUsdCompact } from '#lib/viz/format.ts';

	let { graph, title }: { graph: FlowGraph; title: string } = $props();

	const MIN_WIDTH = 720;
	const LABEL_GUTTER = 190;

	let containerWidth = $state(0);
	let selectedNode = $state<string | null>(null);
	let hoveredLink = $state<number | null>(null);

	const width = $derived(Math.max(MIN_WIDTH, containerWidth || 960));
	const height = $derived(Math.max(480, graph.nodes.length * 20));
	const layout = $derived(
		layoutFlow(graph, { width: width - 2 * LABEL_GUTTER, height: height - 20, nodePadding: 6 })
	);
	const nodeById = $derived(new Map(layout.nodes.map((n) => [n.id, n])));

	const isActive = (link: PlacedLink) =>
		hoveredLink === link.index ||
		(selectedNode !== null && (link.source === selectedNode || link.target === selectedNode));

	const linkColor = (link: PlacedLink) =>
		link.source.startsWith('revenue:') ? 'var(--revenue)' : 'var(--expense)';

	const nodeFill = (n: PlacedNode) =>
		n.kind === 'revenue'
			? 'var(--revenue-fill)'
			: n.kind === 'expense'
				? 'var(--expense-fill)'
				: 'var(--fund)';

	const describeLink = (l: PlacedLink) => {
		const s = nodeById.get(l.source)?.name ?? '';
		const t = nodeById.get(l.target)?.name ?? '';
		return `${s} → ${t}: ${formatUsd(l.value)}`;
	};

	const status = $derived.by(() => {
		if (hoveredLink !== null) {
			const l = layout.links[hoveredLink];
			return l ? describeLink(l) : '';
		}
		if (selectedNode) {
			const n = nodeById.get(selectedNode);
			if (n) {
				const total = n.kind === 'revenue' ? graph.totals.revenue : graph.totals.expense;
				return `${n.name}: ${formatUsd(n.value)}${n.kind === 'fund' ? '' : ` (${formatShare(n.value, total)} of ${n.kind === 'revenue' ? 'revenue' : 'spending'})`}`;
			}
		}
		return 'Hover over or tab to a flow to see its amount. Select a bar to highlight all of its flows.';
	});

	const toggleNode = (id: string) => (selectedNode = selectedNode === id ? null : id);

	const revenueRows = $derived(layout.nodes.filter((n) => n.kind === 'revenue'));
	const expenseRows = $derived(layout.nodes.filter((n) => n.kind === 'expense'));
</script>

<figure class="flow">
	<figcaption class="visually-hidden">{title}</figcaption>
	<p class="status" aria-live="polite">{status}</p>

	<!-- A scrollable region must be focusable so keyboard users can scroll it (WCAG 2.1.1). -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="scroller"
		bind:clientWidth={containerWidth}
		role="region"
		aria-label="{title}, scrollable"
		tabindex="0"
	>
		<svg
			viewBox="0 0 {width} {height}"
			{width}
			{height}
			role="group"
			aria-label="{title}: revenue sources on the left flow into the General Fund and non-discretionary funds, which flow out to departments on the right."
		>
			<g transform="translate({LABEL_GUTTER},10)">
				<g class="links" fill="none">
					{#each layout.links as link (link.index)}
						<path
							d={link.path}
							stroke={linkColor(link)}
							stroke-width={link.width}
							class:active={isActive(link)}
							class:dim={(hoveredLink !== null || selectedNode !== null) && !isActive(link)}
							tabindex="0"
							role="button"
							aria-label={describeLink(link)}
							onpointerenter={() => (hoveredLink = link.index)}
							onpointerleave={() => (hoveredLink = null)}
							onfocus={() => (hoveredLink = link.index)}
							onblur={() => (hoveredLink = null)}
						/>
					{/each}
				</g>
				<g class="nodes">
					{#each layout.nodes as node (node.id)}
						{@const h = Math.max(1, node.y1 - node.y0)}
						<g
							class="node"
							class:selected={selectedNode === node.id}
							transform="translate({node.x0},{node.y0})"
						>
							<rect
								width={node.x1 - node.x0}
								height={h}
								fill={nodeFill(node)}
								tabindex="0"
								role="button"
								aria-pressed={selectedNode === node.id}
								aria-label="{node.name}, {formatUsd(node.value)}"
								onclick={() => toggleNode(node.id)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										toggleNode(node.id);
									}
								}}
							/>
							{#if node.kind === 'fund'}
								<text class="fund-label" x={(node.x1 - node.x0) / 2} y={-6} text-anchor="middle"
									>{node.name}</text
								>
							{:else}
								<text
									x={node.kind === 'revenue' ? -8 : node.x1 - node.x0 + 8}
									y={h / 2}
									dy="0.35em"
									text-anchor={node.kind === 'revenue' ? 'end' : 'start'}
								>
									{node.name}
									<tspan class="amount">{formatUsdCompact(node.value)}</tspan>
								</text>
							{/if}
						</g>
					{/each}
				</g>
			</g>
		</svg>
	</div>
</figure>

<details class="table-view">
	<summary>View as a table</summary>
	<div class="tables">
		<table>
			<caption>Revenue by category</caption>
			<thead><tr><th>Category</th><th class="num">Amount</th><th class="num">Share</th></tr></thead>
			<tbody>
				{#each revenueRows as n (n.id)}
					<tr>
						<td>{n.name}</td>
						<td class="num">{formatUsd(n.value)}</td>
						<td class="num">{formatShare(n.value, graph.totals.revenue)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<table>
			<caption>Spending by department</caption>
			<thead
				><tr><th>Department</th><th class="num">Amount</th><th class="num">Share</th></tr></thead
			>
			<tbody>
				{#each expenseRows as n (n.id)}
					<tr>
						<td>{n.name}</td>
						<td class="num">{formatUsd(n.value)}</td>
						<td class="num">{formatShare(n.value, graph.totals.expense)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</details>

<style>
	.flow {
		margin: 0;
	}
	.status {
		min-height: 3.2em;
		margin: 0.5rem 0;
		font-weight: 600;
	}
	.scroller {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	svg {
		display: block;
		font-size: 12px;
	}
	.links path {
		stroke-opacity: 0.35;
		cursor: pointer;
		outline: none;
	}
	.links path.active,
	.links path:focus-visible {
		stroke-opacity: 0.75;
	}
	.links path.dim {
		stroke-opacity: 0.12;
	}
	.node rect {
		cursor: pointer;
		outline: none;
	}
	.node rect:focus-visible,
	.node.selected rect {
		stroke: var(--text);
		stroke-width: 2;
	}
	text {
		fill: var(--text);
		pointer-events: none;
	}
	.amount {
		fill: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.fund-label {
		font-weight: 700;
	}
	.table-view {
		margin-top: 1.5rem;
	}
	.table-view summary {
		cursor: pointer;
		font-weight: 600;
		padding: 0.5rem 0;
	}
	.tables {
		display: grid;
		gap: 1.5rem;
	}
	caption {
		text-align: left;
		font-weight: 700;
		padding: 0.5rem 0;
	}
	@media (min-width: 56rem) {
		.tables {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>

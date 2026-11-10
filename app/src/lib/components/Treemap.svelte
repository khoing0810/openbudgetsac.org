<script lang="ts">
	import { layoutTreeLevel, type BudgetTreeNode, type TreeTile } from '#lib/viz/tree/treemap.ts';
	import { formatShare, formatUsd, formatUsdCompact } from '#lib/viz/format.ts';

	let {
		root,
		title,
		path = $bindable([])
	}: { root: BudgetTreeNode; title: string; path?: string[] } = $props();

	// Tile fills come from --tile-1..12 so light and dark themes each get a readable set.
	const TILE_COUNT = 12;

	let width = $state(0);
	const w = $derived(Math.max(280, width || 800));
	const h = $derived(Math.round(Math.min(560, Math.max(360, w * 0.6))));
	const view = $derived(layoutTreeLevel(root, path, { width: w, height: h }));

	const drill = (tile: TreeTile) => {
		if (tile.hasChildren) path = [...path, tile.name];
	};
	const goTo = (depth: number) => (path = path.slice(0, depth));

	const fits = (t: TreeTile) => t.x1 - t.x0 > 72 && t.y1 - t.y0 > 36;
	// About 7px per character at 12px; leave room for padding.
	const truncate = (name: string, tileWidth: number) => {
		const max = Math.floor((tileWidth - 12) / 7);
		return name.length > max ? `${name.slice(0, Math.max(1, max - 1))}…` : name;
	};
</script>

<nav class="crumbs" aria-label="Breakdown level">
	<ol>
		<li>
			{#if path.length}
				<button type="button" onclick={() => goTo(0)}>{root.key}</button>
			{:else}
				<span aria-current="location">{root.key}</span>
			{/if}
		</li>
		{#each path as key, i (i)}
			<li>
				{#if i < path.length - 1}
					<button type="button" onclick={() => goTo(i + 1)}>{key}</button>
				{:else}
					<span aria-current="location">{key}</span>
				{/if}
			</li>
		{/each}
	</ol>
	<p class="total">Total: <strong>{formatUsd(view.total)}</strong></p>
</nav>

<figure class="treemap" bind:clientWidth={width}>
	<figcaption class="visually-hidden">{title}</figcaption>
	<svg viewBox="0 0 {w} {h}" width="100%" role="group" aria-label={title}>
		{#each view.tiles as tile, i (tile.id)}
			{@const tw = tile.x1 - tile.x0}
			{@const th = tile.y1 - tile.y0}
			<g transform="translate({tile.x0},{tile.y0})" class="tile" class:leaf={!tile.hasChildren}>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<rect
					width={tw}
					height={th}
					style:fill="var(--tile-{(i % TILE_COUNT) + 1})"
					tabindex={tile.hasChildren ? 0 : undefined}
					role={tile.hasChildren ? 'button' : 'img'}
					aria-label="{tile.name}: {formatUsd(tile.value)}, {formatShare(
						tile.value,
						view.total
					)}{tile.hasChildren ? '. Select to see its breakdown.' : ''}"
					onclick={() => drill(tile)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							drill(tile);
						}
					}}
				>
					<title>{tile.name}: {formatUsd(tile.value)}</title>
				</rect>
				{#if fits(tile)}
					<text x="6" y="18" class="name">{truncate(tile.name, tw)}</text>
					<text x="6" y="34" class="amount">{formatUsdCompact(tile.value)}</text>
				{/if}
			</g>
		{/each}
	</svg>
</figure>

<table class="level-table">
	<caption>{path.at(-1) ?? root.key}, by amount</caption>
	<thead>
		<tr><th>Name</th><th class="num">Amount</th><th class="num">Share</th></tr>
	</thead>
	<tbody>
		{#each view.tiles as tile (tile.id)}
			<tr>
				<td>
					{#if tile.hasChildren}
						<button type="button" class="link" onclick={() => drill(tile)}>{tile.name}</button>
					{:else}
						{tile.name}
					{/if}
				</td>
				<td class="num">{formatUsd(tile.value)}</td>
				<td class="num">{formatShare(tile.value, view.total)}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.5rem;
	}
	ol {
		display: flex;
		flex-wrap: wrap;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li + li::before {
		content: '›';
		margin: 0 0.4rem;
		color: var(--text-muted);
	}
	.crumbs button,
	.link {
		background: none;
		border: 0;
		padding: 0.25rem 0;
		color: var(--link);
		text-decoration: underline;
		cursor: pointer;
		text-align: left;
	}
	.total {
		margin: 0;
	}
	.treemap {
		margin: 0.5rem 0 1.5rem;
	}
	svg {
		display: block;
		font-size: 12px;
	}
	.tile rect {
		stroke: var(--page);
		stroke-width: 1;
		cursor: pointer;
		outline: none;
	}
	.tile.leaf rect {
		cursor: default;
	}
	.tile rect:hover,
	.tile rect:focus-visible {
		stroke: var(--text);
		stroke-width: 2;
	}
	text {
		fill: var(--tile-text);
		pointer-events: none;
	}
	.name {
		font-weight: 700;
	}
	caption {
		text-align: left;
		font-weight: 700;
		padding: 0.5rem 0;
	}
</style>

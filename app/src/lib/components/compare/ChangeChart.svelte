<script lang="ts">
	import Segmented from '#lib/components/Segmented.svelte';
	import type { DiffRow } from '#lib/viz/compare/diff.ts';
	import { layoutDiverging } from '#lib/viz/compare/diverging.ts';
	import { formatPctChange, formatUsdChange } from '#lib/viz/format.ts';

	let {
		rows,
		title,
		fromLabel,
		toLabel
	}: { rows: DiffRow[]; title: string; fromLabel: string; toLabel: string } = $props();

	let measure = $state<'dollars' | 'percent'>('dollars');

	// Increases on top, decreases at the bottom, so the eye reads one direction at a time.
	const shown = $derived(
		[...rows]
			.filter((r) => measure === 'dollars' || r.pct !== null)
			.sort((a, b) => (measure === 'dollars' ? b.change - a.change : (b.pct ?? 0) - (a.pct ?? 0)))
	);
	const layout = $derived(
		layoutDiverging(shown.map((r) => (measure === 'dollars' ? r.change : (r.pct ?? 0))))
	);
	const skipped = $derived(rows.length - shown.length);
</script>

<div class="head">
	<h2 id="change-heading">{title}</h2>
	<Segmented
		legend="Show change in"
		name="measure"
		options={[
			{ value: 'dollars', label: 'Dollars' },
			{ value: 'percent', label: 'Percent' }
		]}
		bind:value={measure}
	/>
</div>
<p class="muted key">
	<span class="swatch up" aria-hidden="true"></span> More than in {fromLabel}
	<span class="swatch down" aria-hidden="true"></span> Less than in {fromLabel}
</p>

<ol class="chart" aria-labelledby="change-heading">
	{#each shown as row, i (row.name)}
		{@const bar = layout.bars[i]}
		<li class="row {bar.direction}">
			<span class="name">
				{row.name}
				{#if row.status === 'new'}<span class="tag">New in {toLabel}</span>{/if}
				{#if row.status === 'gone'}<span class="tag">Not in {toLabel}</span>{/if}
			</span>
			<span class="plot" aria-hidden="true">
				<span class="zero" style:left="{layout.zero}%"></span>
				<span class="bar" style:left="{bar.left}%" style:width="max({bar.width}%, 2px)"></span>
			</span>
			<span class="value">
				{measure === 'dollars' ? formatUsdChange(row.change) : formatPctChange(row.pct)}
			</span>
		</li>
	{/each}
</ol>
{#if skipped > 0}
	<p class="muted small">
		{skipped} item{skipped === 1 ? '' : 's'} with nothing in {fromLabel} can't show a percent change.
	</p>
{/if}

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: end;
		gap: 1rem;
	}
	h2 {
		margin: 0;
	}
	.key {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 0.6rem;
		margin: 1rem 0;
		font-size: 0.9rem;
	}
	.swatch {
		display: inline-block;
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 2px;
	}
	.swatch.down {
		margin-left: 0.8rem;
	}
	.up .bar,
	.swatch.up {
		background: var(--increase);
	}
	.down .bar,
	.swatch.down {
		background: var(--decrease);
	}
	.chart {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
	}
	.row {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas: 'name value' 'plot plot';
		gap: 0.2rem 0.75rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}
	.name {
		grid-area: name;
		font-weight: 600;
	}
	.value {
		grid-area: value;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
		text-align: right;
	}
	.up .value {
		color: var(--increase);
	}
	.down .value {
		color: var(--decrease);
	}
	.plot {
		grid-area: plot;
		position: relative;
		height: 0.85rem;
	}
	.zero {
		position: absolute;
		top: -0.25rem;
		bottom: -0.25rem;
		width: 1px;
		background: var(--border-strong);
	}
	.bar {
		position: absolute;
		top: 0;
		bottom: 0;
		border-radius: 2px;
		transition:
			left 250ms ease,
			width 250ms ease;
	}
	.tag {
		display: inline-block;
		margin-left: 0.35rem;
		padding: 0 0.45rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--surface);
		color: var(--text-muted);
		border: 1px solid var(--border);
	}
	.small {
		font-size: 0.9rem;
	}
	@media (min-width: 48rem) {
		.row {
			grid-template-columns: minmax(12rem, 18rem) 1fr 6.5rem;
			grid-template-areas: 'name plot value';
			align-items: center;
		}
	}
</style>

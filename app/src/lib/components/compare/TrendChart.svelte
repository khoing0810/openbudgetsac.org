<script lang="ts">
	import { layoutTrend, type TrendSeries } from '#lib/viz/compare/trend.ts';
	import { formatUsd, formatUsdCompact } from '#lib/viz/format.ts';

	let {
		years,
		labels,
		series,
		highlight,
		title
	}: {
		years: string[];
		/** Display label per year id. */
		labels: Record<string, string>;
		series: (TrendSeries & { color: string; dashed?: boolean })[];
		highlight: [string, string];
		title: string;
	} = $props();

	let width = $state(0);
	const w = $derived(Math.max(300, width || 800));
	const h = $derived(w < 560 ? 240 : 300);
	const layout = $derived(layoutTrend(years, series, { width: w, height: h }));
	const short = (id: string) => `’${id.slice(2)}`;
	const step = $derived(w < 560 ? 3 : 1);
	const isOn = (y: string) => highlight.includes(y);
</script>

<figure class="trend" bind:clientWidth={width}>
	<figcaption class="visually-hidden">{title}</figcaption>
	<ul class="legend">
		{#each series as s (s.id)}
			<li>
				<span class="line" class:dashed={s.dashed} style:border-color={s.color}></span>
				{s.label}
			</li>
		{/each}
	</ul>
	<svg
		viewBox="0 0 {w} {h}"
		width="100%"
		role="img"
		aria-label="{title}. The table below the chart lists every value."
	>
		{#each layout.ticks as t (t.value)}
			<line class="grid" x1="56" x2={w - 12} y1={t.y} y2={t.y} />
			<text class="tick" x="48" y={t.y} dy="0.32em" text-anchor="end"
				>{formatUsdCompact(t.value)}</text
			>
		{/each}
		{#each years as y, i (y)}
			{#if isOn(y)}
				<rect class="band" x={layout.x[i] - 14} y="6" width="28" height={h - 30} rx="4" />
			{/if}
			{#if i % step === (years.length - 1) % step || isOn(y)}
				<text class="tick" class:on={isOn(y)} x={layout.x[i]} y={h - 6} text-anchor="middle"
					>{short(y)}</text
				>
			{/if}
		{/each}
		{#each layout.lines as l, i (l.id)}
			<path
				d={l.path}
				fill="none"
				style:stroke={series[i].color}
				stroke-width="2.5"
				stroke-linejoin="round"
				stroke-dasharray={series[i].dashed ? '5 4' : undefined}
			/>
			{#each l.points as p (p.year)}
				{#if isOn(p.year)}
					<circle cx={p.x} cy={p.y} r="5" style:fill={series[i].color} class="dot" />
				{/if}
			{/each}
		{/each}
	</svg>
</figure>

<details class="table-view">
	<summary>View as a table</summary>
	<div class="scroll">
		<table>
			<caption class="visually-hidden">{title}</caption>
			<thead>
				<tr>
					<th scope="col">Year</th>
					{#each series as s (s.id)}<th scope="col" class="num">{s.label}</th>{/each}
				</tr>
			</thead>
			<tbody>
				{#each years as y, i (y)}
					<tr>
						<th scope="row">{labels[y]}</th>
						{#each series as s (s.id)}
							{@const v = s.values[i]}
							<td class="num">{v === null ? 'Not published' : formatUsd(v)}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</details>

<style>
	.trend {
		margin: 0;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.25rem;
		list-style: none;
		margin: 0 0 0.5rem;
		padding: 0;
		font-size: 0.9rem;
	}
	.line {
		display: inline-block;
		width: 1.4rem;
		margin-right: 0.35rem;
		vertical-align: middle;
		border-top: 3px solid;
	}
	.line.dashed {
		border-top-style: dashed;
	}
	svg {
		display: block;
		overflow: visible;
	}
	.grid {
		stroke: var(--border);
	}
	.tick {
		font-size: 12px;
		fill: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
	.tick.on {
		fill: var(--text-strong);
		font-weight: 700;
	}
	.band {
		fill: var(--primary-soft);
	}
	.dot {
		stroke: var(--page);
		stroke-width: 2;
	}
	.table-view {
		margin-top: 0.75rem;
	}
	.table-view summary {
		font-weight: 600;
		padding: 0.5rem 0;
	}
	.scroll {
		overflow-x: auto;
	}
</style>

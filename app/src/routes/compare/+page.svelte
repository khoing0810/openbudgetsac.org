<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import ChangeChart from '#lib/components/compare/ChangeChart.svelte';
	import DiffTable from '#lib/components/compare/DiffTable.svelte';
	import TrendChart from '#lib/components/compare/TrendChart.svelte';
	import { budgetYears } from '#lib/config/years.ts';
	import type { CompareDimension, CompareSide } from '#lib/viz/compare/data.ts';
	import { diffSeries, pctChange } from '#lib/viz/compare/diff.ts';
	import { formatPctChange, formatUsdChange, formatUsdCompact } from '#lib/viz/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.compare);

	const labels: Record<string, string> = Object.fromEntries(
		budgetYears.map((y) => [y.id, y.label])
	);
	const newest = budgetYears[0].id;
	const previous = budgetYears[1]?.id ?? newest;

	let from = $state(previous);
	let to = $state(newest);
	let side = $state<CompareSide>('spending');
	let by = $state<CompareDimension>('department');

	// The choice lives in the URL so a comparison can be shared. Prerendered
	// pages can't read the query string at build time, so read it once mounted.
	let ready = $state(false);
	onMount(() => {
		const q = new URL(location.href).searchParams;
		const valid = (y: string | null) => (y && labels[y] ? y : null);
		from = valid(q.get('from')) ?? from;
		to = valid(q.get('to')) ?? to;
		if (q.get('side') === 'revenue') side = 'revenue';
		if (q.get('by') === 'category') by = 'category';
		ready = true;
	});
	$effect(() => {
		const q = new URLSearchParams({ from, to, side, by });
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- the path is resolve()d; only a query string is appended
		if (ready) replaceState(`${resolve('/compare')}/?${q}`, {});
	});

	const sideLabel = $derived(side === 'spending' ? 'Spending' : 'Revenue');
	const nameLabel = $derived(
		by === 'department' ? 'Department' : side === 'spending' ? 'Expense category' : 'Revenue source'
	);
	const rows = $derived(diffSeries(c.series[side][by], from, to));
	const fromTotal = $derived(c.totals[side][from] ?? 0);
	const toTotal = $derived(c.totals[side][to] ?? 0);
	const change = $derived(toTotal - fromTotal);
	const pct = $derived(pctChange(fromTotal, toTotal));
	const gfFrom = $derived(c.generalFund[from]);
	const gfTo = $derived(c.generalFund[to]);

	const ups = $derived(rows.filter((r) => r.change > 0).sort((a, b) => b.change - a.change));
	const downs = $derived(rows.filter((r) => r.change < 0).sort((a, b) => a.change - b.change));
	const verb = $derived(change > 0 ? 'grew' : change < 0 ? 'fell' : 'held steady');

	const trendSeries = $derived([
		{
			id: 'spending',
			label: 'Spending',
			color: 'var(--expense-fill)',
			values: c.years.map((y) => c.totals.spending[y] ?? null)
		},
		{
			id: 'revenue',
			label: 'Revenue',
			color: 'var(--revenue-fill)',
			values: c.years.map((y) => c.totals.revenue[y] ?? null)
		},
		{
			id: 'gf',
			label: 'General Fund spending',
			color: 'var(--fund)',
			dashed: true,
			values: c.years.map((y) => c.generalFund[y])
		}
	]);

	const swap = () => ([from, to] = [to, from]);
</script>

<PageMeta
	title="Compare budgets"
	description="See how Sacramento's spending and revenue changed between any two budget years."
/>

<div class="container">
	<header class="intro">
		<p class="eyebrow">Compare budgets</p>
		<h1>How Sacramento's budget changed</h1>
		<p class="lead prose">
			Pick any two years to see what grew, what shrank, and by how much. Amounts are as adopted, in
			dollars of the day, not adjusted for inflation.
		</p>
	</header>

	<section class="controls" aria-label="Choose what to compare">
		<div class="years">
			<div class="field">
				<label for="from-year">From</label>
				<select id="from-year" bind:value={from}>
					{#each budgetYears as y (y.id)}<option value={y.id}>{y.label}</option>{/each}
				</select>
			</div>
			<button type="button" class="swap" onclick={swap}>
				<span aria-hidden="true">⇄</span><span class="visually-hidden">Swap years</span>
			</button>
			<div class="field">
				<label for="to-year">To</label>
				<select id="to-year" bind:value={to}>
					{#each budgetYears as y (y.id)}<option value={y.id}>{y.label}</option>{/each}
				</select>
			</div>
		</div>
		<Segmented
			legend="Compare"
			name="side"
			options={[
				{ value: 'spending', label: 'Spending' },
				{ value: 'revenue', label: 'Revenue' }
			]}
			bind:value={side}
		/>
		<Segmented
			legend="Group by"
			name="by"
			options={[
				{ value: 'department', label: 'Department' },
				{ value: 'category', label: side === 'spending' ? 'Expense type' : 'Source' }
			]}
			bind:value={by}
		/>
	</section>

	<section class="summary" aria-live="polite">
		<p class="headline">
			{sideLabel}
			{verb}
			{#if change !== 0}
				by <strong class:up={change > 0} class:down={change < 0}
					>{formatUsdChange(change).replace(/^[+−]/, '')}</strong
				>
				({formatPctChange(pct).replace(/^\+/, '')}),
			{/if}
			from <strong>{formatUsdCompact(fromTotal)}</strong> in {labels[from]} to
			<strong>{formatUsdCompact(toTotal)}</strong> in {labels[to]}.
		</p>
		<dl class="stats">
			<div class="stat">
				<dt>{labels[from]}</dt>
				<dd class="value">{formatUsdCompact(fromTotal)}</dd>
			</div>
			<div class="stat">
				<dt>{labels[to]}</dt>
				<dd class="value">{formatUsdCompact(toTotal)}</dd>
			</div>
			<div class="stat">
				<dt>Change</dt>
				<dd class="value" class:up={change > 0} class:down={change < 0}>
					{formatUsdChange(change)}
				</dd>
				<dd class="note">{formatPctChange(pct)}</dd>
			</div>
			{#if side === 'spending'}
				<div class="stat">
					<dt>General Fund</dt>
					{#if gfFrom !== null && gfTo !== null}
						<dd class="value">{formatUsdChange(gfTo - gfFrom)}</dd>
						<dd class="note">
							{formatUsdCompact(gfFrom)} → {formatUsdCompact(gfTo)}
						</dd>
					{:else}
						<dd class="value na">Not published</dd>
						<dd class="note">The City didn't report it for one of these years.</dd>
					{/if}
				</div>
			{/if}
		</dl>
		{#if ups[0] || downs[0]}
			<ul class="movers">
				{#if ups[0]}
					<li>
						<span class="label">Biggest increase</span>
						<strong>{ups[0].name}</strong>
						<span class="up">{formatUsdChange(ups[0].change)}</span>
					</li>
				{/if}
				{#if downs[0]}
					<li>
						<span class="label">Biggest decrease</span>
						<strong>{downs[0].name}</strong>
						<span class="down">{formatUsdChange(downs[0].change)}</span>
					</li>
				{/if}
			</ul>
		{/if}
	</section>

	<section class="panel">
		<ChangeChart
			{rows}
			fromLabel={labels[from]}
			toLabel={labels[to]}
			title="What changed, by {nameLabel.toLowerCase()}"
		/>
	</section>

	<section class="panel" aria-labelledby="trend-heading">
		<h2 id="trend-heading">The bigger picture</h2>
		<p class="muted">
			Every adopted budget since {labels[c.years[0]]}, with the two years you picked highlighted.
		</p>
		<TrendChart
			years={c.years}
			{labels}
			series={trendSeries}
			highlight={[from, to]}
			title="Total spending, revenue and General Fund spending by year"
		/>
	</section>

	<section class="panel" aria-labelledby="table-heading">
		<h2 id="table-heading">Every line, side by side</h2>
		<DiffTable
			{rows}
			{nameLabel}
			fromLabel={labels[from]}
			toLabel={labels[to]}
			caption="{sideLabel} by {nameLabel.toLowerCase()}, {labels[from]} and {labels[to]}"
		/>
	</section>

	<p class="muted notes">
		Departments that were renamed are shown under their current name (for example, Parks and
		Recreation became Youth, Parks, and Community Enrichment in FY 2018–19). For one year in detail,
		see the
		<a href={resolve('/budget/[year]/flow', { year: to })}>{labels[to]} cash flow</a>. Data:
		<a href="https://data.cityofsacramento.org">City of Sacramento Open Data</a>.
	</p>
</div>

<style>
	.intro h1 {
		margin-top: 0;
	}
	.intro {
		padding-top: 2.5rem;
	}
	.controls {
		position: sticky;
		top: 4rem;
		z-index: 4;
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 1rem 2rem;
		margin: 1.5rem 0 2rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--raised) 92%, transparent);
		backdrop-filter: blur(8px);
		box-shadow: var(--shadow);
	}
	.years {
		display: flex;
		align-items: end;
		gap: 0.5rem;
	}
	.field {
		display: grid;
		gap: 0.35rem;
	}
	.field label {
		font-weight: 600;
	}
	.swap {
		min-width: 2.75rem;
		min-height: 2.75rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--raised);
		font-size: 1.1rem;
		cursor: pointer;
	}
	.headline {
		max-width: 52rem;
		font-size: clamp(1.25rem, 2.6vw, 1.75rem);
		line-height: 1.35;
		letter-spacing: -0.01em;
		color: var(--text-strong);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
		gap: 1px;
		margin: 1.5rem 0;
		background: var(--border);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}
	.stat {
		padding: 1rem 1.25rem;
		background: var(--raised);
	}
	dt {
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	dd {
		margin: 0;
	}
	.value {
		margin-top: 0.3rem;
		font-size: clamp(1.5rem, 3vw, 2rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		color: var(--text-strong);
		font-variant-numeric: tabular-nums;
	}
	.value.na {
		font-size: 1.25rem;
		color: var(--text-muted);
	}
	.note {
		font-size: 0.9rem;
		color: var(--text-muted);
	}
	.up,
	.value.up {
		color: var(--increase);
	}
	.down,
	.value.down {
		color: var(--decrease);
	}
	.movers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: 1rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.movers li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.25rem 0.6rem;
		padding: 0.75rem 1rem;
		border-left: 4px solid var(--border-strong);
		background: var(--surface);
	}
	.movers .label {
		width: 100%;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.panel {
		margin-top: 3.5rem;
	}
	.panel > h2 {
		margin-top: 0;
	}
	.notes {
		margin-top: 3rem;
		font-size: 0.95rem;
	}
	@media (max-width: 40rem) {
		.controls {
			position: static;
		}
	}
</style>

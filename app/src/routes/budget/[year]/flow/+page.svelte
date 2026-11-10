<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import FlowChart from '#lib/components/FlowChart.svelte';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import SourcesUses from '#lib/components/SourcesUses.svelte';
	import YearPicker from '#lib/components/YearPicker.svelte';
	import { pctChange } from '#lib/viz/compare/diff.ts';
	import { formatPctChange, formatShare, formatUsdCompact } from '#lib/viz/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const title = $derived(`Cash Flow: ${data.year.label} Budget`);
	const s = $derived(data.summary);
	const topSource = $derived(data.sourcesUses.sources[0]);
	const topDept = $derived(s.departments[0]);
	const spendChange = $derived(
		data.previousTotals ? pctChange(data.previousTotals.expense, s.expense) : null
	);

	type View = 'flow' | 'bars';
	let view = $state<View>('flow');
	let ready = $state(false);

	// Phones start on the ranked bars, which read without sideways scrolling.
	// A ?view= in the URL wins, so a link opens the view it was shared from.
	onMount(() => {
		const q = new URL(location.href).searchParams.get('view');
		view =
			q === 'flow' || q === 'bars'
				? q
				: matchMedia('(max-width: 47.99rem)').matches
					? 'bars'
					: 'flow';
		ready = true;
	});
	$effect(() => {
		const href = `${resolve('/budget/[year]/flow', { year: data.year.id })}/?view=${view}`;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- the path is resolve()d; only a query string is appended
		if (ready) replaceState(href, {});
	});
</script>

<PageMeta
	{title}
	description="How money flows through Sacramento's budget, from revenue sources to city departments."
/>

<div class="container">
	<header class="page-intro">
		<p class="eyebrow">Cash flow · {data.year.label}</p>
		<h1>Where Sacramento's money comes from, and where it goes</h1>
	</header>

	<div class="controls">
		<YearPicker current={data.year.id} view="flow" />
		<Segmented
			legend="View"
			name="view"
			options={[
				{ value: 'flow', label: 'Flow diagram' },
				{ value: 'bars', label: 'Sources and uses' }
			]}
			bind:value={view}
		/>
	</div>

	<p class="headline">
		In {data.year.label}, the City planned to take in <strong>{formatUsdCompact(s.revenue)}</strong>
		and spend <strong>{formatUsdCompact(s.expense)}</strong>.
		{#if topSource}
			The largest source, {topSource.name}, brings in {formatShare(topSource.total, s.revenue)}
			of revenue,
		{/if}
		and the General Fund pays for {formatShare(s.generalFund, s.expense)} of spending.
	</p>

	<dl class="stat-grid">
		<div>
			<dt>Revenue</dt>
			<dd class="stat-value">{formatUsdCompact(s.revenue)}</dd>
			{#if data.previousTotals}
				<dd class="stat-note">
					{formatPctChange(pctChange(data.previousTotals.revenue, s.revenue))} vs {data.previousYear
						?.label}
				</dd>
			{/if}
		</div>
		<div>
			<dt>Spending</dt>
			<dd class="stat-value">{formatUsdCompact(s.expense)}</dd>
			{#if spendChange !== null}
				<dd class="stat-note">{formatPctChange(spendChange)} vs {data.previousYear?.label}</dd>
			{/if}
		</div>
		<div>
			<dt>General Fund</dt>
			<dd class="stat-value">{formatUsdCompact(s.generalFund)}</dd>
			<dd class="stat-note">{formatShare(s.generalFund, s.expense)} of spending</dd>
		</div>
		{#if topDept}
			<div>
				<dt>Largest department</dt>
				<dd class="stat-value">{topDept.name}</dd>
				<dd class="stat-note">{formatUsdCompact(topDept.value)}</dd>
			</div>
		{/if}
	</dl>

	{#if data.previousYear}
		<p>
			<a class="arrow" href="{resolve('/compare')}/?from={data.previousYear.id}&to={data.year.id}"
				>See what changed since {data.previousYear.label}</a
			>
		</p>
	{/if}

	<section class="view" aria-label={view === 'flow' ? 'Flow diagram' : 'Sources and uses'}>
		{#if view === 'flow'}
			<p class="muted prose">
				Revenue sources on the left flow into the General Fund or the non-discretionary funds in the
				middle, then out to departments on the right. Wider bands carry more money.
			</p>
			<FlowChart graph={data.graph} {title} />
		{:else}
			<SourcesUses
				sources={data.sourcesUses.sources}
				uses={data.sourcesUses.uses}
				previousLabel={data.previousYear?.label ?? null}
			/>
		{/if}
	</section>

	<p class="muted notes">
		See every fund and account in the
		<a href={resolve('/budget/[year]/tree', { year: data.year.id })}>detailed breakdown</a>. Data
		source:
		<a href="https://data.cityofsacramento.org">City of Sacramento Open Data</a>.
	</p>
</div>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 1rem 2rem;
		margin: 1.5rem 0;
	}
	.view {
		margin-top: 2.5rem;
	}
	.notes {
		margin-top: 2.5rem;
	}
</style>

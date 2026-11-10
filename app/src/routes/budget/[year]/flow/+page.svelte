<script lang="ts">
	import { resolve } from '$app/paths';
	import FlowChart from '#lib/components/FlowChart.svelte';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import YearPicker from '#lib/components/YearPicker.svelte';
	import { formatUsd } from '#lib/viz/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const title = $derived(`Cash Flow: ${data.year.label} Budget`);
</script>

<PageMeta
	{title}
	description="How money flows through Sacramento's budget, from revenue sources to city departments."
/>

<div class="container">
	<h1>{title}</h1>
	<div class="prose">
		<p>
			This diagram shows how money flows through Sacramento's budget: from revenue sources on the
			left, through the General Fund or the non-discretionary funds in the middle, to city
			departments on the right.
		</p>
	</div>
	<div class="controls">
		<YearPicker current={data.year.id} view="flow" />
		<p class="totals">
			Revenue <strong>{formatUsd(data.graph.totals.revenue)}</strong> · Spending
			<strong>{formatUsd(data.graph.totals.expense)}</strong>
		</p>
	</div>

	<FlowChart graph={data.graph} {title} />

	<p class="muted">
		See where each dollar goes in more detail in the
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
		justify-content: space-between;
		gap: 1rem;
		margin: 1rem 0;
	}
	.totals {
		margin: 0;
	}
</style>

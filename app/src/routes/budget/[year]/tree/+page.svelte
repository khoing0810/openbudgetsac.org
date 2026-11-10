<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import Treemap from '#lib/components/Treemap.svelte';
	import YearPicker from '#lib/components/YearPicker.svelte';
	import { dataPaths, treeAccounts, type TreeAccount } from '#lib/config/years.ts';
	import type { BudgetTreeNode } from '#lib/viz/tree/treemap.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let account = $state<TreeAccount>('Expense');
	let path = $state<string[]>([]);
	let root = $state<BudgetTreeNode | null>(null);
	let failed = $state(false);

	const title = $derived(`Detailed Breakdown: ${data.year.label} Budget`);

	$effect(() => {
		// Tree files are synced into static/ at build time, so the typed asset list cannot see every year.
		const url = asset(dataPaths.tree(data.year.id, account) as Parameters<typeof asset>[0]);
		const controller = new AbortController();
		root = null;
		failed = false;
		path = [];
		fetch(url, { signal: controller.signal })
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<BudgetTreeNode>;
			})
			.then((json) => (root = json))
			.catch((err: unknown) => {
				if ((err as Error).name !== 'AbortError') failed = true;
			});
		return () => controller.abort();
	});
</script>

<PageMeta
	{title}
	description="Sacramento's approved budget broken down by fund, department and category."
/>

<div class="container">
	<h1>{title}</h1>
	<div class="prose">
		<p>
			Each box is sized by its share of the budget. Select a box, or a name in the table, to see
			what it is made of. Use the trail above the chart to go back up.
		</p>
	</div>

	<div class="controls">
		<YearPicker current={data.year.id} view="tree" />
		<fieldset>
			<legend>Show</legend>
			{#each treeAccounts as option (option)}
				<label>
					<input type="radio" name="account" value={option} bind:group={account} />
					{option === 'Expense' ? 'Spending' : 'Revenue'}
				</label>
			{/each}
		</fieldset>
	</div>

	{#if failed}
		<p role="alert">The budget data couldn't be loaded. Please try again later.</p>
	{:else if root}
		<Treemap {root} bind:path title="{title}, {account === 'Expense' ? 'spending' : 'revenue'}" />
	{:else}
		<p aria-live="polite" class="muted">Loading budget data…</p>
	{/if}

	<p class="muted">
		Compare with the <a href={resolve('/budget/[year]/flow', { year: data.year.id })}>cash flow</a>
		for the same year. Data source:
		<a href="https://data.cityofsacramento.org">City of Sacramento Open Data</a>.
	</p>
</div>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 1.5rem;
		margin: 1rem 0;
	}
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	legend {
		font-weight: 600;
		float: left;
		margin-right: 0.5rem;
	}
	label {
		display: inline-flex;
		gap: 0.35rem;
		align-items: center;
		min-height: 2.5rem;
	}
</style>

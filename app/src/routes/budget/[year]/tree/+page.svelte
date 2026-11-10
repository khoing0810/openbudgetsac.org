<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { asset, resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import Treemap from '#lib/components/Treemap.svelte';
	import TreeSearch from '#lib/components/TreeSearch.svelte';
	import YearPicker from '#lib/components/YearPicker.svelte';
	import { dataPaths, type TreeAccount } from '#lib/config/years.ts';
	import { formatShare, formatUsdCompact } from '#lib/viz/format.ts';
	import { swapTopLevels } from '#lib/viz/tree/regroup.ts';
	import { indexTree, type TreeEntry } from '#lib/viz/tree/search.ts';
	import { findByPath, type BudgetTreeNode } from '#lib/viz/tree/treemap.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Group = 'inner' | 'fund';
	let account = $state<TreeAccount>('Expense');
	let group = $state<Group>('inner');
	let path = $state<string[]>([]);
	let raw = $state<BudgetTreeNode | null>(null);
	let failed = $state(false);
	let ready = $state(false);

	const spending = $derived(account === 'Expense');
	const innerLabel = $derived(spending ? 'department' : 'source');
	const rootKey = $derived(spending ? 'All spending' : 'All revenue');
	const title = $derived(`Detailed Breakdown: ${data.year.label} Budget`);

	// The files go fund → department (or source) → …; residents usually look
	// for a department first, so that grouping is the default.
	const root = $derived(
		raw ? (group === 'inner' ? swapTopLevels(raw, rootKey) : { ...raw, key: rootKey }) : null
	);
	const index = $derived(root ? indexTree(root) : []);
	const byInner = $derived(raw ? swapTopLevels(raw) : null);
	const total = $derived(raw ? (raw.values ?? []).reduce((t, c) => t + c.data.amount, 0) : 0);
	const largest = $derived(
		byInner?.values ? [...byInner.values].sort((a, b) => b.data.amount - a.data.amount)[0] : null
	);
	const focus = $derived(root && path.length ? findByPath(root, path) : null);

	onMount(() => {
		const q = new URL(location.href).searchParams;
		if (q.get('account') === 'revenue') account = 'Revenue';
		if (q.get('by') === 'fund') group = 'fund';
		path = q.getAll('p');
		ready = true;
	});

	// Load the year's file for the chosen account.
	$effect(() => {
		// Tree files are synced into static/ at build time, so the typed asset list cannot see every year.
		const url = asset(dataPaths.tree(data.year.id, account) as Parameters<typeof asset>[0]);
		const controller = new AbortController();
		raw = null;
		failed = false;
		fetch(url, { signal: controller.signal })
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<BudgetTreeNode>;
			})
			.then((json) => (raw = json))
			.catch((err: unknown) => {
				if ((err as Error).name !== 'AbortError') failed = true;
			});
		return () => controller.abort();
	});

	// Changing what is shown starts again at the top.
	let lastView = '';
	$effect(() => {
		const key = `${account}|${group}`;
		if (lastView && key !== lastView) untrack(() => (path = []));
		if (ready) lastView = key;
	});

	// A path that doesn't exist in this view (say, from an old link) falls back to the top.
	$effect(() => {
		if (root && path.length && !findByPath(root, path)) untrack(() => (path = []));
	});

	// Keep the view in the URL so it can be shared.
	$effect(() => {
		const q = new URLSearchParams([
			...(spending ? [] : [['account', 'revenue']]),
			...(group === 'fund' ? [['by', 'fund']] : []),
			...path.map((key) => ['p', key])
		]);
		const href = `${resolve('/budget/[year]/tree', { year: data.year.id })}/${q.size ? `?${q}` : ''}`;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- the path is resolve()d; only a query string is appended
		if (ready) replaceState(href, {});
	});

	const pick = (e: TreeEntry) => (path = e.branch ? e.path : e.path.slice(0, -1));
</script>

<PageMeta
	{title}
	description="Sacramento's approved budget broken down by department, fund and account."
/>

<div class="container">
	<header class="page-intro">
		<p class="eyebrow">Detailed breakdown · {data.year.label}</p>
		<h1>Every fund, department and account</h1>
	</header>

	<div class="controls">
		<YearPicker current={data.year.id} view="tree" />
		<Segmented
			legend="Show"
			name="account"
			options={[
				{ value: 'Expense', label: 'Spending' },
				{ value: 'Revenue', label: 'Revenue' }
			]}
			bind:value={account}
		/>
		<Segmented
			legend="Group by"
			name="group"
			options={[
				{ value: 'inner', label: spending ? 'Department' : 'Source' },
				{ value: 'fund', label: 'Fund' }
			]}
			bind:value={group}
		/>
	</div>

	{#if failed}
		<p role="alert">The budget data couldn't be loaded. Please try again later.</p>
	{:else if root && raw}
		<p class="headline">
			{spending ? 'Spending' : 'Revenue'} in {data.year.label} totals
			<strong>{formatUsdCompact(total)}</strong>, across {byInner?.values?.length ?? 0}
			{innerLabel === 'department' ? 'departments' : 'sources'} and {raw.values?.length ?? 0} funds.
			{#if largest}
				The largest {innerLabel} is {largest.key}, at {formatUsdCompact(largest.data.amount)} ({formatShare(
					largest.data.amount,
					total
				)}).
			{/if}
		</p>

		<TreeSearch {index} label="Find a {innerLabel}, fund or account" onpick={pick} />

		{#if focus}
			<p class="focus" aria-live="polite">
				<strong>{path.at(-1)}</strong>: {formatUsdCompact(focus.data.amount)}, {formatShare(
					focus.data.amount,
					total
				)} of all {spending ? 'spending' : 'revenue'}.
			</p>
		{/if}

		<div class="chart">
			<Treemap {root} bind:path title="{title}, {spending ? 'spending' : 'revenue'}" />
		</div>
	{:else}
		<p aria-live="polite" class="muted">Loading budget data…</p>
	{/if}

	<p class="muted notes">
		For the big picture, see the
		<a href={resolve('/budget/[year]/flow', { year: data.year.id })}>cash flow</a>
		for the same year. Data source:
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
	.focus {
		margin: 1.5rem 0 0;
		padding: 0.75rem 1rem;
		border-left: 4px solid var(--primary);
		background: var(--surface);
	}
	.chart {
		margin-top: 1.5rem;
	}
	.notes {
		margin-top: 2.5rem;
	}
</style>

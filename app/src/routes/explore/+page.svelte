<script lang="ts">
	import { onMount } from 'svelte';
	import { replaceState } from '$app/navigation';
	import { asset, resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import Segmented from '#lib/components/Segmented.svelte';
	import TrendChart from '#lib/components/compare/TrendChart.svelte';
	import RankedBars from '#lib/components/explore/RankedBars.svelte';
	import { dataPaths, dataUpdated } from '#lib/config/years.ts';
	import {
		APPROVED_BUDGETS_LAYER,
		APPROVED_BUDGETS_PAGE,
		fyId
	} from '#lib/data/approved-budgets.ts';
	import { pctChange } from '#lib/viz/compare/diff.ts';
	import {
		breakdown,
		breakdownCsv,
		dimensions,
		namesFor,
		sideTotals,
		totalsByYear,
		type ExploreData,
		type ExploreDimension,
		type ExploreSide
	} from '#lib/viz/explore/data.ts';
	import { formatPctChange, formatShare, formatUsd, formatUsdCompact } from '#lib/viz/format.ts';

	const label = (y: number) => `FY ${y - 1}–${String(y % 100).padStart(2, '0')}`;
	const dimLabel: Record<ExploreDimension, string> = {
		department: 'Department',
		fund: 'Fund',
		category: 'Category'
	};
	const allLabel: Record<ExploreDimension, string> = {
		department: 'All departments',
		fund: 'All funds',
		category: 'All categories'
	};

	let data = $state<ExploreData | null>(null);
	let failed = $state(false);
	let ready = $state(false);

	let side = $state<ExploreSide>('spending');
	let year = $state(0);
	let by = $state<ExploreDimension>('department');
	let filter = $state<Record<ExploreDimension, string | null>>({
		department: null,
		fund: null,
		category: null
	});

	onMount(() => {
		const controller = new AbortController();
		fetch(resolve('/explore/data.json'), { signal: controller.signal })
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				return res.json() as Promise<ExploreData>;
			})
			.then((json) => {
				// Read the choice from the URL so a view can be shared.
				const q = new URL(location.href).searchParams;
				const wanted = json.years.find((y) => fyId(y) === q.get('year'));
				year = wanted ?? json.years.at(-1)!;
				if (q.get('side') === 'revenue') side = 'revenue';
				const b = q.get('by');
				if (b && (dimensions as string[]).includes(b)) by = b as ExploreDimension;
				for (const d of dimensions) {
					const name = q.get(d);
					filter[d] = name && json.names[d].includes(name) ? name : null;
				}
				data = json;
				ready = true;
			})
			.catch((err: unknown) => {
				if ((err as Error).name !== 'AbortError') failed = true;
			});
		return () => controller.abort();
	});

	$effect(() => {
		if (!ready) return;
		const q = new URLSearchParams([
			['year', fyId(year)],
			...(side === 'revenue' ? [['side', 'revenue']] : []),
			['by', by],
			...dimensions.flatMap((d) => (filter[d] ? [[d, filter[d]!]] : []))
		]);
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- the path is resolve()d; only a query string is appended
		replaceState(`${resolve('/explore')}/?${q}`, {});
	});

	const filters = $derived({ side, ...filter });
	const options = $derived(
		data
			? (Object.fromEntries(dimensions.map((d) => [d, namesFor(data!, side, d)])) as Record<
					ExploreDimension,
					string[]
				>)
			: null
	);

	// Switching between spending and revenue drops filters that don't exist on the other side.
	$effect(() => {
		if (!options) return;
		for (const d of dimensions) if (filter[d] && !options[d].includes(filter[d]!)) filter[d] = null;
	});

	const yi = $derived(data ? data.years.indexOf(year) : -1);
	const totals = $derived(data ? totalsByYear(data, filters) : []);
	const sideAll = $derived(data ? sideTotals(data, side) : []);
	const current = $derived(totals[yi] ?? 0);
	const previous = $derived(yi > 0 ? (totals[yi - 1] ?? null) : null);
	const change = $derived(previous === null ? null : pctChange(previous, current));
	const prevYear = $derived(data && yi > 0 ? data.years[yi - 1] : null);
	const rows = $derived(data && year ? breakdown(data, filters, year, by) : []);
	const filtered = $derived(dimensions.some((d) => filter[d]));
	const sideWord = $derived(side === 'spending' ? 'spending' : 'revenue');
	const subject = $derived(
		dimensions
			.map((d) => filter[d])
			.filter(Boolean)
			.join(' · ')
	);

	/** After picking a row, break it down by the next thing people usually ask about. */
	const nextBy = (from: ExploreDimension): ExploreDimension => {
		const order: ExploreDimension[] =
			from === 'department'
				? ['category', 'fund']
				: from === 'fund'
					? ['department', 'category']
					: ['department', 'fund'];
		return order.find((d) => !filter[d]) ?? from;
	};
	const canPick = $derived(dimensions.some((d) => d !== by && !filter[d]));
	const pick = (name: string) => {
		filter[by] = name;
		by = nextBy(by);
	};
	const clear = () => {
		for (const d of dimensions) filter[d] = null;
	};

	const trendSeries = $derived([
		{
			id: 'selection',
			label: subject ? `${subject} (${sideWord})` : `All ${sideWord}`,
			color: side === 'spending' ? 'var(--expense-fill)' : 'var(--revenue-fill)',
			values: totals
		}
	]);
	const yearIds = $derived(data ? data.years.map(fyId) : []);
	const labels = $derived(
		data ? Object.fromEntries(data.years.map((y) => [fyId(y), label(y)])) : {}
	);

	const download = () => {
		const csv = breakdownCsv(rows, {
			name: dimLabel[by],
			year: label(year),
			previous: prevYear ? label(prevYear) : 'Previous year'
		});
		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = `sacramento-${sideWord}-${fyId(year)}-by-${by}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};
</script>

<PageMeta
	title="Explore the data"
	description="Filter every line of Sacramento's approved budgets since FY 2012–13 by department, fund and category."
/>

<div class="container">
	<header class="page-intro">
		<p class="eyebrow">Explore the data</p>
		<h1>Ask your own questions of the budget</h1>
		<p class="lead prose">
			Filter every line of the City's approved budgets by department, fund and category, for any
			year since FY 2012–13. Pick a bar to dig into it. The link in your address bar keeps your
			choices, so you can share what you find.
		</p>
	</header>

	{#if failed}
		<p role="alert">The budget data couldn't be loaded. Please try again later.</p>
	{:else if !data || !options}
		<p class="muted" aria-live="polite">Loading every year of budget data…</p>
	{:else}
		<section class="controls" aria-label="Choose what to explore">
			<div class="row">
				<div class="field">
					<label for="explore-year">Fiscal year</label>
					<select id="explore-year" bind:value={year}>
						{#each [...data.years].reverse() as y (y)}<option value={y}>{label(y)}</option>{/each}
					</select>
				</div>
				<Segmented
					legend="Show"
					name="side"
					options={[
						{ value: 'spending', label: 'Spending' },
						{ value: 'revenue', label: 'Revenue' }
					]}
					bind:value={side}
				/>
				<Segmented
					legend="Break down by"
					name="by"
					options={dimensions.map((d) => ({ value: d, label: dimLabel[d] }))}
					bind:value={by}
				/>
			</div>
			<div class="row filters">
				{#each dimensions as d (d)}
					<div class="field">
						<label for="filter-{d}">{dimLabel[d]}</label>
						<select id="filter-{d}" bind:value={filter[d]}>
							<option value={null}>{allLabel[d]}</option>
							{#each options[d] as name (name)}<option value={name}>{name}</option>{/each}
						</select>
					</div>
				{/each}
				{#if filtered}
					<button type="button" class="clear" onclick={clear}>Clear filters</button>
				{/if}
			</div>
		</section>

		<section aria-live="polite">
			<p class="headline">
				{#if subject}
					{side === 'spending' ? 'Spending' : 'Revenue'} for <strong>{subject}</strong> in {label(
						year
					)}
				{:else}
					All {sideWord} in {label(year)}
				{/if}
				comes to <strong>{formatUsdCompact(current)}</strong>{#if subject && sideAll[yi]}, {formatShare(
						current,
						sideAll[yi]
					)} of all {sideWord}{/if}.
				{#if change !== null && prevYear}
					That's {change >= 0 ? 'up' : 'down'}
					<span class:up={change > 0} class:down={change < 0}
						>{formatPctChange(Math.abs(change)).replace(/^\+/, '')}</span
					>
					from {label(prevYear)}.
				{:else if prevYear && previous === null && current > 0}
					None of it appears in {label(prevYear)}.
				{/if}
			</p>
			<dl class="stat-grid">
				<div>
					<dt>Total</dt>
					<dd class="stat-value">{formatUsdCompact(current)}</dd>
					<dd class="stat-note">{formatUsd(current)}</dd>
				</div>
				<div>
					<dt>Share of all {sideWord}</dt>
					<dd class="stat-value">{formatShare(current, sideAll[yi] || 1)}</dd>
					<dd class="stat-note">of {formatUsdCompact(sideAll[yi] ?? 0)}</dd>
				</div>
				<div>
					<dt>Change from last year</dt>
					<dd class="stat-value" class:up={(change ?? 0) > 0} class:down={(change ?? 0) < 0}>
						{change === null ? '—' : formatPctChange(change)}
					</dd>
					<dd class="stat-note">
						{prevYear ? `vs ${label(prevYear)}` : 'No earlier year published'}
					</dd>
				</div>
				<div>
					<dt>{dimLabel[by]} lines</dt>
					<dd class="stat-value">{rows.length}</dd>
					<dd class="stat-note">with money this year</dd>
				</div>
			</dl>
		</section>

		<section class="panel" aria-labelledby="breakdown-heading">
			<h2 id="breakdown-heading">By {dimLabel[by].toLowerCase()}, {label(year)}</h2>
			{#if rows.length}
				<RankedBars
					{rows}
					total={current}
					color={side === 'spending' ? 'var(--expense-fill)' : 'var(--revenue-fill)'}
					previousLabel={prevYear ? label(prevYear) : null}
					pickLabel={canPick
						? (name) =>
								`Filter to ${name} and break it down by ${dimLabel[nextBy(by)].toLowerCase()}`
						: null}
					onpick={pick}
					labelledby="breakdown-heading"
				/>
			{:else}
				<p class="muted">Nothing matches these filters in {label(year)}. Try another year.</p>
			{/if}
		</section>

		<section class="panel" aria-labelledby="trend-heading">
			<h2 id="trend-heading">Every year</h2>
			<p class="muted">The same selection in every budget since {label(data.years[0])}.</p>
			<TrendChart
				years={yearIds}
				{labels}
				series={trendSeries}
				highlight={[fyId(year), fyId(year)]}
				title="{trendSeries[0].label} by year"
			/>
		</section>

		<section class="panel" aria-labelledby="table-heading">
			<div class="table-head">
				<h2 id="table-heading">Every line</h2>
				<button type="button" class="download" onclick={download}>Download this table (CSV)</button>
			</div>
			<!-- Wide tables scroll sideways on phones, so the region takes focus for keyboard users. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div class="scroll" role="region" aria-labelledby="table-heading" tabindex="0">
				<table>
					<caption class="visually-hidden"
						>{side === 'spending' ? 'Spending' : 'Revenue'} by {dimLabel[by].toLowerCase()}, {label(
							year
						)}{subject ? `, for ${subject}` : ''}</caption
					>
					<thead>
						<tr>
							<th scope="col">{dimLabel[by]}</th>
							<th scope="col" class="num">{label(year)}</th>
							<th scope="col" class="num">Share</th>
							{#if prevYear}
								<th scope="col" class="num">{label(prevYear)}</th>
								<th scope="col" class="num">Change</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each rows as r (r.name)}
							{@const pct = r.previous === null ? null : pctChange(r.previous, r.amount)}
							<tr>
								<th scope="row">{r.name}</th>
								<td class="num">{formatUsd(r.amount)}</td>
								<td class="num">{formatShare(r.amount, current || 1)}</td>
								{#if prevYear}
									<td class="num">{r.previous === null ? '—' : formatUsd(r.previous)}</td>
									<td class="num" class:up={(pct ?? 0) > 0} class:down={(pct ?? 0) < 0}
										>{pct === null ? 'New' : formatPctChange(pct)}</td
									>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/if}

	<section class="panel about" aria-labelledby="about-heading">
		<h2 id="about-heading">About this data</h2>
		<p class="prose">
			Every figure comes from the City of Sacramento's
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external site -->
			<a href={APPROVED_BUDGETS_PAGE}>Approved Budgets dataset</a>{#if dataUpdated}, which the City
				last updated on {new Date(`${dataUpdated}T12:00:00Z`).toLocaleDateString('en-US', {
					dateStyle: 'long'
				})}{/if}. Amounts are as adopted, in dollars of the day. Departments and categories that
			were renamed are shown under their current names. For FY 2014–15 to FY 2017–18, totals can
			differ slightly from the cash flow pages, which use the budget office's more detailed export.
		</p>
		<ul class="links">
			<li>
				<a href={asset(dataPaths.approvedBudgets as Parameters<typeof asset>[0])} download
					>Download the whole table (CSV, every year)</a
				>
			</li>
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external site -->
				<a href="{APPROVED_BUDGETS_LAYER}/query?where=1%3D1&outFields=*&f=html"
					>Query it live with the City's API</a
				>
			</li>
		</ul>
	</section>
</div>

<style>
	.controls {
		position: sticky;
		top: 4rem;
		z-index: 4;
		display: grid;
		gap: 1rem;
		margin: 1.5rem 0 2rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: color-mix(in srgb, var(--raised) 92%, transparent);
		backdrop-filter: blur(8px);
		box-shadow: var(--shadow);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: end;
		gap: 1rem 2rem;
	}
	.filters {
		gap: 1rem;
	}
	.field {
		display: grid;
		gap: 0.35rem;
		min-width: 0;
	}
	.filters .field {
		flex: 1 1 14rem;
	}
	.field label {
		font-weight: 600;
	}
	.field select {
		width: 100%;
		max-width: 100%;
	}
	.clear,
	.download {
		min-height: 2.75rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--text-strong);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	.panel {
		margin-top: 3.5rem;
	}
	.panel > h2 {
		margin-top: 0;
	}
	.table-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.5rem;
	}
	.table-head h2 {
		margin: 0;
	}
	.scroll {
		overflow-x: auto;
	}
	tbody th {
		font-weight: 600;
		color: var(--text);
		font-size: 1rem;
	}
	td {
		white-space: nowrap;
	}
	.about .links {
		display: grid;
		gap: 0.5rem;
		padding-left: 1.25rem;
	}
	@media (max-width: 40rem) {
		.controls {
			position: static;
		}
	}
</style>

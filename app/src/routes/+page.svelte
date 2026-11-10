<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { formatShare, formatUsdCompact } from '#lib/viz/format.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const flowHref = $derived(resolve('/budget/[year]/flow', { year: data.year.id }));
	const treeHref = $derived(resolve('/budget/[year]/tree', { year: data.year.id }));
	const s = $derived(data.summary);
	const top = $derived(s.departments[0]);
	const maxDept = $derived(top?.value ?? 1);

	const tools = $derived([
		{
			title: 'Cash flow',
			body: 'Where money comes from, which funds it passes through, and which departments spend it.',
			href: flowHref,
			external: false,
			image: asset('images/home/2020-flow-thumb.png'),
			alt: 'A flow chart of where Sacramento’s money comes from and where it goes.'
		},
		{
			title: 'Detailed breakdown',
			body: 'Drill into spending and revenue for each fund, department and account.',
			href: treeHref,
			external: false,
			image: asset('images/home/tree-thumb.png'),
			alt: 'A drill-down view of Sacramento city spending and revenue.'
		},
		{
			title: 'Compare years',
			body: 'Put two budgets head to head to see what grew and what shrank.',
			href: 'https://openbudgetsac.org/compare/',
			external: true,
			image: asset('images/home/compare-thumb.jpg'),
			alt: 'The comparison tool, comparing two Sacramento city budgets.'
		},
		{
			title: 'Custom queries (FY 2018)',
			body: "Explore the details of the City of Sacramento's adopted 2018 budget.",
			href: 'https://explorer.openbudgetsac.org/',
			external: true,
			image: asset('images/home/explorer.png'),
			alt: 'The explorer used to query the 2018 budget data.'
		}
	]);
</script>

<PageMeta
	title="Home"
	description="Sacramento's city budget, turned into visualizations anyone can explore."
/>

<section class="hero">
	<div class="container">
		<p class="eyebrow">City of Sacramento · {data.year.label} adopted budget</p>
		<h1>Sacramento deserves to know what is in the budget and how it is made.</h1>
		<p class="lead">
			Open Budget: Sacramento turns the City's published budget data into visualizations anyone can
			explore, so residents can examine their city's budget for themselves.
		</p>
		<p class="actions">
			<a class="button" href={flowHref}
				>Explore the {data.year.label} budget <span aria-hidden="true">→</span></a
			>
			<a class="button outline" href={resolve('/budget')}>All budget years</a>
		</p>
	</div>
</section>

<section class="container glance" aria-labelledby="glance-heading">
	<h2 id="glance-heading" class="visually-hidden">{data.year.label} at a glance</h2>
	<dl class="stats">
		<div class="stat">
			<dt>Total spending</dt>
			<dd class="value">{formatUsdCompact(s.expense)}</dd>
			{#if data.change !== null}
				<dd class="note">
					<span class={data.change >= 0 ? 'up' : 'down'} aria-hidden="true"
						>{data.change >= 0 ? '▲' : '▼'}</span
					>
					{Math.abs(data.change).toFixed(1)}% {data.change >= 0 ? 'more' : 'less'} than {data.previousLabel}
				</dd>
			{/if}
		</div>
		<div class="stat">
			<dt>Total revenue</dt>
			<dd class="value">{formatUsdCompact(s.revenue)}</dd>
			<dd class="note">From taxes, fees, grants and other sources</dd>
		</div>
		<div class="stat">
			<dt>General Fund spending</dt>
			<dd class="value">{formatUsdCompact(s.generalFund)}</dd>
			<dd class="note">
				{formatShare(s.generalFund, s.expense)} of spending, set by the City Council
			</dd>
		</div>
		{#if top}
			<div class="stat">
				<dt>Largest department</dt>
				<dd class="value">{top.name}</dd>
				<dd class="note">
					{formatUsdCompact(top.value)}, {formatShare(top.value, s.expense)} of spending
				</dd>
			</div>
		{/if}
	</dl>
</section>

<section class="container split" aria-labelledby="depts-heading">
	<div>
		<p class="eyebrow">Where the money goes</p>
		<h2 id="depts-heading">Biggest departments in {data.year.label}</h2>
		<p class="muted">
			Spending from all funds. Follow each dollar from its source in the
			<a class="arrow" href={flowHref}>cash flow chart</a>
		</p>
	</div>
	<ol class="bars">
		{#each s.departments as d (d.name)}
			<li>
				<span class="bar-label">{d.name}</span>
				<span class="bar-value">{formatUsdCompact(d.value)}</span>
				<span class="bar-track" aria-hidden="true"
					><span class="bar-fill" style:width="{(d.value / maxDept) * 100}%"></span></span
				>
			</li>
		{/each}
	</ol>
</section>

<section class="container tools" aria-labelledby="tools-heading">
	<p class="eyebrow">Tools</p>
	<h2 id="tools-heading">Ways to explore the budget</h2>
	<ul class="card-grid">
		{#each tools as tool, i (tool.title)}
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- internal hrefs are resolved above; others are external -->
				<a class="card" href={tool.href}>
					<img
						src={tool.image}
						alt={tool.alt}
						width="640"
						height="400"
						loading={i === 0 ? 'eager' : 'lazy'}
						decoding="async"
					/>
					<h3><span class="arrow" class:external={tool.external}>{tool.title}</span></h3>
					<p>{tool.body}</p>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.hero {
		background:
			radial-gradient(60rem 30rem at 85% -10%, rgb(255 190 46 / 0.16), transparent 60%), var(--hero);
		color: var(--on-hero);
		padding: clamp(3rem, 8vw, 6rem) 0 clamp(5rem, 10vw, 7.5rem);
	}
	.hero .eyebrow {
		color: var(--accent);
	}
	.hero h1 {
		max-width: 18ch;
		margin: 0 0 1.25rem;
		color: var(--on-hero);
		font-size: clamp(2.25rem, 6vw, 4.25rem);
		letter-spacing: -0.035em;
	}
	.hero .lead {
		max-width: 40rem;
		color: var(--on-hero-muted);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 2rem;
	}
	.hero .button {
		background: var(--accent);
		color: #1b1b1b;
	}
	.hero .button:hover {
		background: #ffd67a;
		color: #1b1b1b;
	}
	.hero .button.outline {
		background: transparent;
		color: var(--on-hero);
	}
	.hero .button.outline:hover {
		background: rgb(255 255 255 / 0.1);
	}

	.glance {
		margin-top: clamp(-4.5rem, -6vw, -3rem);
		position: relative;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 1px;
		margin: 0;
		background: var(--border);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow);
	}
	.stat {
		padding: 1.25rem 1.25rem 1.4rem;
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
		margin-top: 0.35rem;
		font-size: clamp(1.75rem, 3.5vw, 2.4rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.1;
		color: var(--text-strong);
		font-variant-numeric: tabular-nums;
	}
	.note {
		margin-top: 0.4rem;
		font-size: 0.9rem;
		color: var(--text-muted);
	}
	.up {
		color: var(--expense);
	}
	.down {
		color: var(--revenue);
	}

	.split {
		display: grid;
		gap: 1.5rem 3rem;
		margin-top: 4rem;
	}
	.split h2 {
		margin-top: 0;
	}
	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.9rem;
	}
	.bars li {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.3rem 1rem;
	}
	.bar-label {
		font-weight: 600;
	}
	.bar-value {
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}
	.bar-track {
		grid-column: 1 / -1;
		height: 0.6rem;
		border-radius: 999px;
		background: var(--surface);
		overflow: hidden;
	}
	.bar-fill {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--expense-fill);
	}
	@media (min-width: 56rem) {
		.split {
			grid-template-columns: 1fr 1.4fr;
			align-items: start;
		}
	}

	.tools {
		margin-top: 4.5rem;
	}
	.tools h2 {
		margin-top: 0;
	}
	.card img {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		object-position: top left;
		border-radius: calc(var(--radius) - 1px);
		margin-bottom: 1rem;
		background: var(--surface);
		border: 1px solid var(--border);
	}
	.card h3 {
		margin: 0 0 0.35rem;
	}
	.card p {
		margin: 0;
		color: var(--text-muted);
	}
</style>

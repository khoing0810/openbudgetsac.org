<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { latestYear } from '#lib/config/years.ts';

	const tools = [
		{
			title: 'Overview',
			body: "Get a bird's eye view of a single year: where money comes from, and where it goes.",
			href: resolve('/budget/[year]/flow', { year: latestYear.id }),
			image: asset('images/home/2020-flow-thumb.png'),
			alt: 'A flow chart of where Sacramento’s money comes from and where it goes.'
		},
		{
			title: 'Detail',
			body: 'Drill down into detailed spending and revenue for each department and fund in a single year.',
			href: resolve('/budget/[year]/tree', { year: latestYear.id }),
			image: asset('images/home/tree-thumb.png'),
			alt: 'A drill-down view of Sacramento city spending and revenue.'
		},
		{
			title: 'Comparison',
			body: 'Put two budgets head to head. How did spending categories and revenue sources change?',
			href: 'https://openbudgetsac.org/compare/',
			image: asset('images/home/compare-thumb.jpg'),
			alt: 'The comparison tool, comparing two Sacramento city budgets.'
		},
		{
			title: 'Custom Queries (FY 2018 only)',
			body: "Explore the details of the City of Sacramento's adopted 2018 budget.",
			href: 'https://explorer.openbudgetsac.org/',
			image: asset('images/home/explorer.png'),
			alt: 'The explorer used to query the 2018 budget data.'
		}
	];
</script>

<PageMeta
	title="Home"
	description="Sacramento's city budget, turned into visualizations anyone can explore."
/>

<section class="container hero">
	<h1>Sacramento deserves to know what is in the budget and how it is made.</h1>
	<p class="lead prose">
		Open Budget: Sacramento takes current and past budget data published by the City of Sacramento
		and turns it into accessible visualizations, so community members can examine their city's
		budget for themselves.
	</p>
	<p>
		<a class="button" href={tools[0].href}>Explore the {latestYear.label} budget</a>
	</p>
</section>

<section class="container" aria-labelledby="tools-heading">
	<h2 id="tools-heading">Tools for understanding the budget</h2>
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
					<h3>{tool.title}</h3>
					<p>{tool.body}</p>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.hero {
		padding: 2rem 0 1rem;
	}
	.hero h1 {
		max-width: 22ch;
		margin-top: 0.5rem;
	}
	.card img {
		display: block;
		width: 100%;
		aspect-ratio: 16 / 10;
		object-fit: cover;
		border-radius: calc(var(--radius) - 2px);
		margin-bottom: 0.75rem;
		background: var(--surface);
	}
	.card h3 {
		margin: 0 0 0.25rem;
	}
	.card p {
		margin: 0;
		color: var(--text-muted);
	}
</style>

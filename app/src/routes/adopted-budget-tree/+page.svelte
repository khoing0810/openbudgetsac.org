<script lang="ts">
	import { resolve } from '$app/paths';
	import { latestYear } from '#lib/config/years.ts';

	// Legacy URL kept working: static hosts can't redirect, so point browsers
	// and crawlers at the current page.
	const target = resolve('/budget/[year]/tree', { year: latestYear.id });
</script>

<svelte:head>
	<title>Moved — Open Budget: Sacramento</title>
	<meta http-equiv="refresh" content="0; url={target}" />
	<link rel="canonical" href={target} />
</svelte:head>

<div class="container">
	<p>This page has moved to <a href={target}>{target}</a>.</p>
</div>

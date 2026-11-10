<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { latestYear } from '#lib/config/years.ts';
</script>

<PageMeta title="Sacramento Budget Charts and Posters" />

<div class="container prose">
	<h2>Sacramento Budget Data in Chart Form</h2>
	<a href={resolve('/budget/[year]/flow', { year: latestYear.id })}
		><h3>Cash Flow</h3>
		<img alt="" src={asset('images/flow-thumb-1517.jpg')} /></a
	><a href={resolve('/budget/[year]/tree', { year: latestYear.id })}
		><h3>Detailed Budget Breakdown</h3>
		<img alt="" src={asset('images/tree-thumb-1517.jpg')} /></a
	>
	<hr />
	<h2>Sacramento Budget Features</h2>
	<a href={resolve('/measure-z')}
		><h3>Focus on Measure Z: How does Sacramento fund violence prevention?</h3>
		<img alt="Measure Z" src={asset('images/home/measureZ12.png')} /></a
	>
</div>

<script lang="ts">
	import { asset } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="Focus on Measure Z" />

<div class="container prose">
	<h2>How Does Sacramento Fund Violence Prevention?</h2>
	<h3>Summary of Measure Z Funding</h3>
	<a href={asset('images/home/measurez.pdf')} rel="noopener noreferrer" target="_blank"
		><img
			alt="Does our city's budget reflect our commitment to violence prevention?"
			src={asset('images/home/measureZ12.png')}
		/></a
	>
	<h3>Analysis: Does the Measure Z Budget Reflect a Good Strategy for Violence Prevention?</h3>
	<a href={asset('images/home/measureZ3.pdf')}
		><img alt="Analysis of Measure Z strategy" src={asset('images/home/measureZ3.png')} /></a
	>
	<a
		href="https://docs.google.com/document/d/1nJBEkue4MVvIjrMx1yZESroX6pLeky7N7A0_lTVpzP4/edit"
		rel="noopener noreferrer"
		target="_blank"
		><p>
			Want to know more? Delve into these Measure Z resources compiled by Open Budget: Sacramento
		</p></a
	>
</div>

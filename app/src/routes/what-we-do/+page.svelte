<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="What We Do" />

<div class="container prose">
	<h4>
		We display city budget data in a helpful and clear format, explain how the budget is put
		together and voted on, and give people resources to follow up on what they have learned.
	</h4>
	<img alt="Infographic displaying the budget process" src={asset('images/process.png')} />
	<p class="align-right">
		<small
			>Image: <a href="http://www.openspending.org/" rel="noopener noreferrer" target="_blank"
				>OpenSpending</a
			></small
		>
	</p>
	<h2>What we do</h2>
	<p>
		Open Budget: Sacramento helps people learn more about the city budget, so they can talk about it
		with each other, with city council members, and with city staff. We want people to know how
		their city works and how it could work better.
	</p>
	<h2>How we do it</h2>
	<ul class="disc">
		<li>
			We talk to <strong>local groups</strong> to learn what they want to know about the budget and how
			best to share that knowledge.
		</li>
		<li>
			Every two years, at the beginning of each budget cycle, we get this data from Sacramento Open
			Data and present it in a simple, useful format to access timely, accurate budget data and
			present it in a simple, useful format.
		</li>
		<li>
			For those who wish to do their own analysis or make their own charts, we offer <a
				href="https://github.com/opensacorg">our API</a
			>, which is <strong>a free, easy-to-use open-source tool</strong>.
		</li>
	</ul>
	<p>Now that you know our goals, <a href={resolve('/feedback')}>share your ideas here</a>.</p>
</div>

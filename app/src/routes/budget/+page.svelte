<script lang="ts">
	import { resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { budgetYears } from '#lib/config/years.ts';
</script>

<PageMeta
	title="Budget Years"
	description="Every Sacramento budget year we publish, as a cash flow and a detailed breakdown."
/>

<div class="container">
	<h1>Budget years</h1>
	<p class="lead prose">
		Pick a fiscal year to see how money flows through the city's budget, or to break it down by
		fund, department and category.
	</p>
	<table>
		<thead>
			<tr><th>Fiscal year</th><th>Cash flow</th><th>Detailed breakdown</th></tr>
		</thead>
		<tbody>
			{#each budgetYears as y (y.id)}
				<tr>
					<th scope="row">{y.label}</th>
					<td><a href={resolve('/budget/[year]/flow', { year: y.id })}>Cash flow</a></td>
					<td><a href={resolve('/budget/[year]/tree', { year: y.id })}>Breakdown</a></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

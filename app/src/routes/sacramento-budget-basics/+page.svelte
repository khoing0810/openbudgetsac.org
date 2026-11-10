<script lang="ts">
	import { resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="Sacramento Budget Basics" />

<div class="container prose">
	<h2>Sacramento Budget Basics</h2>
	<p>
		Soon, we'll relaunch this page as a wiki so people can more easily contribute. For now, <a
			href={resolve('/contact')}>send us links</a
		>.
	</p>
	<ul class="disc">
		<li><a href="https://www.cityofsacramento.org/Finance/Budget">2013 Budget Discussion</a></li>
		<li>
			<a href="https://www.cityofsacramento.org/Finance/Budget"
				>Budget Process Transparency Ordinance</a
			>
		</li>
		<li>
			<a href="https://p2pu.org/en/groups/open-sacramento/content/sacramento-city-budget-101/"
				>CODEFORSACRAMENTO's City Budget 101 (in progress)</a
			>
		</li>
		<li>
			<a
				href="https://www.cityofsacramento.org/Government/o/CityAdministration/d/BudgetOffice/index.htm"
				>Budget Office</a
			>
		</li>
		<li>
			<a
				href="https://www.cityofsacramento.org/Government/o/CityAdministration/d/BudgetOffice/DOWD005079"
				>Budget Process</a
			>
		</li>
		<li>
			<a
				href="https://www.cityofsacramento.org/Government/o/CityAdministration/d/BudgetOffice/o/BudgetAdvisoryCommittee/index.htm"
				>Budget Advisory Committee</a
			>
		</li>
		<li>
			<a href="https://sacramento.mindmixer.com/sacramento-budget-prioritization"
				>Sacramento Budget Prioritization</a
			>: How would you allocate the City's General Fund budget?
		</li>
	</ul>
</div>

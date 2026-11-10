<script lang="ts">
	import { resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="Tools and Projects" />

<div class="container prose">
	<h2>Tools and Projects</h2>
	<p>
		Here are resources that have helped or inspired our work so far. Soon, we will relaunch this
		page as a wiki so people can more easily contribute. For now, <a href={resolve('/contact')}
			>send us links to other resources</a
		>. As you explore the list below and see how others are making budgets more accessible, feel
		free to <a href={resolve('/feedback')}>suggest features</a> for Open Budget: Sacramento.
	</p>
	<h3>Budget Visualization Resources</h3>
	<ul class="disc">
		<li>
			<a href="http://www.openspending.org" rel="noopener noreferrer" target="_blank"
				>OpenSpending</a
			>
		</li>
		<li><a href="http://d3js.org/" rel="noopener noreferrer" target="_blank">D3</a></li>
		<li>
			<a
				href="http://www.peterkrantz.com/2012/data-visualization-tools/"
				rel="noopener noreferrer"
				target="_blank">Peter Krantz</a
			>
		</li>
		<li>
			<a href="http://vallandingham.me/vis/" rel="noopener noreferrer" target="_blank"
				>Jim Vallandingham</a
			>
		</li>
	</ul>
	<h3>Budget Data Resources</h3>
	<ul class="disc">
		<li>
			<a
				href="https://github.com/openspending/handbook/blob/master/spending-data-handbook.pdf"
				rel="noopener noreferrer"
				target="_blank">Spending Data Handbook</a
			>
		</li>
		<li>
			<a
				href="https://www.openspending.org/about/fiscaldatapackage"
				rel="noopener noreferrer"
				target="_blank">The Fiscal Data Package</a
			>
		</li>
		<li>
			<a href="https://data.cityofsacramento.org" rel="noopener noreferrer" target="_blank"
				>Sacramento Open Data</a
			>
		</li>
	</ul>
	<h3>Budget Visualization Examples</h3>
	<h4>Cities</h4>
	<ul class="disc">
		<li>
			<a href="http://www.checkbooknyc.com/" rel="noopener noreferrer" target="_blank"
				>Checkbook NYC (New York City, New York, United States)</a
			>
		</li>
		<li>
			<a href="https://paloalto.opengov.com/transparency" rel="noopener noreferrer" target="_blank"
				>City of Palo Alto's Financial Reporting Platform (Palo Alto, California, United States)</a
			>
		</li>
		<li>
			<a
				href="https://data.honolulu.gov/browse?category=Finance&amp;utf8=%E2%9C%93&amp;sortBy=last_modified&amp;pageSize=100&amp;tags=budget"
				rel="noopener noreferrer"
				target="_blank">HNL Open Data (Honolulu, Hawaii, United States)</a
			>
		</li>
		<li>
			<a
				href="https://daten.berlin.de/datensaetze?q=haushalt&amp;sort=date_updated+desc"
				rel="noopener noreferrer"
				target="_blank">Berlin Open Data (Berlin, Berlin, Germany)</a
			>
		</li>
		<li>
			<a
				href="https://opendataphilly.org/datasets/city-operating-budget/"
				rel="noopener noreferrer"
				target="_blank">OpenDataPhilly (Philadelphia, Pennsylvania, United States)</a
			>
		</li>
		<li>
			<a
				href="https://www.longbeach.gov/finance/city-budget-and-finances/budget/budget-information/"
				rel="noopener noreferrer"
				target="_blank">Long Beach Open Data Portal (Long Beach, California, United States)</a
			>
		</li>
	</ul>
	<h4>Counties (United States Only)</h4>
	<ul class="disc">
		<li>
			<a
				href="https://datacatalog.cookcountyil.gov/browse?category=Finance+%26+Operations&amp;sortBy=newest&amp;pageSize=20"
				rel="noopener noreferrer"
				target="_blank">Cook County Open Data (Cook County, Illinois, United States)</a
			>
		</li>
	</ul>
	<h4>States (United States Only)</h4>
	<ul class="disc">
		<li>
			<a href="http://www.budgetchallenge.org/" rel="noopener noreferrer" target="_blank"
				>Budget Challenge (California, United States)</a
			>
		</li>
		<li>
			<a href="https://massbudget.org/budget-browser/" rel="noopener noreferrer" target="_blank"
				>Budget Browser (Massachusetts, United States)</a
			>
		</li>
		<li>
			<a href="https://ofm.wa.gov/budget/" rel="noopener noreferrer" target="_blank"
				>Our State Budget - (Washington, United States)</a
			>
		</li>
	</ul>
	<h4>International (Countries/Regions)</h4>
	<ul class="disc">
		<li>
			<a
				href="https://fiscaldata.treasury.gov/americas-finance-guide/federal-spending/"
				rel="noopener noreferrer"
				target="_blank">How much has the U.S. government spent this year? (United States)</a
			>
		</li>
		<li>
			<a href="https://wheredoesitallgo.org/" rel="noopener noreferrer" target="_blank"
				>Where Does It All Go? (United Kingdom)</a
			>
		</li>
		<li>
			<a
				href="https://www.government.se/government-of-sweden/ministry-of-finance/central-government-budget/"
				rel="noopener noreferrer"
				target="_blank">Central Government Budget (Sweden)</a
			>
		</li>
		<li>
			<a
				href="https://offenerhaushalt.de/haushalt/bund/#/einzelplane?date=2017&amp;einnahmen-ausgaben=Ausgaben"
				rel="noopener noreferrer"
				target="_blank">Federal Budget (Germany)</a
			>
		</li>
		<li>
			<a
				href="https://cameroon.openspending.org/fr/pib.html#/~/total"
				rel="noopener noreferrer"
				target="_blank">National Budget Investment (Cameroon)</a
			>
		</li>
		<li>
			<a href="http://slovakia.openspending.org" rel="noopener noreferrer" target="_blank"
				>Municipal Budgets (Slovakia)</a
			>
		</li>
		<li>
			<a href="http://www.budgetstories.md" rel="noopener noreferrer" target="_blank"
				>Budget Stories (Moldova)</a
			>
		</li>
	</ul>
</div>

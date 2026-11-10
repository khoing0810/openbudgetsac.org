<script lang="ts">
	import { resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="Who We Are" />

<div class="container prose">
	<h2>Who we are</h2>
	Open Budget: Sacramento is the result of many contributors including coders, community advocates, and
	city officials. We're looking for ideas and help, so get in touch and stop by our<a
		href="https://www.meetup.com/code4sac/"
		>bi-weekly virtual meetup
	</a>the first and third Wednesdays of the month from 6:30–8:30pm as part of
	<a href="http://codeforsacramento.org/">Open Sacramento </a>Community Action Night (<a
		href={resolve('/contact')}
		>contact us
	</a>ahead of time so we are sure to be available).
	<h4>Contributors:</h4>
	<div class="auto-columns">
		<ul class="list-unstyled">
			<li>Donald Brower</li>
			<li>Ash Roughani</li>
			<li>Mark A. Matney, Jr.</li>
			<li>Dan Fey</li>
		</ul>
		<ul class="list-unstyled">
			<li>John Loper</li>
			<li>Joel Riphagen</li>
			<li>Nate Bass</li>
			<li>Ismail Ahmed</li>
		</ul>
		<ul class="list-unstyled">
			<li>Gavin Deschutter</li>
			<li>Richard Prasad</li>
			<li>l84tahoe</li>
		</ul>
	</div>
	<blockquote>
		<em
			>Open Budget: Sacramento uses code originally created by OpenOakland. Thanks OpenOakland for
			all your hard work!</em
		>
	</blockquote>
	<h2>Who they are</h2>
	<a href="https://openbudgetsac.org">Open Budget: Sacramento </a>is the result of many contributors
	including coders, community advocates, and city officials.
	<h4>Current team:</h4>
	<ul class="list-unstyled">
		<li>Beti G.</li>
		<li>Cindy Terdiman</li>
		<li>Emily Peri</li>
		<li>Felicia Betancourt</li>
		<li>Karen Ivy</li>
		<li>Meredith Burkle</li>
		<li>Sean Martinez</li>
	</ul>
	<h4>Contributors:</h4>
	<div class="auto-columns">
		<ul class="list-unstyled">
			<li>Adam Stiles</li>
			<li>Amanda Richardson</li>
			<li>Andrea Moed</li>
			<li>Ben Wen</li>
			<li>Bob Sarnoff</li>
			<li>Dave Guarino</li>
			<li>David Ordal</li>
			<li>Deborah Acosta</li>
			<li>Diana Wu</li>
			<li>Elina Rubuliak</li>
			<li>Ian MacFarland</li>
		</ul>
		<ul class="list-unstyled">
			<li>Ian McEachern</li>
			<li>Ikka Lynn</li>
			<li>Jeff French</li>
			<li>Jehan Tremback</li>
			<li>Jon Katz</li>
			<li>Max Ogden</li>
			<li>Mike Ubell</li>
			<li>Mohamed Gulaid</li>
			<li>Nic Aulston</li>
			<li>Nick Brooks</li>
			<li>Phil Popp</li>
		</ul>
		<ul class="list-unstyled">
			<li>Phil Wolff</li>
			<li>Rachel Li</li>
			<li>Shawn McDougal</li>
			<li>Sonya Rifkin</li>
			<li>Steve Berley</li>
			<li>Steve Spiker</li>
			<li>Tom Dooner</li>
			<li>Tom Fite</li>
			<li>Yumiko Abe-Jones</li>
			<li>Ismail Ahmed</li>
		</ul>
	</div>
	<ul class="list-unstyled">
		<li>
			And the rest of the original <a
				href="https://codeforsacramento.org/"
				rel="noopener noreferrer"
				target="_blank">Code for Sacramento</a
			> crew.
		</li>
	</ul>
</div>

<script lang="ts">
	import { resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="Discuss" />

<div class="container prose">
	<h2>Discuss</h2>
	<p>
		<a href={resolve('/contact')}>Help us</a> install<a href="http://www.discourse.org/"
			>Discourse</a
		>, an open-source discussion platform (<a href="https://github.com/discourse/discourse"
			>source code</a
		>).
	</p>
</div>

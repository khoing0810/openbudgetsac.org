<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import PageMeta from '#lib/components/PageMeta.svelte';

	const notFound = $derived(page.status === 404);
</script>

<PageMeta title={notFound ? 'Page not found' : 'Something went wrong'} />

<div class="container prose">
	<h1>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
	<p>
		{notFound ? "The page you asked for can't be found." : 'Please try again in a moment.'}
		Try the <a href={resolve('/')}>home page</a> or
		<a href={resolve('/budget')}>all budget years</a>.
	</p>
</div>

<script lang="ts">
	import '@fontsource-variable/public-sans';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import SiteHeader from '#lib/components/SiteHeader.svelte';
	import SiteFooter from '#lib/components/SiteFooter.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SiteHeader />
<main id="main-content" tabindex="-1">
	{@render children()}
</main>
<SiteFooter />

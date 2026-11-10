<script lang="ts">
	import { siteName } from '#lib/config/site.ts';

	let { title, description }: { title: string; description?: string } = $props();
</script>

<svelte:head>
	<title>{title} — {siteName}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
</svelte:head>

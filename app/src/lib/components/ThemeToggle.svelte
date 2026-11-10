<script lang="ts">
	import { onMount } from 'svelte';

	// Follows the OS until the visitor picks; their pick is saved per browser.
	let dark = $state(false);

	const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

	onMount(() => {
		const saved = document.documentElement.dataset.theme;
		dark = saved ? saved === 'dark' : prefersDark();

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const follow = (e: MediaQueryListEvent) => {
			if (!document.documentElement.dataset.theme) dark = e.matches;
		};
		media.addEventListener('change', follow);
		return () => media.removeEventListener('change', follow);
	});

	const toggle = () => {
		dark = !dark;
		const theme = dark ? 'dark' : 'light';
		document.documentElement.dataset.theme = theme;
		try {
			localStorage.setItem('theme', theme);
		} catch {
			// Private mode or blocked storage: the choice lasts for this page only.
		}
	};
</script>

<button class="theme-toggle" type="button" aria-pressed={dark} onclick={toggle}>
	<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
		{#if dark}
			<path fill="currentColor" d="M21 14.5A9 9 0 0 1 9.5 3a9 9 0 1 0 11.5 11.5Z" />
		{:else}
			<circle cx="12" cy="12" r="4.5" fill="currentColor" />
			<g stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<path
					d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
				/>
			</g>
		{/if}
	</svg>
	<span class="visually-hidden">Dark mode</span>
</button>

<style>
	.theme-toggle {
		display: inline-grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--raised);
		color: var(--text);
		cursor: pointer;
	}
	.theme-toggle:hover {
		border-color: var(--border-strong);
	}
</style>

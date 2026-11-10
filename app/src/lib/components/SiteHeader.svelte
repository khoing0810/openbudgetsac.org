<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { primaryNav } from '#lib/config/site.ts';
	import ThemeToggle from './ThemeToggle.svelte';

	let menuOpen = $state(false);

	// Close the phone menu after navigating.
	$effect(() => {
		void page.url.pathname;
		menuOpen = false;
	});
</script>

<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="site-header">
	<div class="container bar">
		<a class="brand" href={resolve('/')}>
			<span class="mark" aria-hidden="true"></span>
			<span>Open Budget<span class="city">Sacramento</span></span>
		</a>
		<div class="theme"><ThemeToggle /></div>
		<button
			class="menu-toggle"
			type="button"
			aria-expanded={menuOpen}
			aria-controls="primary-nav"
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span aria-hidden="true">☰</span>
			<span class="visually-hidden">Menu</span>
		</button>
		<nav id="primary-nav" aria-label="Primary" class:open={menuOpen}>
			<ul class="groups">
				{#each primaryNav as group (group.label)}
					<li class="group">
						<span class="group-label">{group.label}</span>
						<ul>
							{#each group.links as link (link.label)}
								<li>
									{#if link.href.startsWith('https://')}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external site -->
										<a href={link.href}
											>{link.label}<span class="ext" aria-hidden="true"> ↗</span></a
										>
									{:else}
										<a href={resolve(link.href as '/')}>{link.label}</a>
									{/if}
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</header>

<style>
	.skip-link {
		position: absolute;
		left: 0.5rem;
		top: -3rem;
		padding: 0.5rem 0.75rem;
		background: var(--primary);
		color: var(--on-primary);
		z-index: 10;
	}
	.skip-link:focus {
		top: 0.5rem;
	}
	.site-header {
		position: sticky;
		top: 0;
		z-index: 20;
		background: color-mix(in srgb, var(--page) 88%, transparent);
		backdrop-filter: saturate(1.4) blur(10px);
		border-bottom: 1px solid var(--border);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		min-height: 4rem;
		gap: 0.5rem;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		margin-right: auto;
		font-weight: 800;
		font-size: 1.1rem;
		letter-spacing: -0.01em;
		color: var(--text-strong);
		text-decoration: none;
	}
	.brand:hover {
		color: var(--text-strong);
	}
	.mark {
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 4px;
		background:
			linear-gradient(135deg, transparent 50%, var(--accent) 50%) bottom right / 55% 55% no-repeat,
			var(--primary);
	}
	.city {
		font-weight: 500;
		color: var(--text-muted);
		margin-left: 0.35rem;
	}
	.menu-toggle {
		min-width: 2.75rem;
		min-height: 2.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--raised);
		font-size: 1.25rem;
		cursor: pointer;
	}
	nav {
		display: none;
		width: 100%;
		padding-bottom: 1rem;
	}
	nav.open {
		display: block;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.groups {
		display: grid;
		gap: 1rem;
	}
	.group-label {
		display: block;
		font-weight: 700;
		color: var(--text-muted);
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	.group a {
		display: block;
		padding: 0.45rem 0;
		color: var(--text);
		text-decoration: none;
	}
	.group a:hover {
		color: var(--link);
		text-decoration: underline;
	}
	.ext {
		color: var(--text-muted);
	}

	@media (min-width: 56rem) {
		.menu-toggle {
			display: none;
		}
		.theme {
			order: 3;
		}
		nav {
			display: block;
			width: auto;
			padding: 0;
		}
		.groups {
			display: flex;
			gap: 0.25rem;
		}
		.group {
			position: relative;
		}
		.group-label {
			padding: 0.75rem 0.9rem;
			cursor: default;
			color: var(--text);
			letter-spacing: 0.08em;
		}
		.group:hover .group-label,
		.group:focus-within .group-label {
			color: var(--primary);
		}
		.group ul {
			display: none;
			position: absolute;
			right: 0;
			min-width: 15rem;
			padding: 0.5rem 0;
			background: var(--raised);
			border: 1px solid var(--border);
			border-radius: var(--radius);
			box-shadow: var(--shadow);
			z-index: 5;
		}
		.group:hover ul,
		.group:focus-within ul {
			display: block;
		}
		.group a {
			padding: 0.5rem 1rem;
		}
	}
</style>

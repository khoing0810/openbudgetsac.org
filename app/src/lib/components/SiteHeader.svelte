<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { primaryNav, siteName } from '#lib/config/site.ts';

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
		<a class="brand" href={resolve('/')}>{siteName}</a>
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
										<a href={link.href}>{link.label}</a>
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
		background: var(--green-dark);
		color: #fff;
		z-index: 10;
	}
	.skip-link:focus {
		top: 0.5rem;
	}
	.site-header {
		background: var(--surface);
		border-bottom: 1px solid var(--border);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		min-height: 3.5rem;
		gap: 0.5rem;
	}
	.brand {
		font-family: var(--font-heading);
		font-weight: 700;
		font-size: 1.15rem;
		color: var(--green-dark);
		text-decoration: none;
	}
	.menu-toggle {
		min-width: 2.75rem;
		min-height: 2.75rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--page);
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
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.group a {
		display: block;
		padding: 0.4rem 0;
	}

	@media (min-width: 56rem) {
		.menu-toggle {
			display: none;
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
			padding: 0.75rem;
			cursor: default;
		}
		.group ul {
			display: none;
			position: absolute;
			right: 0;
			min-width: 14rem;
			padding: 0.5rem 0;
			background: var(--page);
			border: 1px solid var(--border);
			border-radius: var(--radius);
			box-shadow: 0 6px 20px rgb(0 0 0 / 0.08);
			z-index: 5;
		}
		.group:hover ul,
		.group:focus-within ul {
			display: block;
		}
		.group a {
			padding: 0.45rem 1rem;
		}
	}
</style>

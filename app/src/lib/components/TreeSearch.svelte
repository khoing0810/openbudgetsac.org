<script lang="ts">
	import { searchTree, type TreeEntry } from '#lib/viz/tree/search.ts';
	import { formatUsdCompact } from '#lib/viz/format.ts';

	let {
		index,
		label,
		onpick
	}: { index: TreeEntry[]; label: string; onpick: (entry: TreeEntry) => void } = $props();

	let query = $state('');
	const results = $derived(searchTree(index, query, 8));

	const pick = (e: TreeEntry) => {
		onpick(e);
		query = '';
	};
</script>

<div class="search">
	<label for="tree-search">{label}</label>
	<input
		id="tree-search"
		type="search"
		autocomplete="off"
		placeholder="Try “Police”, “Measure U” or “Overtime”"
		bind:value={query}
	/>
	<p class="visually-hidden" aria-live="polite">
		{query.trim().length >= 2 ? `${results.length} matches` : ''}
	</p>
	{#if query.trim().length >= 2}
		{#if results.length}
			<ul class="results">
				{#each results as r (r.path.join('\u0000'))}
					<li>
						<button type="button" onclick={() => pick(r)}>
							<span class="name">{r.name}</span>
							<span class="amount">{formatUsdCompact(r.amount)}</span>
							{#if r.path.length > 1}
								<span class="where">in {r.path.slice(0, -1).join(' › ')}</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="muted none">Nothing matches “{query.trim()}”.</p>
		{/if}
	{/if}
</div>

<style>
	.search {
		position: relative;
		max-width: 34rem;
	}
	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.35rem;
	}
	input {
		width: 100%;
		min-height: 2.75rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--raised);
	}
	.results {
		position: absolute;
		z-index: 6;
		left: 0;
		right: 0;
		margin: 0.25rem 0 0;
		padding: 0.25rem 0;
		list-style: none;
		background: var(--raised);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}
	button {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0 1rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 0;
		background: none;
		text-align: left;
		cursor: pointer;
	}
	button:hover,
	button:focus-visible {
		background: var(--surface);
	}
	.name {
		font-weight: 600;
	}
	.amount {
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}
	.where {
		grid-column: 1 / -1;
		font-size: 0.85rem;
		color: var(--text-muted);
	}
	.none {
		margin: 0.5rem 0 0;
	}
</style>

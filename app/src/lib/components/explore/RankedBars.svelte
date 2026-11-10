<script lang="ts">
	import type { BreakdownRow } from '#lib/viz/explore/data.ts';
	import { pctChange } from '#lib/viz/compare/diff.ts';
	import { formatPctChange, formatShare, formatUsdCompact } from '#lib/viz/format.ts';

	let {
		rows,
		total,
		color,
		previousLabel,
		pickLabel,
		onpick,
		labelledby
	}: {
		rows: BreakdownRow[];
		total: number;
		color: string;
		/** The year before, or null when there is none to compare with. */
		previousLabel: string | null;
		/** Describes what picking a row does, for screen readers; null when rows can't be picked. */
		pickLabel: ((name: string) => string) | null;
		onpick: (name: string) => void;
		labelledby: string;
	} = $props();

	const LIMIT = 12;
	let showAll = $state(false);
	const shown = $derived(showAll ? rows : rows.slice(0, LIMIT));
	const max = $derived(Math.max(1, ...rows.map((r) => r.amount)));
</script>

<ol class="bars" aria-labelledby={labelledby}>
	{#each shown as r (r.name)}
		{@const pct = r.previous === null ? null : pctChange(r.previous, r.amount)}
		<li>
			<div class="line">
				{#if pickLabel}
					<button type="button" class="name" onclick={() => onpick(r.name)}
						>{r.name}<span class="visually-hidden">. {pickLabel(r.name)}</span></button
					>
				{:else}
					<span class="name">{r.name}</span>
				{/if}
				<span class="amount"
					>{formatUsdCompact(r.amount)}
					<span class="share">{formatShare(r.amount, total)}</span></span
				>
			</div>
			<div class="track" aria-hidden="true">
				<span class="bar" style:width="max({(r.amount / max) * 100}%, 2px)" style:background={color}
				></span>
			</div>
			{#if previousLabel}
				<p class="meta">
					{#if pct === null}
						New since {previousLabel}
					{:else}
						<span class:up={pct > 0} class:down={pct < 0}>{formatPctChange(pct)}</span> since {previousLabel}
					{/if}
				</p>
			{/if}
		</li>
	{/each}
</ol>
{#if rows.length > LIMIT}
	<button type="button" class="more" aria-expanded={showAll} onclick={() => (showAll = !showAll)}>
		{showAll ? 'Show the top 12' : `Show all ${rows.length}`}
	</button>
{/if}

<style>
	.bars {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		padding: 0.6rem 0;
		border-bottom: 1px solid var(--border);
	}
	.line {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 1rem;
	}
	.name {
		font-weight: 600;
		text-align: left;
	}
	button.name {
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		font-weight: 600;
		color: var(--link);
		text-decoration: underline;
		text-underline-offset: 0.18em;
		cursor: pointer;
	}
	.amount {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.share {
		margin-left: 0.25rem;
		font-weight: 500;
		color: var(--text-muted);
	}
	.track {
		height: 0.7rem;
		margin: 0.4rem 0 0.3rem;
		border-radius: 2px;
		background: var(--surface);
		overflow: hidden;
	}
	.bar {
		display: block;
		height: 100%;
		transition: width 250ms ease;
	}
	.meta {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-muted);
	}
	.meta span {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.more {
		margin-top: 1rem;
		min-height: 2.75rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--raised);
		color: var(--text-strong);
		font: inherit;
		font-weight: 600;
		cursor: pointer;
	}
	@media (prefers-reduced-motion: reduce) {
		.bar {
			transition: none;
		}
	}
</style>

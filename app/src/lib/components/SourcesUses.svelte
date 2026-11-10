<script lang="ts">
	import type { SourceUseRow } from '#lib/viz/flow/sources.ts';
	import { formatPctChange, formatShare, formatUsdCompact } from '#lib/viz/format.ts';

	let {
		sources,
		uses,
		previousLabel
	}: { sources: SourceUseRow[]; uses: SourceUseRow[]; previousLabel: string | null } = $props();

	const columns = $derived([
		{
			id: 'sources',
			title: 'Where the money comes from',
			rows: sources,
			other: 'var(--revenue-fill)'
		},
		{ id: 'uses', title: 'Where it goes', rows: uses, other: 'var(--expense-fill)' }
	]);

	const change = (r: SourceUseRow) =>
		r.previous === null || r.previous === 0 ? null : ((r.total - r.previous) / r.previous) * 100;
</script>

<p class="legend muted">
	<span><i class="sw" style:background="var(--fund)"></i> General Fund</span>
	<span
		><i class="sw" style:background="var(--revenue-fill)"></i><i
			class="sw"
			style:background="var(--expense-fill)"
		></i> Other funds</span
	>
	{#if previousLabel}<span>Change is compared with {previousLabel}.</span>{/if}
</p>

<div class="cols">
	{#each columns as col (col.id)}
		{@const max = Math.max(1, ...col.rows.map((r) => r.total))}
		{@const sum = col.rows.reduce((t, r) => t + r.total, 0)}
		<section aria-labelledby="{col.id}-heading">
			<h2 id="{col.id}-heading">{col.title}</h2>
			<ol>
				{#each col.rows as r (r.name)}
					{@const pct = change(r)}
					<li>
						<div class="line">
							<span class="name">{r.name}</span>
							<span class="amount"
								>{formatUsdCompact(r.total)}
								<span class="share">{formatShare(r.total, sum)}</span></span
							>
						</div>
						<div class="track" aria-hidden="true">
							<span class="seg gf" style:width="{(r.generalFund / max) * 100}%"></span><span
								class="seg"
								style:width="{((r.total - r.generalFund) / max) * 100}%"
								style:background={col.other}
							></span>
						</div>
						<p class="meta">
							{#if r.generalFund > 0}
								<span>{formatShare(r.generalFund, r.total)} General Fund</span>
							{/if}
							{#if previousLabel}
								{#if pct === null}
									<span class="chip">New since {previousLabel}</span>
								{:else}
									<span class="chip" class:up={pct > 0} class:down={pct < 0}
										>{formatPctChange(pct)}</span
									>
								{/if}
							{/if}
						</p>
					</li>
				{/each}
			</ol>
		</section>
	{/each}
</div>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		font-size: 0.9rem;
	}
	.sw {
		display: inline-block;
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 2px;
		vertical-align: -0.05em;
		margin-right: 0.15rem;
	}
	.cols {
		display: grid;
		gap: 2rem 3rem;
	}
	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.35rem;
	}
	ol {
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
		gap: 1rem;
	}
	.name {
		font-weight: 600;
	}
	.amount {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.share {
		font-weight: 500;
		color: var(--text-muted);
		margin-left: 0.25rem;
	}
	.track {
		display: flex;
		height: 0.7rem;
		margin: 0.4rem 0 0.3rem;
		border-radius: 2px;
		background: var(--surface);
		overflow: hidden;
	}
	.seg {
		height: 100%;
		transition: width 250ms ease;
	}
	.seg.gf {
		background: var(--fund);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.75rem;
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-muted);
	}
	.chip {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.chip.up {
		color: var(--increase);
	}
	.chip.down {
		color: var(--decrease);
	}
	@media (min-width: 56rem) {
		.cols {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>

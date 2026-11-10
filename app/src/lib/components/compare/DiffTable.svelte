<script lang="ts">
	import { pctChange, sortDiff, type DiffRow, type DiffSort } from '#lib/viz/compare/diff.ts';
	import { formatPctChange, formatUsd, formatUsdChange } from '#lib/viz/format.ts';

	let {
		rows,
		nameLabel,
		fromLabel,
		toLabel,
		caption
	}: {
		rows: DiffRow[];
		nameLabel: string;
		fromLabel: string;
		toLabel: string;
		caption: string;
	} = $props();

	let sortBy = $state<DiffSort>('to');
	const sorted = $derived(sortDiff(rows, sortBy));
	const totals = $derived(
		rows.reduce((t, r) => ({ from: t.from + r.from, to: t.to + r.to }), { from: 0, to: 0 })
	);
	const columns = $derived<{ key: DiffSort | null; label: string; num: boolean }[]>([
		{ key: 'name', label: nameLabel, num: false },
		{ key: null, label: fromLabel, num: true },
		{ key: 'to', label: toLabel, num: true },
		{ key: 'change', label: 'Change', num: true },
		{ key: 'pct', label: 'Change %', num: true }
	]);
	const ariaSort = (key: DiffSort | null) =>
		key && sortBy === key ? (key === 'name' ? 'ascending' : 'descending') : undefined;
</script>

<div class="scroll">
	<table>
		<caption>{caption}</caption>
		<thead>
			<tr>
				{#each columns as col, i (i)}
					<th class:num={col.num} scope="col" aria-sort={ariaSort(col.key)}>
						{#if col.key}
							{@const key = col.key}
							<button type="button" onclick={() => (sortBy = key)}>
								{col.label}<span aria-hidden="true"
									>{sortBy === key ? (key === 'name' ? ' ↑' : ' ↓') : ''}</span
								>
							</button>
						{:else}
							{col.label}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each sorted as r (r.name)}
				<tr>
					<th scope="row">{r.name}</th>
					<td class="num">{formatUsd(r.from)}</td>
					<td class="num">{formatUsd(r.to)}</td>
					<td class="num" class:up={r.change > 0} class:down={r.change < 0}
						>{formatUsdChange(r.change)}</td
					>
					<td class="num" class:up={r.change > 0} class:down={r.change < 0}
						>{formatPctChange(r.pct)}</td
					>
				</tr>
			{/each}
		</tbody>
		<tfoot>
			<tr>
				<th scope="row">Total</th>
				<td class="num">{formatUsd(totals.from)}</td>
				<td class="num">{formatUsd(totals.to)}</td>
				<td class="num">{formatUsdChange(totals.to - totals.from)}</td>
				<td class="num">{formatPctChange(pctChange(totals.from, totals.to))}</td>
			</tr>
		</tfoot>
	</table>
</div>

<style>
	.scroll {
		overflow-x: auto;
	}
	caption {
		text-align: left;
		font-weight: 700;
		padding: 0.5rem 0;
	}
	tbody th {
		font-weight: 600;
		color: var(--text);
		font-size: 1rem;
	}
	thead button {
		background: none;
		border: 0;
		padding: 0;
		font-weight: 700;
		color: var(--link);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 0.18em;
	}
	.up {
		color: var(--increase);
	}
	.down {
		color: var(--decrease);
	}
	tfoot th,
	tfoot td {
		font-weight: 800;
		border-top: 2px solid var(--border-strong);
		border-bottom: 0;
		color: var(--text-strong);
	}
	td {
		white-space: nowrap;
	}
</style>

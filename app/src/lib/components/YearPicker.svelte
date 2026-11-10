<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { budgetYears } from '#lib/config/years.ts';

	let { current, view }: { current: string; view: 'flow' | 'tree' } = $props();

	const onchange = (event: Event) => {
		const year = (event.currentTarget as HTMLSelectElement).value;
		const target =
			view === 'flow'
				? resolve('/budget/[year]/flow', { year })
				: resolve('/budget/[year]/tree', { year });
		goto(target, { reset: false });
	};
</script>

<label class="picker">
	<span>Fiscal year</span>
	<select value={current} {onchange}>
		{#each budgetYears as y (y.id)}
			<option value={y.id}>{y.label}</option>
		{/each}
	</select>
</label>

<style>
	.picker {
		display: inline-flex;
		flex-direction: column;
		gap: 0.25rem;
		font-weight: 600;
	}
</style>

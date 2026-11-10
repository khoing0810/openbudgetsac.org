<script lang="ts" generics="T extends string">
	/** A labelled group of radio buttons styled as a segmented control. */
	let {
		legend,
		name,
		options,
		value = $bindable()
	}: {
		legend: string;
		name: string;
		options: readonly { value: T; label: string }[];
		value: T;
	} = $props();
</script>

<fieldset class="segmented">
	<legend>{legend}</legend>
	<div class="track">
		{#each options as option (option.value)}
			<label class:checked={value === option.value}>
				<input type="radio" {name} value={option.value} bind:group={value} />
				<span>{option.label}</span>
			</label>
		{/each}
	</div>
</fieldset>

<style>
	fieldset {
		border: 0;
		margin: 0;
		padding: 0;
		min-width: 0;
	}
	legend {
		padding: 0;
		margin-bottom: 0.35rem;
		font-weight: 600;
	}
	.track {
		display: inline-flex;
		flex-wrap: wrap;
		padding: 3px;
		gap: 3px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--surface);
	}
	label {
		position: relative;
		cursor: pointer;
	}
	input {
		position: absolute;
		opacity: 0;
		inset: 0;
		margin: 0;
		cursor: pointer;
	}
	span {
		display: block;
		padding: 0.45rem 0.9rem;
		border-radius: calc(var(--radius) - 1px);
		font-weight: 600;
		color: var(--text-muted);
	}
	label.checked span {
		background: var(--raised);
		color: var(--text-strong);
		box-shadow: var(--shadow);
	}
	input:focus-visible + span {
		outline: 3px solid var(--focus);
		outline-offset: 1px;
	}
</style>

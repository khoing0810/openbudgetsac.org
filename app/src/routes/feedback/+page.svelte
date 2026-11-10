<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
</script>

<PageMeta title="Feedback" />

<div class="container prose">
	<h2>How would you use Open Budget?</h2>
	<p role="alert">
		<strong>Feedback form notice:</strong> If this embedded form fails to load, use the direct link below
		to submit your input.
	</p>
	<p>
		Submit feedback with the form below, or open it directly in a new tab.<br /><a
			href="https://forms.gle/NqjmBatZmLHLFmQEA"
			rel="noopener noreferrer"
			target="_blank">Open feedback form</a
		>
	</p>
	<iframe
		height="700"
		loading="lazy"
		src="https://forms.gle/NqjmBatZmLHLFmQEA"
		title="Open Budget Sacramento Feedback Form"
		width="100%"
		>&lt;span data-i18n="feedback.loadingForm"&gt;Loading feedback form...&lt;/span&gt;</iframe
	>
</div>

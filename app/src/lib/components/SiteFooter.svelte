<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="site-footer">
	<div class="container cols">
		<p class="about">
			Open Budget: Sacramento is an open-source project by
			<a href="https://opensac.org/">Open Sacramento</a> that helps residents understand
			Sacramento's spending and budget process. It began as a clone of
			<a href="https://openbudgetoakland.org/">Open Budget Oakland</a>, by
			<a href="https://openoakland.org/">OpenOakland</a>.
		</p>
		<ul class="links">
			<li><a href={resolve('/who-we-are')}>About the Project</a></li>
			<li><a href="https://www.meetup.com/Code4Sac/">Get Involved</a></li>
			<li><a href={resolve('/feedback')}>Give Feedback</a></li>
			<li><a href="https://github.com/opensacorg/openbudgetsac.org">Source on GitHub</a></li>
			<li><a href="https://www.x.com/opensacorg">Open Sacramento on X</a></li>
		</ul>
	</div>
</footer>

<style>
	.site-footer {
		margin-top: 4rem;
		padding: 2rem 0;
		background: var(--green-dark);
		color: #e8f3ef;
	}
	.site-footer a {
		color: var(--gold);
	}
	.cols {
		display: grid;
		gap: 1.5rem;
	}
	.about {
		max-width: 40rem;
	}
	.links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}
	@media (min-width: 48rem) {
		.cols {
			grid-template-columns: 2fr 1fr;
		}
	}
</style>

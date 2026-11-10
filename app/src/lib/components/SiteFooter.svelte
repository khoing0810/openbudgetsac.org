<script lang="ts">
	import { resolve } from '$app/paths';
	import { latestYear } from '#lib/config/years.ts';
</script>

<footer class="site-footer">
	<div class="container">
		<p class="wordmark">Open Budget <span>Sacramento</span></p>
		<div class="cols">
			<p class="about">
				An open-source project by
				<a href="https://opensac.org/">Open Sacramento</a> that helps residents understand
				Sacramento's spending and budget process. It began as a clone of
				<a href="https://openbudgetoakland.org/">Open Budget Oakland</a>, by
				<a href="https://openoakland.org/">OpenOakland</a>.
			</p>
			<nav aria-label="Explore">
				<h2 class="col-title">Explore</h2>
				<ul>
					<li>
						<a class="arrow" href={resolve('/budget/[year]/flow', { year: latestYear.id })}
							>Cash flow</a
						>
					</li>
					<li>
						<a class="arrow" href={resolve('/budget/[year]/tree', { year: latestYear.id })}
							>Detailed breakdown</a
						>
					</li>
					<li><a class="arrow" href={resolve('/budget')}>All budget years</a></li>
				</ul>
			</nav>
			<nav aria-label="Project">
				<h2 class="col-title">Project</h2>
				<ul>
					<li><a class="arrow" href={resolve('/who-we-are')}>About the project</a></li>
					<li><a class="arrow" href={resolve('/feedback')}>Give feedback</a></li>
					<li>
						<a class="arrow external" href="https://www.meetup.com/Code4Sac/">Get involved</a>
					</li>
					<li>
						<a class="arrow external" href="https://github.com/opensacorg/openbudgetsac.org"
							>Source on GitHub</a
						>
					</li>
					<li>
						<a class="arrow external" href="https://www.x.com/opensacorg">Open Sacramento on X</a>
					</li>
				</ul>
			</nav>
		</div>
		<p class="fine">
			Data from <a href="https://data.cityofsacramento.org">City of Sacramento Open Data</a>. This
			is a community project, not an official City of Sacramento website.
		</p>
	</div>
</footer>

<style>
	.site-footer {
		margin-top: 5rem;
		padding: 3.5rem 0 2rem;
		background: var(--hero);
		color: var(--on-hero-muted);
	}
	.site-footer a {
		color: var(--on-hero);
		text-decoration-color: rgb(255 255 255 / 0.4);
	}
	.site-footer a:hover {
		color: var(--accent);
	}
	.wordmark {
		margin: 0 0 2.5rem;
		font-size: clamp(2.25rem, 8vw, 5.5rem);
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.04em;
		color: var(--on-hero);
	}
	.wordmark span {
		color: var(--accent);
	}
	.cols {
		display: grid;
		gap: 2rem;
	}
	.about {
		max-width: 34rem;
		margin: 0;
	}
	.col-title {
		margin: 0 0 0.75rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--on-hero-muted);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}
	ul a {
		text-decoration: none;
	}
	.fine {
		margin: 3rem 0 0;
		padding-top: 1.5rem;
		border-top: 1px solid rgb(255 255 255 / 0.15);
		font-size: 0.9rem;
	}
	@media (min-width: 48rem) {
		.cols {
			grid-template-columns: 2fr 1fr 1fr;
		}
	}
</style>

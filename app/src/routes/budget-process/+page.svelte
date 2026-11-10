<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { findYear } from '#lib/config/years.ts';
	import {
		cycle,
		cycleProgress,
		events,
		getInvolved,
		phaseForMonth,
		phases,
		type BudgetEvent,
		type EventKind,
		type PhaseId
	} from '#lib/content/budget-calendar.ts';

	// Prerendered with the build date, then refreshed in the browser.
	let today = $state(new Date());
	onMount(() => (today = new Date()));

	const MONTHS = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
	const monthName = (m: number) =>
		new Date(Date.UTC(2000, m - 1, 15)).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
	/** Column of a calendar month on the Sep–Jul track, 1-based. */
	const col = (m: number) => ((m - 9 + 12) % 12) + 1;

	const color: Record<PhaseId, string> = {
		priorities: 'var(--tile-6)',
		midyear: 'var(--tile-1)',
		workshops: 'var(--tile-3)',
		proposed: 'var(--tile-9)',
		hearings: 'var(--tile-12)',
		adoption: 'var(--tile-4)'
	};
	const kindLabel: Record<EventKind, string> = {
		council: 'City Council',
		committee: 'Committee',
		release: 'Release',
		public: 'Public input',
		milestone: 'Milestone'
	};
	const phaseTitle = Object.fromEntries(phases.map((p) => [p.id, p.title])) as Record<
		PhaseId,
		string
	>;

	const month = $derived(today.getMonth() + 1);
	const quiet = $derived(month === 8);
	const current = $derived(phaseForMonth(month));
	const next = $derived(phases[(phases.indexOf(current) + 1) % phases.length]);
	const progress = $derived(cycleProgress(month));
	const todayIso = $derived(today.toISOString().slice(0, 10));
	const upcoming = $derived(events.filter((e) => (e.until ?? e.date) >= todayIso));
	const adoptedYear = findYear(cycle.yearId);

	const parse = (iso: string) => new Date(`${iso}T12:00:00Z`);
	const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
		parse(iso).toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });
	const longDate = (e: BudgetEvent) =>
		e.until
			? `${fmt(e.date, { month: 'long', day: 'numeric', year: 'numeric' })} to ${fmt(e.until, { month: 'long', day: 'numeric', year: 'numeric' })}`
			: fmt(e.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
</script>

<PageMeta
	title="How Sacramento builds its budget"
	description="The City of Sacramento's yearly budget cycle, where it is now, and when residents can weigh in."
/>

<div class="container">
	<header class="page-intro">
		<p class="eyebrow">Budget process</p>
		<h1>How Sacramento builds its budget</h1>
		<p class="lead prose">
			Every year the City turns priorities into a spending plan in about ten months, from the
			Council's first workshop in September to a new budget on July 1. Here's how it works, where it
			stands today, and when your voice counts most.
		</p>
	</header>

	<section class="now" aria-labelledby="now-heading">
		<div class="now-text">
			<p class="now-label">
				<span class="pulse" aria-hidden="true"></span> Right now · {monthName(month)}
				{today.getFullYear()}
			</p>
			{#if quiet}
				<h2 id="now-heading">The new budget is in effect</h2>
				<p>
					The fiscal year started on July 1. The next cycle begins with Council priorities in
					September.
				</p>
			{:else}
				<h2 id="now-heading">{current.title}</h2>
				<p>{current.summary}</p>
				{#if current.yourVoice}
					<p class="voice"><strong>Your voice:</strong> {current.yourVoice}</p>
				{/if}
				<p class="muted next">
					Next: <strong>{next.title}</strong>, usually in {monthName(next.months[0])}.
				</p>
			{/if}
		</div>
		<div class="meter" aria-hidden="true">
			<svg viewBox="0 0 120 120">
				<circle class="meter-track" cx="60" cy="60" r="52" />
				<circle
					class="meter-fill"
					cx="60"
					cy="60"
					r="52"
					pathLength="100"
					stroke-dasharray="{Math.max(progress * 100, 2)} 100"
				/>
			</svg>
			<span class="meter-value">{Math.round(progress * 100)}%</span>
			<span class="meter-note">of the way to a new budget</span>
		</div>
	</section>

	<section class="panel" aria-labelledby="cycle-heading">
		<h2 id="cycle-heading">The yearly cycle</h2>
		<p class="muted">Sacramento's fiscal year runs from July 1 to June 30.</p>

		<div class="gantt" aria-hidden="true">
			<span></span>
			{#each MONTHS as m, i (m)}
				<span class="g-month" class:on={col(month) === i + 1 && !quiet}>{m}</span>
			{/each}
			{#each phases as p, i (p.id)}
				{@const start = col(p.months[0]) + 1}
				<span class="g-label" class:active={p.id === current.id && !quiet} style:grid-row={i + 2}
					><i style:background={color[p.id]}></i>{p.title}</span
				>
				<span
					class="g-bar"
					class:active={p.id === current.id && !quiet}
					style:grid-row={i + 2}
					style:grid-column="{start} / {start + p.months.length}"
					style:background={color[p.id]}
				></span>
			{/each}
			{#if !quiet}
				<span class="g-now" style:grid-column={col(month) + 1}></span>
			{/if}
		</div>

		<ol class="phases">
			{#each phases as p, i (p.id)}
				{@const isNow = p.id === current.id && !quiet}
				<li class="phase" class:now-phase={isNow} style:--phase={color[p.id]}>
					<div class="phase-head">
						<span class="num" aria-hidden="true">{i + 1}</span>
						<span class="when"
							>{monthName(p.months[0])}{p.months.length > 1
								? `–${monthName(p.months.at(-1)!)}`
								: ''}</span
						>
						{#if isNow}<span class="badge">Happening now</span>{/if}
					</div>
					<h3>{p.title}</h3>
					<p>{p.summary}</p>
					{#if p.yourVoice}
						<p class="voice"><strong>Your voice:</strong> {p.yourVoice}</p>
					{/if}
				</li>
			{/each}
		</ol>
	</section>

	<section class="panel" aria-labelledby="coming-heading">
		<h2 id="coming-heading">Coming up</h2>
		{#if upcoming.length}
			<ul class="upcoming">
				{#each upcoming as e (e.date + e.title)}
					<li>
						<time datetime={e.date}>{longDate(e)}{e.time ? `, ${e.time}` : ''}</time>
						<span>{e.title}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="callout">
				The City hasn't published dates for the next cycle yet; it usually does in the fall. Until
				then, the <a href="https://www.cityofsacramento.gov/finance/budget">City's budget page</a> has
				the latest news, and the steps below show how last year's cycle went.
			</p>
		{/if}
	</section>

	<section class="panel" aria-labelledby="last-heading">
		<h2 id="last-heading">The {cycle.label} budget, step by step</h2>
		<dl class="stat-grid">
			<div>
				<dt>Adopted</dt>
				<dd class="stat-value">{fmt(cycle.adopted, { month: 'short', day: 'numeric' })}</dd>
				<dd class="stat-note">{fmt(cycle.adopted, { year: 'numeric' })}</dd>
			</div>
			<div>
				<dt>All funds</dt>
				<dd class="stat-value">{cycle.totals.all.replace(' billion', 'B')}</dd>
				<dd class="stat-note">{cycle.totals.all}</dd>
			</div>
			<div>
				<dt>General Fund</dt>
				<dd class="stat-value">{cycle.totals.generalFund.replace(' million', 'M')}</dd>
				<dd class="stat-note">The City's flexible money</dd>
			</div>
			<div>
				<dt>Gap closed</dt>
				<dd class="stat-value">{cycle.totals.gapClosed.replace(' million', 'M')}</dd>
				<dd class="stat-note">Mostly with ongoing fixes</dd>
			</div>
		</dl>
		{#if adoptedYear}
			<p>
				<a class="arrow" href={resolve('/budget/[year]/flow', { year: adoptedYear.id })}
					>See where the {cycle.label} money goes</a
				>
			</p>
		{/if}

		<ol class="timeline">
			{#each events as e (e.date + e.title)}
				{@const past = (e.until ?? e.date) < todayIso}
				<li class:past style:--phase={color[e.phase]}>
					<div class="date" aria-hidden="true">
						<span class="mon">{fmt(e.date, { month: 'short' })}</span>
						<span class="day">{fmt(e.date, { day: 'numeric' })}</span>
						<span class="yr">{fmt(e.date, { year: 'numeric' })}</span>
					</div>
					<span class="dot" aria-hidden="true"></span>
					<article>
						<p class="meta">
							<span class="tag">{kindLabel[e.kind]}</span>
							<span>{phaseTitle[e.phase]}</span>
						</p>
						<h3>{e.title}</h3>
						<p class="when-full">
							<time datetime={e.date}>{longDate(e)}</time>{e.time ? `, ${e.time}` : ''}
						</p>
						{#if e.body}<p>{e.body}</p>{/if}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external site -->
						<a class="source" href={e.source}
							>Source<span class="visually-hidden">: {e.title}</span></a
						>
					</article>
				</li>
			{/each}
		</ol>
	</section>

	<section class="panel" aria-labelledby="involved-heading">
		<h2 id="involved-heading">Get involved</h2>
		<ul class="involve">
			{#each getInvolved as g (g.title)}
				<li>
					<h3>{g.title}</h3>
					<p>{g.body}</p>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external site -->
					<a class="arrow external" href={g.href}>{g.cta}</a>
				</li>
			{/each}
		</ul>
	</section>

	<p class="muted notes">
		Dates come from City Council reports, budget documents and the City's news site, and each step
		links to its source. The City sometimes moves hearings, so check the meeting agenda before you
		go.
	</p>
</div>

<style>
	.panel {
		margin-top: 4rem;
	}
	.panel > h2 {
		margin: 0 0 0.25rem;
	}

	/* Right now */
	.now {
		display: grid;
		gap: 1.5rem;
		align-items: center;
		margin-top: 2rem;
		padding: clamp(1.25rem, 3vw, 2rem);
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 3);
		background:
			radial-gradient(circle at 100% 0%, var(--primary-soft), transparent 60%), var(--raised);
		box-shadow: var(--shadow);
	}
	.now h2 {
		margin: 0.25rem 0 0.5rem;
		font-size: clamp(1.6rem, 3.5vw, 2.25rem);
		letter-spacing: -0.02em;
	}
	.now p {
		margin: 0.5rem 0 0;
		max-width: 44rem;
	}
	.now-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.pulse {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		background: var(--primary);
		box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 60%, transparent);
		animation: pulse 2s infinite;
	}
	@keyframes pulse {
		70% {
			box-shadow: 0 0 0 0.6rem transparent;
		}
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
	}
	.voice {
		padding: 0.6rem 0.9rem;
		border-left: 4px solid var(--accent);
		background: var(--surface);
	}
	.meter {
		position: relative;
		display: none;
		place-items: center;
		width: 9rem;
		justify-self: center;
		text-align: center;
	}
	.meter svg {
		width: 9rem;
		height: 9rem;
		transform: rotate(-90deg);
	}
	.meter circle {
		fill: none;
		stroke-width: 10;
	}
	.meter-track {
		stroke: var(--surface);
	}
	.meter-fill {
		stroke: var(--primary);
		stroke-linecap: round;
	}
	.meter-value {
		position: absolute;
		top: 3.1rem;
		font-size: 1.6rem;
		font-weight: 800;
		color: var(--text-strong);
	}
	.meter-note {
		font-size: 0.8rem;
		color: var(--text-muted);
	}

	/* Gantt overview: desktop only, the cards below carry the same content. */
	.gantt {
		display: none;
	}
	@media (min-width: 56rem) {
		.now {
			grid-template-columns: 1fr auto;
		}
		.meter {
			display: grid;
		}
		.gantt {
			display: grid;
			grid-template-columns: 15rem repeat(11, 1fr);
			grid-template-rows: auto repeat(6, 2.25rem);
			align-items: center;
			margin: 1.5rem 0 2rem;
			padding: 1rem 1.25rem;
			border: 1px solid var(--border);
			border-radius: calc(var(--radius) * 3);
			background: var(--surface);
		}
		.g-month {
			justify-self: center;
			padding: 0.1rem 0.5rem;
			border-radius: 999px;
			font-size: 0.8rem;
			font-weight: 700;
			color: var(--text-muted);
		}
		.g-month.on {
			background: var(--text-strong);
			color: var(--page);
		}
		.g-label {
			grid-column: 1;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			font-size: 0.9rem;
			font-weight: 600;
			color: var(--text);
		}
		.g-label.active {
			font-weight: 800;
			color: var(--text-strong);
		}
		.g-label i {
			width: 0.7rem;
			height: 0.7rem;
			border-radius: 50%;
		}
		.g-bar {
			height: 1.1rem;
			margin: 0 3px;
			border-radius: 999px;
			opacity: 0.55;
		}
		.g-bar.active {
			height: 1.5rem;
			opacity: 1;
		}
		.g-now {
			grid-row: 2 / -1;
			justify-self: center;
			align-self: stretch;
			width: 2px;
			background: var(--text-strong);
			pointer-events: none;
		}
	}

	/* Phase cards */
	.phases {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
		gap: 1rem;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
	}
	.phase {
		position: relative;
		padding: 1.25rem 1.25rem 1.25rem 1.5rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 2);
		background: var(--raised);
		overflow: hidden;
	}
	.phase::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 6px;
		background: var(--phase);
	}
	.phase.now-phase {
		border-color: var(--text-strong);
		box-shadow: var(--shadow);
	}
	.phase-head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.num {
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 50%;
		font-weight: 800;
		background: var(--phase);
		color: var(--tile-text);
	}
	.when {
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.badge {
		margin-left: auto;
		white-space: nowrap;
		padding: 0.1rem 0.55rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 800;
		background: var(--text-strong);
		color: var(--page);
	}
	.phase h3 {
		margin: 0.75rem 0 0.4rem;
		font-size: 1.2rem;
	}
	.phase p {
		margin: 0.4rem 0 0;
	}
	.phase .voice {
		font-size: 0.95rem;
	}

	/* Coming up */
	.upcoming {
		display: grid;
		gap: 0.5rem;
		padding: 0;
		list-style: none;
	}
	.upcoming li {
		display: grid;
		gap: 0.1rem;
		padding: 0.75rem 1rem;
		border-left: 4px solid var(--primary);
		background: var(--surface);
	}
	.upcoming time {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--text-muted);
	}
	.callout {
		max-width: 48rem;
		padding: 1rem 1.25rem;
		border: 1px dashed var(--border-strong);
		border-radius: calc(var(--radius) * 2);
	}

	/* Step-by-step timeline */
	.timeline {
		position: relative;
		margin: 2rem 0 0;
		padding: 0;
		list-style: none;
	}
	.timeline::before {
		content: '';
		position: absolute;
		top: 0.5rem;
		bottom: 0.5rem;
		left: 4.75rem;
		width: 2px;
		background: var(--border);
	}
	.timeline li {
		position: relative;
		display: grid;
		grid-template-columns: 4rem 1.5rem 1fr;
		gap: 0 0.75rem;
		padding-bottom: 1.25rem;
	}
	.date {
		display: grid;
		justify-items: end;
		line-height: 1.1;
		padding-top: 0.6rem;
	}
	.mon {
		font-size: 0.75rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
	.day {
		font-size: 1.6rem;
		font-weight: 800;
		color: var(--text-strong);
		font-variant-numeric: tabular-nums;
	}
	.yr {
		font-size: 0.75rem;
		color: var(--text-muted);
	}
	.dot {
		z-index: 1;
		justify-self: center;
		width: 1rem;
		height: 1rem;
		margin-top: 1rem;
		border: 3px solid var(--page);
		border-radius: 50%;
		background: var(--phase);
		box-shadow: 0 0 0 2px var(--phase);
	}
	.timeline article {
		padding: 0.9rem 1.1rem;
		border: 1px solid var(--border);
		border-radius: calc(var(--radius) * 2);
		background: var(--raised);
	}
	.timeline h3 {
		margin: 0.35rem 0 0.2rem;
		font-size: 1.1rem;
	}
	.timeline article p {
		margin: 0.3rem 0 0;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.6rem;
		font-size: 0.8rem;
		color: var(--text-muted);
	}
	.tag {
		padding: 0.05rem 0.5rem;
		border-radius: 999px;
		font-weight: 700;
		border: 1px solid var(--border-strong);
		color: var(--text);
	}
	.when-full {
		font-size: 0.9rem;
		color: var(--text-muted);
	}
	.source {
		display: inline-block;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	/* Get involved */
	.involve {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
		gap: 1rem;
		margin: 1.5rem 0 0;
		padding: 0;
		list-style: none;
	}
	.involve li {
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		border: 1px solid var(--border);
		border-top: 4px solid var(--accent);
		border-radius: calc(var(--radius) * 2);
		background: var(--raised);
	}
	.involve h3 {
		margin: 0 0 0.4rem;
		font-size: 1.15rem;
	}
	.involve p {
		flex: 1;
		margin: 0 0 0.75rem;
	}
	.notes {
		margin-top: 3rem;
		font-size: 0.95rem;
	}

	@media (max-width: 30rem) {
		.timeline::before {
			left: 3.6rem;
		}
		.timeline li {
			grid-template-columns: 3rem 1rem 1fr;
			gap: 0 0.5rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse {
			animation: none;
		}
	}
</style>

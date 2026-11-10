/**
 * Sacramento's budget calendar, shown on /budget-process/.
 *
 * Updating it each year: add the new cycle's dates to `events` as the City
 * announces them (the Budget Division posts the calendar each fall, usually
 * in a Council report on the Budget Development Policy), and change
 * `cycle` to match. Keep a source link on every event.
 *
 * Phases describe the usual yearly rhythm and rarely change.
 */

export type PhaseId = 'priorities' | 'midyear' | 'workshops' | 'proposed' | 'hearings' | 'adoption';

export interface Phase {
	id: PhaseId;
	title: string;
	/** Months the phase usually spans, 1 = January. */
	months: number[];
	summary: string;
	/** How residents can weigh in during this phase, if they can. */
	yourVoice?: string;
}

export type EventKind = 'council' | 'committee' | 'release' | 'public' | 'milestone';

export interface BudgetEvent {
	/** YYYY-MM-DD. */
	date: string;
	/** Last day, for events that span several days. */
	until?: string;
	/** Local time, as the City lists it, e.g. "5:00 PM". */
	time?: string;
	title: string;
	body?: string;
	phase: PhaseId;
	kind: EventKind;
	source: string;
}

/** The yearly rhythm, in order. Sacramento's fiscal year runs July 1 to June 30. */
export const phases: Phase[] = [
	{
		id: 'priorities',
		title: 'Priorities and public input',
		months: [9, 10, 11, 12, 1],
		summary:
			'The Council sets its priorities and adopts a Budget Development Policy. Departments start looking for savings, and the City asks residents what matters most.',
		yourVoice: 'Take the City’s budget survey, usually open from October to January.'
	},
	{
		id: 'midyear',
		title: 'Midyear review',
		months: [2],
		summary:
			'Staff report how the current year is going and confirm the size of next year’s gap between expected revenue and costs.'
	},
	{
		id: 'workshops',
		title: 'Early budget work sessions',
		months: [3],
		summary:
			'Departments present options to the Council at weekly sessions, including what cuts or new revenue would mean for services.',
		yourVoice: 'Comment on each session’s agenda, in person or online.'
	},
	{
		id: 'proposed',
		title: 'Proposed budget',
		months: [4],
		summary:
			'The City Manager releases a balanced proposed budget for the coming year, with a short Budget in Brief.'
	},
	{
		id: 'hearings',
		title: 'Budget hearings',
		months: [5],
		summary:
			'The Council works through the proposal in public hearings, along with the five-year capital plan, fees and charges, and the Measure U budget.',
		yourVoice: 'This is the best time to speak up: every hearing takes public comment.'
	},
	{
		id: 'adoption',
		title: 'Adoption',
		months: [6, 7],
		summary:
			'The Council adopts the budget, which it must do by June 30. The new fiscal year starts on July 1.',
		yourVoice: 'Comment on the adoption item before the vote.'
	}
];

/** The most recent full cycle in `events`. */
export const cycle = {
	label: 'FY 2026–27',
	/** The budget year the cycle produced, as a site year id. */
	yearId: 'FY27',
	adopted: '2026-06-09',
	totals: { all: '$1.7 billion', generalFund: '$898.3 million', gapClosed: '$66.2 million' }
};

const council =
	'https://www.cityofsacramento.gov/content/dam/portal/finance/Budget/fy26-27-budget-development/2025-01717_Oct_7_Council_Report.pdf';
const midyear =
	'https://www.cityofsacramento.gov/content/dam/portal/finance/Budget/fy26-27-budget-development/FY26%20Midyear%20Presentation.pdf';
const brief =
	'https://www.cityofsacramento.gov/content/dam/portal/finance/Budget/26-27-proposed/Proposed%20Budget%20in%20Brief.pdf';

/** Oldest first. */
export const events: BudgetEvent[] = [
	{
		date: '2025-09-30',
		title: 'Council priority-setting workshop',
		phase: 'priorities',
		kind: 'council',
		source: brief
	},
	{
		date: '2025-10-07',
		title: 'Council adopts the Budget Development Policy',
		body: 'Sets the rules for building the FY 2026–27 budget and the year’s hearing calendar.',
		phase: 'priorities',
		kind: 'council',
		source: council
	},
	{
		date: '2025-10-22',
		until: '2026-01-18',
		title: 'Resident budget survey',
		body: 'Open online in English and seven other languages.',
		phase: 'priorities',
		kind: 'public',
		source:
			'https://sacramentocityexpress.com/2025/10/22/city-of-sacramento-seeks-public-input-for-fiscal-year-2026-27-budget/'
	},
	{
		date: '2026-02-03',
		time: '11:00 AM',
		title: 'Midyear update at the Budget and Audit Committee',
		phase: 'midyear',
		kind: 'committee',
		source: midyear
	},
	{
		date: '2026-02-10',
		title: 'Midyear update to the Council: a $66.2 million gap',
		body: 'Costs were growing faster than revenue, leaving a projected General Fund shortfall for FY 2026–27.',
		phase: 'midyear',
		kind: 'council',
		source:
			'https://sacramentocityexpress.com/2026/02/12/city-of-sacramento-announces-66-2-million-budget-deficit-here-is-what-happens-next/'
	},
	{
		date: '2026-03-03',
		until: '2026-03-24',
		time: '2:00 PM',
		title: 'Early budget work sessions',
		body: 'Four Tuesday sessions (March 3, 10, 17 and 24). Departments modeled 15% cuts to their General Fund use and showed what each would mean for services.',
		phase: 'workshops',
		kind: 'council',
		source:
			'https://sacramentocityexpress.com/2026/03/04/city-begins-early-budget-council-work-sessions-on-66-2-million-deficit/'
	},
	{
		date: '2026-04-29',
		title: 'Proposed budget released',
		body: '$1.7 billion across all funds, including an $898.3 million General Fund, with the $66.2 million gap closed.',
		phase: 'proposed',
		kind: 'release',
		source:
			'https://sacramentocityexpress.com/2026/04/29/city-releases-proposed-budget-for-fiscal-year-2026-27/'
	},
	{
		date: '2026-05-05',
		time: '5:00 PM',
		title: 'First budget hearing: overview',
		body: 'The Budget and Audit Committee reviewed fees and charges earlier the same day.',
		phase: 'hearings',
		kind: 'council',
		source: council
	},
	{
		date: '2026-05-12',
		time: '2:00 PM',
		title: 'Capital plan, fees and the budget equity lens, then deliberations',
		phase: 'hearings',
		kind: 'council',
		source: council
	},
	{
		date: '2026-05-18',
		time: '5:30 PM',
		title: 'Measure U budget overview',
		body: 'With the Measure U committee.',
		phase: 'hearings',
		kind: 'committee',
		source: council
	},
	{
		date: '2026-05-26',
		time: '11:00 AM',
		title: 'Budget and Audit Committee recommends adoption',
		phase: 'hearings',
		kind: 'committee',
		source: council
	},
	{
		date: '2026-06-09',
		time: '5:00 PM',
		title: 'Council adopts the FY 2026–27 budget',
		body: 'About three quarters of the balancing solutions are ongoing, which shrinks future gaps.',
		phase: 'adoption',
		kind: 'council',
		source:
			'https://sacramentocityexpress.com/2026/06/10/city-council-adopts-1-7-billion-budget-focused-on-fiscal-stability-and-council-priorities/'
	},
	{
		date: '2026-07-01',
		title: 'FY 2026–27 begins',
		phase: 'adoption',
		kind: 'milestone',
		source:
			'https://sacramentocityexpress.com/2026/06/10/city-council-adopts-1-7-billion-budget-focused-on-fiscal-stability-and-council-priorities/'
	}
];

/** Ways to take part, any time of year. */
export const getInvolved = [
	{
		title: 'Comment on a meeting',
		body: 'Send an eComment on any Council or committee agenda item, or speak in person.',
		href: 'https://publiccomment.cityofsacramento.gov/',
		cta: 'Open eComment'
	},
	{
		title: 'Watch the hearings',
		body: 'Council meetings stream live, and past meetings are archived with their agendas.',
		href: 'https://sacramento.granicus.com/ViewPublisher.php?view_id=21',
		cta: 'Meeting videos'
	},
	{
		title: 'Read the budget',
		body: 'The City posts the proposed and approved budgets, and a short Budget in Brief.',
		href: 'https://www.cityofsacramento.gov/finance/budget',
		cta: 'Budget documents'
	},
	{
		title: 'Talk to your councilmember',
		body: 'Tell the Mayor and your district’s councilmember what you want funded.',
		href: 'https://www.cityofsacramento.gov/mayor-council',
		cta: 'Find your council district'
	}
];

/** The phase the calendar is usually in during a month (1 = January). */
export function phaseForMonth(month: number): Phase {
	return phases.find((p) => p.months.includes(month)) ?? phases[0];
}

/**
 * Where a month sits in the cycle, from 0 (September, the start) to 1 (July,
 * the new fiscal year). August, the quiet month, counts as the start.
 */
export function cycleProgress(month: number): number {
	const fromSeptember = (month - 9 + 12) % 12;
	return Math.min(fromSeptember, 10) / 10;
}

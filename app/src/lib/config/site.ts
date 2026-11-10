import { latestYear } from './years.ts';

export const siteName = 'Open Budget: Sacramento';

export interface NavLink {
	label: string;
	/** App path (resolved with `resolve()`), or an absolute https URL for external sites. */
	href: string;
}

export interface NavGroup {
	label: string;
	links: NavLink[];
}

export const primaryNav: NavGroup[] = [
	{
		label: 'Budget',
		links: [
			{ label: 'Cash Flow', href: `/budget/${latestYear.id}/flow` },
			{ label: 'Detailed Breakdown', href: `/budget/${latestYear.id}/tree` },
			{ label: 'All Budget Years', href: '/budget' },
			{ label: 'Budget Visuals', href: '/budget-visuals' },
			{ label: 'Budget Process', href: '/budget-process' },
			{ label: 'Budget Basics', href: '/sacramento-budget-basics' }
		]
	},
	{
		label: 'About',
		links: [
			{ label: 'Who We Are', href: '/who-we-are' },
			{ label: 'What We Do', href: '/what-we-do' },
			{ label: 'News', href: '/news' },
			{ label: 'Contact Us', href: '/contact' }
		]
	},
	{
		label: 'Resources',
		links: [
			{ label: 'Tools and Projects', href: '/tools-projects' },
			{ label: 'City Budget Office', href: 'https://www.cityofsacramento.org/Finance/Budget' },
			{
				label: 'Budget Open Data',
				href: 'https://data.cityofsacramento.org/datasets/7b8b3680603c4894bd3faaa41c986c7c_0/explore'
			},
			{ label: 'Measure Z', href: '/measure-z' },
			{ label: 'Give Feedback', href: '/feedback' }
		]
	}
];

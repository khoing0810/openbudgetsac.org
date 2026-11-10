import { error } from '@sveltejs/kit';
import { budgetYears, findYear } from '#lib/config/years.ts';
import type { EntryGenerator, PageLoad } from './$types';

export const entries: EntryGenerator = () => budgetYears.map((y) => ({ year: y.id }));

// Tree data (~150 KB per account) is fetched in the browser on demand, so the
// prerendered page stays small and switching accounts doesn't reload the page.
export const load: PageLoad = ({ params }) => {
	const year = findYear(params.year);
	if (!year) error(404, `No budget data for ${params.year}`);
	return { year: { id: year.id, label: year.label } };
};

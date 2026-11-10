import { loadCompareData } from '#lib/server/compare.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ compare: await loadCompareData() });

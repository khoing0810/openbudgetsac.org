import { json } from '@sveltejs/kit';
import { loadExploreData } from '#lib/server/explore.ts';
import type { RequestHandler } from './$types';

// Written once at build time as a static file the Explore page fetches.
export const prerender = true;
export const trailingSlash = 'never';

export const GET: RequestHandler = async () => json(await loadExploreData());

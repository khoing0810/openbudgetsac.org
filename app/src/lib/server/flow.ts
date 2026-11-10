import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { csvParse } from 'd3-dsv';
import { dataPaths, type BudgetYear } from '#lib/config/years.ts';
import { buildFlowGraph, type FlowGraph } from '#lib/viz/flow/graph.ts';

/** Reads a year's flow CSV from static/ and builds its graph. Build time only. */
export async function loadFlowGraph(year: BudgetYear): Promise<FlowGraph> {
	const csv = await readFile(join(process.cwd(), 'static', dataPaths.flow(year.id)), 'utf8');
	return buildFlowGraph(csvParse(csv.replace(/^\uFEFF/, '')), year.flow);
}

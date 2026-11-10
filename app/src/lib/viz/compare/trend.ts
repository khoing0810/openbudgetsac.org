import { scaleLinear, scalePoint } from 'd3-scale';
import { line } from 'd3-shape';

export interface TrendSeries {
	id: string;
	label: string;
	/** One value per year, null for a gap. */
	values: (number | null)[];
}

export interface TrendLayout {
	x: number[];
	ticks: { y: number; value: number }[];
	lines: {
		id: string;
		label: string;
		path: string;
		points: { x: number; y: number; value: number; year: string }[];
	}[];
}

export interface TrendOptions {
	width: number;
	height: number;
	margin?: { top: number; right: number; bottom: number; left: number };
}

/** Lays out a multi-line chart over years. The y axis starts at zero so changes aren't exaggerated. */
export function layoutTrend(
	years: readonly string[],
	series: readonly TrendSeries[],
	{ width, height, margin = { top: 12, right: 12, bottom: 28, left: 56 } }: TrendOptions
): TrendLayout {
	const xScale = scalePoint<string>()
		.domain(years)
		.range([margin.left, width - margin.right])
		.padding(0.3);
	const max = Math.max(
		1,
		...series.flatMap((s) => s.values.filter((v): v is number => v !== null))
	);
	const yScale = scaleLinear()
		.domain([0, max])
		.nice(4)
		.range([height - margin.bottom, margin.top]);

	const gen = line<{ x: number; y: number } | null>()
		.defined((d) => d !== null)
		.x((d) => d!.x)
		.y((d) => d!.y);

	return {
		x: years.map((y) => xScale(y) ?? 0),
		ticks: yScale.ticks(4).map((value) => ({ value, y: yScale(value) })),
		lines: series.map((s) => {
			const pts = s.values.map((v, i) =>
				v === null ? null : { x: xScale(years[i]) ?? 0, y: yScale(v), value: v, year: years[i] }
			);
			return {
				id: s.id,
				label: s.label,
				path: gen(pts) ?? '',
				points: pts.filter((p): p is NonNullable<typeof p> => p !== null)
			};
		})
	};
}

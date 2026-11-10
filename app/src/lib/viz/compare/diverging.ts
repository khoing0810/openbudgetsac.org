/**
 * Lays out a diverging bar chart in percentages of the plot width, so it can
 * be drawn with plain HTML and stay readable at any width. Decreases grow left
 * from a shared zero line, increases grow right.
 */
export interface DivergingBar {
	/** Left edge of the bar, 0–100. */
	left: number;
	/** Bar width, 0–100. */
	width: number;
	direction: 'up' | 'down' | 'flat';
}

export interface DivergingLayout {
	/** Position of the zero line, 0–100. */
	zero: number;
	bars: DivergingBar[];
}

export function layoutDiverging(values: readonly number[]): DivergingLayout {
	const min = Math.min(0, ...values);
	const max = Math.max(0, ...values);
	const span = max - min || 1;
	const pos = (v: number) => ((v - min) / span) * 100;
	const zero = pos(0);
	return {
		zero,
		bars: values.map((v) => {
			const p = pos(v);
			return {
				left: Math.min(zero, p),
				width: Math.abs(p - zero),
				direction: v > 0 ? 'up' : v < 0 ? 'down' : 'flat'
			};
		})
	};
}

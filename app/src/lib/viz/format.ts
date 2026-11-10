import { format } from 'd3-format';

const whole = format(',.0f');
const compact = format('.3~s');

/** `$1,234,567` */
export const formatUsd = (value: number): string =>
	value < 0 ? `-$${whole(-value)}` : `$${whole(value)}`;

/** `$1.23B`, `$45.6M`, `$789k` for tight labels. */
export const formatUsdCompact = (value: number): string => {
	const sign = value < 0 ? '-' : '';
	return `${sign}$${compact(Math.abs(value)).replace('G', 'B')}`;
};

/** `12.3%` */
export const formatShare = (part: number, whole: number): string =>
	whole === 0 ? '0%' : `${((part / whole) * 100).toFixed(1)}%`;

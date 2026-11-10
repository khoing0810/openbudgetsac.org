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

const MINUS = '\u2212';

/** `+$12.3M`, `−$4.5M`, `$0` — a change, always signed. */
export const formatUsdChange = (value: number): string =>
	value === 0 ? '$0' : `${value > 0 ? '+' : MINUS}${formatUsdCompact(Math.abs(value))}`;

/** `+5.1%`, `−12.0%`, or an em dash when there is no base. */
export const formatPctChange = (pct: number | null, digits = 1): string =>
	pct === null
		? '—'
		: pct === 0
			? '0%'
			: `${pct > 0 ? '+' : MINUS}${Math.abs(pct).toFixed(digits)}%`;

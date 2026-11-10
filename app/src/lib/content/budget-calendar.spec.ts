import { describe, expect, it } from 'vitest';
import { cycle, cycleProgress, events, phaseForMonth, phases } from './budget-calendar.ts';

describe('budget calendar data', () => {
	it('lists events oldest first, each with a real date and a source', () => {
		const dates = events.map((e) => e.date);
		expect(dates).toEqual([...dates].sort());
		for (const e of events) {
			expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(Number.isNaN(Date.parse(e.date))).toBe(false);
			if (e.until) expect(e.until > e.date).toBe(true);
			expect(e.source).toMatch(/^https:\/\//);
			expect(phases.some((p) => p.id === e.phase)).toBe(true);
		}
	});

	it('includes the adoption date of the cycle it summarizes', () => {
		expect(events.some((e) => e.date === cycle.adopted && e.phase === 'adoption')).toBe(true);
	});

	it('covers every month but August with exactly one phase', () => {
		for (let m = 1; m <= 12; m++) {
			const owners = phases.filter((p) => p.months.includes(m));
			expect(owners).toHaveLength(m === 8 ? 0 : 1);
		}
	});
});

describe('phaseForMonth', () => {
	it('finds the usual phase for a month', () => {
		expect(phaseForMonth(11).id).toBe('priorities');
		expect(phaseForMonth(2).id).toBe('midyear');
		expect(phaseForMonth(5).id).toBe('hearings');
		expect(phaseForMonth(6).id).toBe('adoption');
	});
});

describe('cycleProgress', () => {
	it('runs from September (0) to July (1)', () => {
		expect(cycleProgress(9)).toBe(0);
		expect(cycleProgress(11)).toBeCloseTo(0.2);
		expect(cycleProgress(4)).toBeCloseTo(0.7);
		expect(cycleProgress(7)).toBe(1);
		expect(cycleProgress(8)).toBe(1);
	});
});

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
	'/',
	'/budget/',
	'/budget/FY26/flow/',
	'/budget/FY26/tree/',
	'/who-we-are/',
	'/budget-visuals/',
	'/measure-z/'
];

test('home page links to the latest budget', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Open Budget: Sacramento/);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('flow chart renders for the latest year', async ({ page }) => {
	await page.goto('/budget/FY26/flow/');
	const chart = page.locator('figure.flow svg');
	await expect(chart).toBeVisible();
	expect(await chart.locator('.links path').count()).toBeGreaterThan(10);
});

test('year picker switches the flow chart to another year', async ({ page }) => {
	await page.goto('/budget/FY26/flow/');
	await page.getByLabel('Fiscal year').selectOption('FY20');
	await expect(page).toHaveURL(/\/budget\/FY20\/flow\/$/);
	await expect(page.locator('figure.flow svg')).toBeVisible();
});

test('treemap drills down and back up', async ({ page }) => {
	await page.goto('/budget/FY26/tree/');
	const tiles = page.locator('.tile rect[role="button"]');
	await expect(tiles.first()).toBeVisible();
	const name = (await tiles.first().getAttribute('aria-label'))!.split(':')[0];
	await tiles.first().click();
	const crumbs = page.getByRole('navigation', { name: 'Breakdown level' });
	await expect(crumbs.getByText(name, { exact: true })).toBeVisible();
	await crumbs.getByRole('button').first().click();
	await expect(crumbs.getByRole('button')).toHaveCount(0);
});

test('legacy chart URLs redirect to the latest year', async ({ page }) => {
	await page.goto('/adopted-budget-flow/');
	await expect(page).toHaveURL(/\/budget\/FY26\/flow\/$/);
});

test('unknown pages show the not-found page', async ({ page }) => {
	const res = await page.goto('/no-such-page/');
	expect(res?.status()).toBe(404);
});

for (const path of pages) {
	test(`${path} has no detectable WCAG A/AA violations`, async ({ page }) => {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
	});
}

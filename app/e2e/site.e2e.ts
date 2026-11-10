import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
	'/',
	'/budget/',
	'/budget/FY26/flow/?view=flow',
	'/budget/FY26/flow/?view=bars',
	'/budget/FY26/tree/',
	'/budget/FY26/tree/?account=revenue&by=fund',
	'/who-we-are/',
	'/budget-visuals/',
	'/measure-z/',
	'/compare/',
	'/budget-process/',
	'/explore/',
	'/explore/?year=FY20&side=revenue&by=fund&department=Utilities'
];

test('home page links to the latest budget', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Open Budget: Sacramento/);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('flow chart renders for the latest year', async ({ page }) => {
	await page.goto('/budget/FY26/flow/?view=flow');
	const chart = page.locator('figure.flow svg');
	await expect(chart).toBeVisible();
	expect(await chart.locator('.links path').count()).toBeGreaterThan(10);
});

test('year picker switches the flow chart to another year', async ({ page }) => {
	await page.goto('/budget/FY26/flow/?view=flow');
	await page.getByLabel('Fiscal year').selectOption('FY20');
	await expect(page).toHaveURL(/\/budget\/FY20\/flow\/\?view=flow$/);
	await expect(page.locator('figure.flow svg')).toBeVisible();
});

test('cash flow leads with a summary and offers a sources and uses view', async ({ page }) => {
	await page.goto('/budget/FY26/flow/?view=flow');
	await expect(page.locator('.headline')).toContainText('planned to take in');
	await expect(page.locator('.stat-grid')).toContainText('General Fund');
	await page.getByRole('radio', { name: 'Sources and uses' }).check();
	await expect(page).toHaveURL(/view=bars/);
	const sources = page.getByRole('region', { name: 'Where the money comes from' });
	expect(await sources.getByRole('listitem').count()).toBeGreaterThan(3);
	await expect(page.getByRole('region', { name: 'Where it goes' })).toBeVisible();
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

test('breakdown search jumps to a department and the link keeps it', async ({ page }) => {
	await page.goto('/budget/FY26/tree/');
	await expect(page.locator('.headline')).toContainText('totals');
	await page.getByLabel(/Find a department/).fill('police');
	await page
		.getByRole('button', { name: /^Police/ })
		.first()
		.click();
	const crumbs = page.getByRole('navigation', { name: 'Breakdown level' });
	await expect(crumbs).toContainText('Police');
	await expect(page).toHaveURL(/p=Police/);
	await page.reload();
	await expect(crumbs).toContainText('Police');
});

test('breakdown switches to revenue grouped by fund', async ({ page }) => {
	await page.goto('/budget/FY26/tree/');
	await page.getByRole('radio', { name: 'Revenue' }).check();
	await page.getByRole('radio', { name: 'Fund' }).check();
	await expect(page).toHaveURL(/account=revenue&by=fund/);
	await expect(page.getByRole('group', { name: /Budget, revenue$/ })).toBeVisible();
});

test('compare reads years from the URL and updates it as you change them', async ({ page }) => {
	await page.goto('/compare/?from=FY20&to=FY26&side=revenue');
	await expect(page.getByLabel('From', { exact: true })).toHaveValue('FY20');
	await expect(page.locator('.headline')).toContainText('Revenue grew');
	await page.getByLabel('From', { exact: true }).selectOption('FY25');
	await expect(page).toHaveURL(/from=FY25/);
	await page.getByRole('button', { name: 'Swap years' }).click();
	await expect(page.getByLabel('From', { exact: true })).toHaveValue('FY26');
	await expect(page.getByLabel('To', { exact: true })).toHaveValue('FY25');
});

test('compare shows changes by department and switches to percent', async ({ page }) => {
	await page.goto('/compare/');
	const rows = page.getByRole('list', { name: /What changed/ }).getByRole('listitem');
	expect(await rows.count()).toBeGreaterThan(10);
	await page.getByRole('radio', { name: 'Percent' }).check();
	await expect(rows.first().locator('.value')).toContainText('%');
	await expect(page.getByRole('table', { name: /Spending by department/ })).toBeVisible();
});

test('explore drills into a department and keeps the view in the link', async ({ page }) => {
	await page.goto('/explore/');
	await expect(page.locator('.headline')).toContainText('All spending in FY 2025–26');
	const bars = page.getByRole('list', { name: /By department/ });
	await bars.getByRole('button', { name: /^Police/ }).click();
	await expect(page).toHaveURL(/department=Police/);
	await expect(page).toHaveURL(/by=category/);
	await expect(page.locator('.headline')).toContainText('Spending for Police');
	await expect(page.locator('#filter-department')).toHaveValue('Police');
	await page.reload();
	await expect(page.locator('.headline')).toContainText('Spending for Police');
	await page.getByRole('button', { name: 'Clear filters' }).click();
	await expect(page).not.toHaveURL(/department=/);
});

test('explore switches year and side, and offers downloads', async ({ page }) => {
	await page.goto('/explore/?year=FY20&side=revenue');
	await expect(page.getByLabel('Fiscal year')).toHaveValue('2020');
	await expect(page.locator('.headline')).toContainText('All revenue in FY 2019–20');
	await expect(
		page.getByRole('table', { name: /Revenue by department, FY 2019–20/ })
	).toBeVisible();
	const download = page.waitForEvent('download');
	await page.getByRole('button', { name: /Download this table/ }).click();
	expect((await download).suggestedFilename()).toBe('sacramento-revenue-FY20-by-department.csv');
	const res = await page.request.get('/data/approved-budgets.csv');
	expect(res.ok()).toBe(true);
});

test('budget process shows where the cycle is and every step of the last one', async ({ page }) => {
	await page.goto('/budget-process/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(
		'How Sacramento builds its budget'
	);
	await expect(page.getByRole('region', { name: 'The yearly cycle' })).toBeVisible();
	await expect(page.locator('.now h2')).not.toBeEmpty();
	await expect(page.locator('.phases > li')).toHaveCount(6);
	await expect(page.locator('.phases .badge')).toHaveCount(1);
	expect(await page.locator('.timeline > li').count()).toBeGreaterThan(8);
	await expect(page.getByRole('link', { name: /Council adopts the FY/ })).toHaveAttribute(
		'href',
		/^https:\/\//
	);
	await expect(page.locator('iframe')).toHaveCount(0);
});

test('legacy chart URLs redirect to the latest year', async ({ page }) => {
	await page.goto('/adopted-budget-flow/');
	await expect(page).toHaveURL(/\/budget\/FY26\/flow\/$/);
});

test('unknown pages show the not-found page', async ({ page }) => {
	const res = await page.goto('/no-such-page/');
	expect(res?.status()).toBe(404);
});

test('theme toggle switches to dark and remembers it', async ({ page }) => {
	await page.emulateMedia({ colorScheme: 'light' });
	await page.goto('/');
	const toggle = page.getByRole('button', { name: 'Dark mode' });
	await expect(toggle).toHaveAttribute('aria-pressed', 'false');
	await toggle.click();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await page.reload();
	await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
});

test('home shows the latest year at a glance', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Total spending')).toBeVisible();
	await expect(page.getByRole('heading', { name: /Biggest departments/ })).toBeVisible();
});

for (const [path, scheme] of pages.flatMap((p) =>
	(['light', 'dark'] as const).map((s) => [p, s] as const)
)) {
	test(`${path} in ${scheme} mode has no detectable WCAG A/AA violations`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await page.goto(path);
		await page.waitForLoadState('networkidle');
		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();
		expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
	});
}

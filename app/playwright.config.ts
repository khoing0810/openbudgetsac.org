import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;

export default defineConfig({
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	forbidOnly: ci,
	retries: ci ? 2 : 0,
	reporter: ci ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry',
		// Lets a machine with a preinstalled Chromium skip `playwright install`.
		launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
			? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
			: {}
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'phone', use: { ...devices['Pixel 7'] } }
	],
	webServer: {
		// CI builds once in an earlier step and sets SKIP_BUILD to reuse it.
		command: process.env.SKIP_BUILD ? 'npm run preview' : 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !ci
	}
});

import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ command }) => ({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Every page is prerendered to static HTML. `404.html` lets static hosts
			// (GitHub Pages, Cloudflare Pages) serve our own not-found page.
			adapter: adapter({ fallback: '404.html', precompress: false, strict: true }),
			paths: {
				// Set BASE_PATH when the site is served from a subpath, e.g. a project page.
				base: command === 'build' ? ((process.env.BASE_PATH ?? '') as '' | `/${string}`) : ''
			}
		})
	],
	server: {
		// Inside Docker on macOS/Windows, file events don't cross the VM boundary.
		watch: process.env.VITE_USE_POLLING ? { usePolling: true, interval: 300 } : undefined
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
}));

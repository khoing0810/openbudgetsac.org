// Copies shared budget data and images from the legacy site (`../_src`) into
// `static/` so both sites read one source of truth while the migration runs.
// The copies are gitignored. Once `_src` is retired, move these into the app.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const legacyDir = join(appDir, '..', '_src');

const copies = [
	['data/flow', 'static/data/flow'],
	['data/tree', 'static/data/tree'],
	['data/compare', 'static/data/compare'],
	['images', 'static/images']
];

for (const [from, to] of copies) {
	const source = join(legacyDir, from);
	const target = join(appDir, to);
	if (!existsSync(source)) {
		console.error(`sync-data: missing ${source}`);
		process.exit(1);
	}
	rmSync(target, { recursive: true, force: true });
	mkdirSync(dirname(target), { recursive: true });
	cpSync(source, target, { recursive: true });
	console.log(`sync-data: ${from} -> ${to}`);
}

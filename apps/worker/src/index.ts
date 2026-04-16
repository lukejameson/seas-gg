import { start as startTides } from '@seas/tide-scraper';
import { start as startSeaTemp } from '@seas/sea-temp-scraper';
import { start as startWeather } from '@seas/weather-service';
import { closePool } from '@seas/database';

async function main() {
	console.log('[Worker] Starting all scrapers...');
	await Promise.all([startTides(), startSeaTemp(), startWeather()]);
}

process.on('SIGTERM', async () => {
	console.log('[Worker] SIGTERM received, shutting down...');
	await closePool();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('[Worker] SIGINT received, shutting down...');
	await closePool();
	process.exit(0);
});

main().catch((err) => {
	console.error('[Worker] Fatal error:', err);
	process.exit(1);
});

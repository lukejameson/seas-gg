import { format } from 'date-fns';
import { db, seaTemp, eq, closePool } from '@seas/database';
import { seaTemperatureScraper } from './scraper.js';

const INTERVAL_MINUTES = parseInt(process.env.SEA_TEMP_SCRAPER_INTERVAL_MINUTES || '30');

/**
 * Scrape and store sea temperature
	 */
async function scrapeAndStoreSeaTemp(): Promise<void> {
	const today = new Date();
	const dateStr = format(today, 'yyyy-MM-dd');

	console.log(`[SeaTempScraper] Starting scrape at ${new Date().toISOString()}`);

	try {
		// Check if we already have data for today
		const existing = await db.query.seaTemp.findFirst({
			where: eq(seaTemp.date, dateStr)
		});

		if (existing?.seaTempC && existing.seaTempC !== 'No Data') {
			console.log(`[SeaTempScraper] Data already exists for ${dateStr}: ${existing.seaTempC}`);
			return;
		}

		// Scrape the temperature
		const temperature = await seaTemperatureScraper.scrapeSeaTempForToday();

		if (!temperature) {
			console.warn(`[SeaTempScraper] No temperature data scraped, storing 'No Data'`);
			await db.insert(seaTemp).values({
				date: dateStr,
				seaTempC: 'No Data'
			}).onConflictDoUpdate({
				target: seaTemp.date,
				set: { seaTempC: 'No Data' }
			});
			return;
		}

		// Store in database
		await db.insert(seaTemp).values({
			date: dateStr,
			seaTempC: temperature
		}).onConflictDoUpdate({
			target: seaTemp.date,
			set: { seaTempC: temperature }
		});

		console.log(`[SeaTempScraper] Successfully stored sea temperature: ${temperature}`);
	} catch (error) {
		console.error('[SeaTempScraper] Error:', error);
	}
}

/**
 * Main function
	 */
async function main(): Promise<void> {
	console.log('[SeaTempScraper] Sea Temperature Scraper Service starting...');
	console.log(`[SeaTempScraper] Scrape interval: ${INTERVAL_MINUTES} minutes`);

	// Run immediately on startup
	await scrapeAndStoreSeaTemp();

	// Set up interval
	const intervalMs = INTERVAL_MINUTES * 60 * 1000;
	console.log(`[SeaTempScraper] Scheduling next run in ${INTERVAL_MINUTES} minutes`);

	setInterval(async () => {
		await scrapeAndStoreSeaTemp();
	}, intervalMs);
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
	console.log('[SeaTempScraper] SIGTERM received, shutting down...');
	await closePool();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('[SeaTempScraper] SIGINT received, shutting down...');
	await closePool();
	process.exit(0);
});

// Start the service
main().catch((error) => {
	console.error('[SeaTempScraper] Fatal error:', error);
	process.exit(1);
});

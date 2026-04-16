import { format } from 'date-fns';
import { db, dailyTides, eq, closePool } from '@seas/database';
import { tideScraper } from './scraper.js';
import { htmlParser } from './parser.js';
import type { Tide } from './types.js';

const INTERVAL_MINUTES = parseInt(process.env.TIDE_SCRAPER_INTERVAL_MINUTES || '60');
const DAYS_TO_SCRAPE = parseInt(process.env.TIDE_SCRAPER_DAYS_AHEAD || '30');

/**
 * Scrape and store tide data for a specific date
	 */
async function scrapeAndStoreTide(date: Date): Promise<void> {
	const dateStr = format(date, 'yyyy-MM-dd');

	try {
		// Check if we already have fresh data
		const existing = await db.query.dailyTides.findFirst({
			where: eq(dailyTides.date, dateStr)
		});

		if (existing) {
			console.log(`[TideScraper] Data already exists for ${dateStr}, skipping`);
			return;
		}

		console.log(`[TideScraper] Scraping tide data for ${dateStr}`);

		// Scrape raw HTML
		const rawTideHtml = await tideScraper.scrapeTidesForDate(date);

		// Parse HTML once, reuse for both extractions
		const $ = htmlParser.parseHtml(rawTideHtml);
		const basicTides = htmlParser.getVerboseBasicTidesTable($);
		const hourlyTides = htmlParser.getHourlyTides($);

		if (!basicTides || basicTides.length === 0) {
			console.warn(`[TideScraper] No basic tides found for ${dateStr}`);
			return;
		}

		// Create tide data object
		const tideData: Tide = {
			id: crypto.randomUUID(),
			date: dateStr,
			basicTides,
			hourlyTides
		};

		// Store in database
		await db.insert(dailyTides).values({
			id: tideData.id,
			date: tideData.date,
			data: tideData
		}).onConflictDoUpdate({
			target: dailyTides.date,
			set: { data: tideData, updatedAt: new Date() }
		});

		console.log(`[TideScraper] Successfully stored tide data for ${dateStr}`);
	} catch (error) {
		console.error(`[TideScraper] Error scraping tides for ${dateStr}:`, error);
	}
}

/**
 * Run the scraper for all dates in range
	 */
async function runScraper(): Promise<void> {
	console.log(`[TideScraper] Starting scrape run at ${new Date().toISOString()}`);

	const today = new Date();

	// Scrape for today and next N days
	for (let i = 0; i <= DAYS_TO_SCRAPE; i++) {
		const date = new Date(today);
		date.setDate(today.getDate() + i);
		await scrapeAndStoreTide(date);
	}

	console.log(`[TideScraper] Completed scrape run at ${new Date().toISOString()}`);
}

/**
 * Main function - runs once and sets up interval
	 */
async function main(): Promise<void> {
	console.log('[TideScraper] Tide Scraper Service starting...');
	console.log(`[TideScraper] Scrape interval: ${INTERVAL_MINUTES} minutes`);
	console.log(`[TideScraper] Days to scrape ahead: ${DAYS_TO_SCRAPE}`);

	// Run immediately on startup
	await runScraper();

	// Set up interval
	const intervalMs = INTERVAL_MINUTES * 60 * 1000;
	console.log(`[TideScraper] Scheduling next run in ${INTERVAL_MINUTES} minutes`);

	setInterval(async () => {
		await runScraper();
	}, intervalMs);
}

export async function start() {
	return main();
}

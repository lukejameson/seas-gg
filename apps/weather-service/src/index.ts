import { format, addDays } from 'date-fns';
import { db, weatherCache, eq, closePool } from '@seas/database';
import { weatherFetcher } from './fetcher.js';

const INTERVAL_MINUTES = parseInt(process.env.WEATHER_SERVICE_INTERVAL_MINUTES || '15');
const DAYS_TO_FETCH = parseInt(process.env.WEATHER_SERVICE_DAYS_AHEAD || '7');

/**
 * Fetch and store weather for a specific date
 */
async function fetchAndStoreWeather(dateStr: string): Promise<void> {
	try {
		// Check if we have fresh data (less than 1 hour old)
		const existing = await db.query.weatherCache.findFirst({
			where: eq(weatherCache.date, dateStr)
		});

		if (existing) {
			const age = Date.now() - new Date(existing.updatedAt!).getTime();
			const oneHour = 60 * 60 * 1000;

			if (age < oneHour) {
				console.log(`[WeatherService] Fresh data exists for ${dateStr}, skipping`);
				return;
			}
		}

		console.log(`[WeatherService] Fetching weather for ${dateStr}`);

		// Fetch from Open-Meteo
		const hourlyData = await weatherFetcher.fetchWeatherForDate(dateStr);

		// Store in database
		await db.insert(weatherCache).values({
			date: dateStr,
			data: hourlyData
		}).onConflictDoUpdate({
			target: weatherCache.date,
			set: {
				data: hourlyData,
				updatedAt: new Date()
			}
		});

		console.log(`[WeatherService] Stored ${hourlyData.length} hourly records for ${dateStr}`);
	} catch (error) {
		console.error(`[WeatherService] Error fetching weather for ${dateStr}:`, error);
	}
}

/**
 * Run the weather fetcher
 */
async function runFetcher(): Promise<void> {
	console.log(`[WeatherService] Starting fetch run at ${new Date().toISOString()}`);

	const today = new Date();

	// Fetch for today and next N days
	for (let i = 0; i <= DAYS_TO_FETCH; i++) {
		const date = addDays(today, i);
		const dateStr = format(date, 'yyyy-MM-dd');
		await fetchAndStoreWeather(dateStr);
	}

	console.log(`[WeatherService] Completed fetch run at ${new Date().toISOString()}`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
	console.log('[WeatherService] Weather Service starting...');
	console.log(`[WeatherService] Fetch interval: ${INTERVAL_MINUTES} minutes`);
	console.log(`[WeatherService] Days to fetch: ${DAYS_TO_FETCH}`);

	// Run immediately on startup
	await runFetcher();

	// Set up interval
	const intervalMs = INTERVAL_MINUTES * 60 * 1000;
	console.log(`[WeatherService] Scheduling next run in ${INTERVAL_MINUTES} minutes`);

	setInterval(async () => {
		await runFetcher();
	}, intervalMs);
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
	console.log('[WeatherService] SIGTERM received, shutting down...');
	await closePool();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('[WeatherService] SIGINT received, shutting down...');
	await closePool();
	process.exit(0);
});

// Start the service
main().catch((error) => {
	console.error('[WeatherService] Fatal error:', error);
	process.exit(1);
});

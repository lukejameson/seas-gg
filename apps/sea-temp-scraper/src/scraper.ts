import { JSDOM } from 'jsdom';

/**
 * Scrapes sea temperature data using a plain HTTP fetch
 */
export class SeaTemperatureScraper {
	private url: string;

	constructor() {
		this.url = process.env.SEA_TEMP_URL || '';
		if (!this.url) {
			throw new Error('SEA_TEMP_URL environment variable is required');
		}
	}

	/**
	 * Scrape sea temperature for today
	 */
	async scrapeSeaTempForToday(): Promise<string | null> {
		console.log(`[SeaTempScraper] Fetching ${this.url}`);

		const response = await fetch(this.url, {
			headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seas-gg/1.0)' }
		});

		if (!response.ok) {
			console.error(`[SeaTempScraper] HTTP ${response.status}`);
			return null;
		}

		const html = await response.text();
		const {
			window: { document }
		} = new JSDOM(html);

		const spans = document.querySelectorAll('span.boldCast');
		for (const span of spans) {
			if (span.textContent?.includes('Sea temperature:')) {
				const parentText = span.parentElement?.textContent ?? '';
				const value = parentText.replace('Sea temperature:', '').trim();
				if (value) {
					console.log(`[SeaTempScraper] Found temperature: ${value}`);
					return value;
				}
			}
		}

		console.warn('[SeaTempScraper] Sea temperature element not found');
		return null;
	}
}

export const seaTemperatureScraper = new SeaTemperatureScraper();

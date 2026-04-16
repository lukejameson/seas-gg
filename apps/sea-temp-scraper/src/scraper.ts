import { load } from 'cheerio';

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
		const $ = load(html);

		let result: string | null = null;
		$('span.boldCast').each((_, el) => {
			if (result) return false;
			if ($(el).text().includes('Sea temperature:')) {
				const value = $(el).parent().text().replace('Sea temperature:', '').trim();
				if (value) {
					console.log(`[SeaTempScraper] Found temperature: ${value}`);
					result = value;
				}
			}
		});

		if (!result) {
			console.warn('[SeaTempScraper] Sea temperature element not found');
		}
		return result;
	}
}

export const seaTemperatureScraper = new SeaTemperatureScraper();

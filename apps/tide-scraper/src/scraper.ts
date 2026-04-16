import { getDayOfYear, getYear } from 'date-fns';

/**
 * Scrapes the tides website
 */
export class TideScraper {
	private tideUrl: string;

	constructor() {
		this.tideUrl = process.env.TIDE_URL || '';
		if (!this.tideUrl) {
			throw new Error('TIDE_URL environment variable is required');
		}
	}

	/**
	 * Scrapes the tides website for the tides of the provided date
	 */
	async scrapeTidesForDate(date: Date): Promise<string> {
		const year = getYear(date);
		const yearDay = getDayOfYear(date);

		const url = new URL(this.tideUrl);
		url.searchParams.set('year', String(year));
		url.searchParams.set('yearDay', String(yearDay));

		console.log(`[TideScraper] Fetching tides for ${date.toISOString().split('T')[0]} from ${url}`);

		const tidesResponse = await fetch(url);

		if (!tidesResponse.ok) {
			throw new Error(`Failed to fetch tides: ${tidesResponse.status} ${tidesResponse.statusText}`);
		}

		return await tidesResponse.text();
	}
}

export const tideScraper = new TideScraper();

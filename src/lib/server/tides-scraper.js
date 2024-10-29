import { env } from '$env/dynamic/private';
import { getDayOfYear, getYear } from 'date-fns';

class TideScraper {
	constructor() {
		this.tideUrl = env.TIDE_URL;
	}

	/**
	 * Scrapes the tides website for the tides of the provided date
	 * @async
	 * @param {Date} date
	 * @returns {Promise<string>}
	 */
	async scrapeTidesForDate(date) {
		const year = getYear(date);
		const yearDay = getDayOfYear(date);

		const url = new URL(`${this.tideUrl}/?year=${year}&yearDay=${yearDay}`);

		const tidesResponse = await fetch(url);

		return await tidesResponse.text();
	}
}

export const tideScraper = new TideScraper();

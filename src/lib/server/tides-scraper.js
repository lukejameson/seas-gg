import { env } from '$env/dynamic/private';
import { addDays, endOfWeek, format, getDayOfYear, getYear, startOfWeek } from 'date-fns';

/**
 * Scrapes the tides website,
 * @class TideScraper
 */
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

	/**
	 *
	 * @param {Date} date
	 */

	async scrapeTidesForWeek(date) {
		const { start } = this.getDateRangeForWeek(date);

		const allTideData = await Promise.all(
			Array.from({ length: 7 }, async (_, i) => {
				const day = addDays(start, i);
				const tide = await this.scrapeTidesForDate(day);

				return { date: day, tide: tide };
			})
		);

		return allTideData;
	}

	/**
	 * @param {Date} date
	 * @returns
	 */

	getDateRangeForWeek(date) {
		// const parsedDate = parseISO(date.toLocaleString())
		const startMonday = startOfWeek(date, { weekStartsOn: 1 });
		const end = endOfWeek(date, { weekStartsOn: 1 });

		return { start: startMonday, end: end };
	}

	/**
	 *
	 * @param {Date} start
	 */

	getAllDaysInWeek(start) {
		if (!start) return;

		try {
			return Array.from({ length: 7 }, (_, i) => {
				const day = addDays(start, i);
				return format(day, 'yyyy-MM-dd');
			});
		} catch (e) {
			console.log(e);
		}
	}
}

export const tideScraper = new TideScraper();

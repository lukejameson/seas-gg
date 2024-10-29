import { differenceInDays, format } from 'date-fns';
import { htmlParser } from './html_parser';
import { tideStorage } from './storage';
import { tideScraper } from './tides-scraper';
import { weatherScraper } from './weather-scraper';
import { tideSequence } from './tide_sequence';

class Main {
	constructor() {}

	/**
	 * Gathers all the data
	 * @private
	 * @param {Date} date
	 * @returns {Promise<void>}
	 */
	async processTideWeatherData(date) {
		const rawTideHtml = await tideScraper.scrapeTidesForDate(date);
		const weather = await weatherScraper.getWeatherForDate(format(date, 'yyyy-MM-dd'));
		const basicTides = htmlParser.getBasicTidesTable(rawTideHtml);
		const hourlyTides = htmlParser.getHourlyTides(rawTideHtml);
        const dailyExtremes = tideSequence.processTideData(hourlyTides)

		/** @type {Tide[]} */
		const tideData = [
			{
				id: crypto.randomUUID(),
				date: format(new Date(date), 'yyyy-MM-dd'),
				weather: weather,
				basicTides: basicTides,
				hourlyTides: hourlyTides,
                dailyExtremes: dailyExtremes
			}
		];

		if (!tideData) return;
		await tideStorage.saveTideData(tideData);
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise<Tide|undefined>}
	 */
	async getTideForDate(date) {
		if (!date) {
			return;
		}

		if (!this.isWithinOneDays(date)) {
			return;
		}

		try {
			const formattedDate = format(date, 'yyyy-MM-dd');

			let tideData = await tideStorage.getTideDataByDate(formattedDate);

			if (!tideData) {
				await this.processTideWeatherData(date);

				tideData = await tideStorage.getTideDataByDate(formattedDate);

				return tideData;
			}

			return tideData;
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * @private
	 * @param {Date} date
	 * @returns {boolean}
	 */
	isWithinOneDays(date) {
		const nowDate = new Date(date);
		const diffInDays = differenceInDays(date, nowDate);

		return Math.abs(diffInDays) <= 1;
	}
}
export const main = new Main();

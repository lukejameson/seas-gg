import { format } from 'date-fns';
import { dataCleanup } from './data_cleanup';
import { htmlParser } from './html_parser';
import { tideStorage } from './storage';
import { tideSequence } from './tide_sequence';
import { tideScraper } from './tides-scraper';
import { weatherScraper } from './weather-scraper';

/**
 *
 * @class Main
 */
class Main {
	constructor() {}

	/**
	 * Gathers all the data
	 * @private
	 * @param {Date} date
	 * @returns {Promise<void>}
	 */
	async processTideWeatherData(date) {
		await dataCleanup.processOldTideRecords();

		const rawTideHtml = await tideScraper.scrapeTidesForDate(date);
		const weather = await weatherScraper.getWeatherForDate(format(date, 'yyyy-MM-dd'));
		const basicTides = htmlParser.getBasicTidesTable(rawTideHtml);
		const hourlyTides = htmlParser.getHourlyTides(rawTideHtml);
		const dailyExtremes = tideSequence.processTideData(hourlyTides);

		/** @type {Tide} */
		const tideData = {
			id: crypto.randomUUID(),
			date: format(new Date(date), 'yyyy-MM-dd'),
			weather: weather,
			basicTides: basicTides,
			hourlyTides: hourlyTides,
			dailyExtremes: dailyExtremes,
			currentTideHeight: null
		};

		if (!tideData) return;

		await tideStorage.addTide(tideData);
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise<Tide|undefined>}
	 */
	async getTideForDate(date) {
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
	 * @param {Date} date
	 * @returns {boolean}
	 */
	isWithinOneDays(date) {
		const inputDate = new Date(date);
		const today = new Date();
		const yesterday = new Date();
		const tomorrow = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		tomorrow.setDate(tomorrow.getDate() + 1);

		inputDate.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);
		yesterday.setHours(0, 0, 0, 0);
		tomorrow.setHours(0, 0, 0, 0);

		if (inputDate.getTime() === today.getTime()) {
			return true;
		} else if (inputDate.getTime() === yesterday.getTime()) {
			return true;
		} else if (inputDate.getTime() === tomorrow.getTime()) {
			return true;
		}

		return false;
	}
}
export const main = new Main();

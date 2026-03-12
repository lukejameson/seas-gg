import { format, isSameDay } from 'date-fns';
import { htmlParser } from './html_parser.js';
import { tideScraper } from './tides-scraper.js';
import { seaTemperatureScraper } from './sea-temperature-scraper.js';
import { databaseWorker } from './database_worker.js';

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
	 * @returns {Promise<Tide|null>}
	 */
	async processTideData(date) {
		const rawTideHtml = await tideScraper.scrapeTidesForDate(date);
		const basicTides = htmlParser.getVerboseBasicTidesTable(rawTideHtml);
		const hourlyTides = htmlParser.getHourlyTides(rawTideHtml);

		/** @type {Tide} */
		const tideData = {
			id: crypto.randomUUID(),
			date: format(new Date(date), 'yyyy-MM-dd'),
			basicTides: basicTides,
			hourlyTides: hourlyTides
		};

		if (!tideData) return null;

		await databaseWorker.storeTideRecord(tideData);

		return await databaseWorker.getTideRecord(date);
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise<Tide|null>}
	 */
	async getTideForDate(date) {
		try {
			let tideData = await databaseWorker.getTideRecord(date);

			if (!tideData) {
				tideData = await this.processTideData(date);
			}

			return tideData;
		} catch (error) {
			console.error(error);
		}

		return null;
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise<SeaTemperature|null>}
	 */
	async getSeaTempForDate(date) {
		try {
			const existingData = await databaseWorker.getSeaTempForDate(date);

			/**@type {Date} */
			const today = new Date();
			const parsedDate = new Date(date);
			today.setHours(0, 0, 0, 0);
			parsedDate.setHours(0, 0, 0, 0);

			if (!existingData) {
				if (isSameDay(today, parsedDate)) {
					var seaTempHtml = await seaTemperatureScraper.scrapeSeaTempForToday();

					if (!seaTempHtml) {
						{
							seaTempHtml = 'No Data';
						}
					}

					await databaseWorker.storeSeaTemperatures(date, seaTempHtml);

					return await databaseWorker.getSeaTempForDate(date);
				} else {
					return { date: date, sea_temp_c: 'Not available' };
				}
			}

			return existingData;
		} catch (error) {
			console.error(error);
		}

		return null;
	}
}
export const main = new Main();

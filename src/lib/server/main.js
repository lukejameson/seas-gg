import { format, isSameDay } from 'date-fns';
import { htmlParser } from './html_parser.js';
import { tideSequence } from './tide_sequence.js';
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
		const dailyExtremes = tideSequence.processTideData(hourlyTides);

		/** @type {Tide} */
		const tideData = {
			id: crypto.randomUUID(),
			date: format(new Date(date), 'yyyy-MM-dd'),
			basicTides: basicTides,
			hourlyTides: hourlyTides,
			dailyExtremes: dailyExtremes
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
	 * @param {Date} date - Any date of the week
	 */
	async getTidesForWeek(date) {
		const { start, end } = tideScraper.getDateRangeForWeek(date);

		const records = await databaseWorker.getWeeksTideRecords(start, end);

		if (!records) {
			const tideData = await tideScraper.scrapeTidesForWeek(date);

			/**@type {TideRecord[]} */
			let tideRecords = [];

			tideData.forEach((tideData) => {
				tideRecords.push({
					date: tideData.date,
					tideData: htmlParser.getBasicTidesTable(tideData.tide)
				});
			});

			try {
				/**
				 * @type {WeeklyTides}
				 */
				const wholeWeek = {
					id: crypto.randomUUID(),
					startofweekdate: tideRecords[0].date,
					endofweekdate: tideRecords[6].date,
					data: tideRecords
				};

				await databaseWorker.storeWeeklyTides(wholeWeek);
			} catch (error) {
				console.error(error);
			}

			return await databaseWorker.getWeeksTideRecords(tideRecords[0].date, tideRecords[6].date);
		}

		return records;
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

	async calculateSevenDaySeaTempTrend() {
		const seaTempOverLastSevenDays = await databaseWorker.getSeaTempLastSevenDays();

		if (!seaTempOverLastSevenDays) return;

		const seaTemps = seaTempOverLastSevenDays.map((x) => Number(x.sea_temp_c.replace('° C', '')));

		const n = seaTemps.length;
		const x = Array.from({ length: n }, (_, i) => i);

		const sumX = x.reduce((a, b) => a + b, 0);
		const sumY = seaTemps.reduce((a, b) => a + b, 0);
		const sumXY = x.reduce((sum, xi, i) => sum + xi * seaTemps[i], 0);
		const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

		// Calculate slope
		const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

		// Determine trend direction
		const trend = slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable';

		return { slope: slope.toFixed(2), trend };
	}

	/**
	 * @param {Date} date
	 * @returns {boolean}
	 */
	isWithinTenDays(date) {
		const inputDate = new Date(date);
		const today = new Date();
		const yesterday = new Date();
		const tomorrow = new Date();
		yesterday.setDate(yesterday.getDate() - 10);
		tomorrow.setDate(tomorrow.getDate() + 10);

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

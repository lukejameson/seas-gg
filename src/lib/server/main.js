import { format } from 'date-fns';
import { htmlParser } from './html_parser';
import { supabaseWorker } from './supabase';
import { tideSequence } from './tide_sequence';
import { tideScraper } from './tides-scraper';
import { faGameConsoleHandheldCrank } from '@fortawesome/pro-solid-svg-icons';

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

		await supabaseWorker.storeTideRecord(tideData);

		return await supabaseWorker.getTideRecord(date);
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise<Tide|null>}
	 */
	async getTideForDate(date) {
		try {
			let tideData = await supabaseWorker.getTideRecord(date);

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

		const records = await supabaseWorker.getWeeksTideRecords(start, end);

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
					startOfWeekDate: tideRecords[0].date,
					endOfWeekDate: tideRecords[6].date,
					data: tideRecords
				};

				await supabaseWorker.storeWeeklyTides(wholeWeek);
			} catch (error) {
				console.error(error);
			}

			return await supabaseWorker.getWeeksTideRecords(tideRecords[0].date, tideRecords[6].date);
		}

		return records;
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

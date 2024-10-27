import { differenceInDays, format, getDayOfYear } from 'date-fns';
import { tideStorage } from './storage';
import { getYear } from 'date-fns';
import { htmlParser } from './html_parser';
import { weatherScraper } from './weather-scraper';

class TideScraper {
	constructor() {
		this.tidesUrl = 'https://tides.digimap.gg';
	}

	/**
	 * Gathers all the data
	 * @private
	 * @param {Date} date
	 * @returns {Promise<void>}
	 */
	async scrapeTideData(date) {
		const year = getYear(date);
		const yearDay = getDayOfYear(date);

		const url = new URL(`${this.tidesUrl}/?year=${year}&yearDay=${yearDay}`);

		const tidesResponse = await fetch(url);

		const htmlContent = await tidesResponse.text();

		const weather = await weatherScraper.getWeatherForDate(format(date, 'yyyy-MM-dd'));
		const basicTides = htmlParser.getBasicTidesTable(htmlContent);
		const hourlyTides = htmlParser.getHourlyTides(htmlContent);

		/** @type {TideData[]} */
		const tideData = [
			{
				id: crypto.randomUUID(),
				date: format(new Date(date), 'yyyy-MM-dd'),
				weather: weather,
				basicTides: basicTides,
				hourlyTides: hourlyTides
			}
		];

		if (!tideData) return;
		await tideStorage.saveTideData(tideData);
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

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise<TideData|undefined>}
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
				await this.scrapeTideData(date);

				tideData = await tideStorage.getTideDataByDate(formattedDate);

				return tideData;
			}

			return tideData;
		} catch (error) {
			console.error(error);
		}
	}
}

export const tideScraper = new TideScraper();

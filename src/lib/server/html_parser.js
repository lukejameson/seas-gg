import { JSDOM } from 'jsdom';

/**
 * Used to parse the html from tides.digimap
 * @class HtmlParser
 */
class HtmlParser {
	constructor() {}

	/**
	 * @param {*} html
	 * @returns {Document}
	 */
	parseHtml(html) {
		const dom = new JSDOM(html);

		return dom.window.document;
	}

	/**
	 *
	 * @param {string} html
	 * @returns {string|null|undefined}
	 */
	getSeaTempTable(html) {
		if (!html) {
			return null;
		}

		const parsedHtml = this.parseHtml(html);

		const seaTemp = parsedHtml.querySelector(`.temperature`)?.textContent;

		return seaTemp;
	}

	/**
	 *
	 * @param {string} html
	 * @returns {VerboseTideData[]|null}
	 */
	getVerboseBasicTidesTable(html) {
		if (!html) {
			return null;
		}

		const parsedHtml = this.parseHtml(html).documentElement;

		/**
		 * @typeof {VerboseTideData[]}
		 */
		const tidesTable = [...parsedHtml.querySelectorAll('div.float-left:nth-child(3) > table tr')]
			.slice(1)
			.map((tr) => {
				const [name, time, height] = [...tr.querySelectorAll('td')];

				return {
					typeof: name?.textContent?.trim() || '',
					time: this.adjustTime(time?.textContent?.trim() || ''),
					height: this.adjustHeight(height?.textContent?.trim() || '')
				};
			});

		return tidesTable;
	}

	/**
	 *
	 * @param {string} html
	 * @returns {TideData[]|null}
	 */
	getBasicTidesTable(html) {
		if (!html) {
			return null;
		}

		const parsedHtml = this.parseHtml(html).documentElement;

		/**
		 * @typeof {TideData[]}
		 */
		const tidesTable = [...parsedHtml.querySelectorAll('div.float-left:nth-child(3) > table tr')]
			.slice(1)
			.map((tr) => {
				const [time, height] = [...tr.querySelectorAll('td')];

				return {
					time: this.adjustTime(time?.textContent?.trim() || ''),
					height: this.adjustHeight(height?.textContent?.trim() || '')
				};
			});

		return tidesTable;
	}

	/**
	 *
	 * @param {string} html
	 * @returns {TideData[]|null}}
	 */
	getHourlyTides(html) {
		if (!html) return null;

		const parsedHtml = this.parseHtml(html).documentElement;

		/**
		 * @typedef{TideData[]}
		 */

		const container = [...parsedHtml.querySelectorAll('div.parent:nth-child(7) > div > table')];

		/** @typedef {TideData[]} Tables */

		/** @type {Tables} */
		const tables = [];

		container.forEach((tr) => {
			const rows = [...tr.querySelectorAll('tbody tr')].splice(1);
			rows.forEach((tr) => {
				const [timeCell, heightCell] = [...tr.querySelectorAll('td')];

				const height = heightCell?.querySelector('div')?.textContent?.trim();

				tables.push({
					time: timeCell?.textContent?.trim() || '',
					height: parseFloat(height ? height : '0') || 0
				});
			});
		});

		if (!tables) return null;

		return tables;
	}

	/**
	 * Helper function to adjust time by ±5 minutes
	 * @param {string} timeStr - Time string in format "HH:MM AM/PM"
	 * @returns {string} - Adjusted time string
	 */
	adjustTime(timeStr) {
		const date = new Date(`1970/01/01 ${timeStr}`);
		const adjustment = Math.random() < 0.5 ? -5 : 5; // Randomly subtract or add 5 minutes
		date.setMinutes(date.getMinutes() + adjustment);

		// Format time back to "HH:MM AM/PM"
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	/**
	 * Helper function to adjust height by ±2-5%
	 * @param {string} heightStr - Height string (e.g., "3.2 ft")
	 * @returns {string} - Adjusted height string
	 */
	adjustHeight(heightStr) {
		const heightNum = parseFloat(heightStr);
		if (isNaN(heightNum)) return heightStr;

		// Random adjustment between 0.98 and 1.05 (±2-5%)
		const adjustment = 0.98 + Math.random() * 0.07;
		const newHeight = (heightNum * adjustment).toFixed(1);
		return `${newHeight}`;
	}
}

export const htmlParser = new HtmlParser();

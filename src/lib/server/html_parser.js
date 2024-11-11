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
					time: `${time?.textContent?.trim() || ''}`,
					height: `${height?.textContent?.trim() || ''}`
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
				const [name, time, height] = [...tr.querySelectorAll('td')];

				return {
					time: `${time?.textContent?.trim() || ''}`,
					height: `${height?.textContent?.trim() || ''}`
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
}

export const htmlParser = new HtmlParser();

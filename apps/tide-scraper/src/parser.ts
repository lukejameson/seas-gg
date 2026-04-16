import { JSDOM } from 'jsdom';
import type { TideData, VerboseTideData } from './types.js';

/**
 * Parse HTML for tide data
 */
export class HtmlParser {
	/**
	 * Parse HTML string to DOM document
	 */
	parseHtml(html: string): Document {
		const dom = new JSDOM(html);
		return dom.window.document;
	}

	/**
	 * Extract verbose basic tides table (high/low tides)
	 */
	getVerboseBasicTidesTable(html: string): VerboseTideData[] | null {
		if (!html) return null;

		const parsedHtml = this.parseHtml(html).documentElement;

		const tidesTable = Array.from(
			parsedHtml.querySelectorAll('div.float-left:nth-child(3) > table tr')
		)
			.slice(1)
			.map((tr) => {
				const [name, time, height] = Array.from(tr.querySelectorAll('td'));

				return {
					typeof: name?.textContent?.trim() || '',
					time: this.adjustTime(time?.textContent?.trim() || ''),
					height: parseFloat(this.adjustHeight(height?.textContent?.trim() || '')) || 0
				};
			});

		return tidesTable;
	}

	/**
	 * Extract hourly tide data
	 */
	getHourlyTides(html: string): TideData[] | null {
		if (!html) return null;

		const parsedHtml = this.parseHtml(html).documentElement;

		const container = Array.from(
			parsedHtml.querySelectorAll('div.parent:nth-child(7) > div > table')
		);

		const tables: TideData[] = [];

		container.forEach((tr) => {
			const rows = Array.from(tr.querySelectorAll('tbody tr')).splice(1);
			rows.forEach((tr) => {
				const [timeCell, heightCell] = Array.from(tr.querySelectorAll('td'));

				const height = heightCell?.querySelector('div')?.textContent?.trim();

				tables.push({
					time: timeCell?.textContent?.trim() || '',
					height: parseFloat(height ? height : '0') || 0
				});
			});
		});

		return tables.length > 0 ? tables : null;
	}

	/**
	 * Helper function to adjust time by ±5 minutes (privacy protection)
	 */
	adjustTime(timeStr: string): string {
		const date = new Date(`1970/01/01 ${timeStr}`);
		const adjustment = Math.random() < 0.5 ? -5 : 5;
		date.setMinutes(date.getMinutes() + adjustment);

		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	/**
	 * Helper function to adjust height by ±2-5% (privacy protection)
	 */
	adjustHeight(heightStr: string): string {
		const heightNum = parseFloat(heightStr);
		if (isNaN(heightNum)) return heightStr;

		const adjustment = 0.98 + Math.random() * 0.07;
		const newHeight = (heightNum * adjustment).toFixed(1);
		return `${newHeight}`;
	}
}

export const htmlParser = new HtmlParser();

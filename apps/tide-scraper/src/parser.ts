import { load, type CheerioAPI } from 'cheerio';
import type { TideData, VerboseTideData } from './types.js';

/**
 * Parse HTML for tide data
 */
export class HtmlParser {
	/**
	 * Parse HTML string — returns a cheerio instance to be reused across calls
	 */
	parseHtml(html: string): CheerioAPI {
		return load(html);
	}

	/**
	 * Extract verbose basic tides table (high/low tides)
	 */
	getVerboseBasicTidesTable($: CheerioAPI): VerboseTideData[] | null {
		const rows = $('div.float-left:nth-child(3) > table tr').toArray().slice(1);

		if (rows.length === 0) return null;

		return rows.map((tr) => {
			const tds = $(tr).find('td').toArray();
			const [name, time, height] = tds;
			return {
				typeof: $(name).text().trim(),
				time: this.adjustTime($(time).text().trim()),
				height: parseFloat(this.adjustHeight($(height).text().trim())) || 0
			};
		});
	}

	/**
	 * Extract hourly tide data
	 */
	getHourlyTides($: CheerioAPI): TideData[] | null {
		const tables: TideData[] = [];

		$('div.parent:nth-child(7) > div > table').each((_, table) => {
			$(table).find('tbody tr').toArray().slice(1).forEach((tr) => {
				const tds = $(tr).find('td').toArray();
				const [timeCell, heightCell] = tds;
				const height = $(heightCell).find('div').text().trim();
				tables.push({
					time: $(timeCell).text().trim(),
					height: parseFloat(height || '0') || 0
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

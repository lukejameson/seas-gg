import { env } from '$env/dynamic/private';

class SeaTemperatureScraper {
	constructor() {
		/**
		 * @type {string|undefined}
		 */
		this.url = env.SEA_TEMP_URL;
	}

	async scrapeSeaTempForToday() {
		if (!this.url) {
			throw new Error('Sea Temp URL not provided');
		}

		const url = new URL(this.url);

		const seatTempResponse = await fetch(url);

		return await seatTempResponse.text();
	}
}

export const seaTemperatureScraper = new SeaTemperatureScraper();

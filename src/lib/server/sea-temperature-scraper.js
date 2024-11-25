import { env } from '$env/dynamic/private';
import { chromium } from '@playwright/test';

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

		try {
			const browser = await chromium.launch({
				headless: true,
				channel: 'chromium',
				executablePath: '/usr/bin/chromium-browser',
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
			});

			const page = await browser.newPage();
			await page.goto(this.url);

			await page.waitForSelector('span.currentTemperatureValue');

			const temperatureElement = await page.$('span.currentTemperatureValue');
			const temperature = await temperatureElement?.textContent();

			await browser.close();

			if (!temperature) {
				throw new Error('Failed to extract temperature value');
			}

			return temperature.trim();
		} catch (error) {
			console.error('Sea temperature scraping failed:', error.message);
			throw error;
		}
	}
}

export const seaTemperatureScraper = new SeaTemperatureScraper();

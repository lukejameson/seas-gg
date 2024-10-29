import { fetchWeatherApi } from 'openmeteo';

/**
 * Class for fetching and processing weather data
 */
class WeatherScraper {
	constructor() {}

	/**
	 * Fetches weather data for a specific date
	 *
	 * @param {string} date - Date in YYYY-MM-DD format
	 * @returns {Promise<HourlyWeather[]>} Array of hourly weather data
	 * @throws {Error} If the API request fails or data is missing
	 */
	async getWeatherForDate(date) {
		const params = {
			latitude: 49.465691,
			longitude: -2.585278,
			hourly: [
				'temperature_2m',
				'relative_humidity_2m',
				'precipitation',
				'visibility',
				'wind_speed_10m',
				'wind_direction_10m',
				'weather_code'
			],
			timezone: 'Europe/London',
			start_date: date,
			end_date: date
		};

		const url = 'https://api.open-meteo.com/v1/forecast';
		const responses = await fetchWeatherApi(url, params);

		/**
		 * Creates an array of numbers progressing from start up to, but not including, stop
		 *
		 * @param {number} start - The start of the range
		 * @param {number} stop - The end of the range (exclusive)
		 * @param {number} step - The value to increment by
		 * @returns {number[]} Array of numbers in the range
		 */
		const range = (start, stop, step) =>
			Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

		const response = responses[0];
		const utcOffsetSeconds = response.utcOffsetSeconds();
		const hourly = response.hourly();

		if (!hourly) {
			throw new Error('No hourly data available');
		}

		/**
		 * @type {{
		 *   hourly: {
		 *     time: Date[],
		 *     temperature2m: Float32Array | null,
		 *     relativeHumidity2m: Float32Array | null,
		 *     precipitation: Float32Array | null,
		 *     visibility: Float32Array | null,
		 *     windSpeed10m: Float32Array | null,
		 *     windDirection10m: Float32Array | null,
		 *     weather_code: Float32Array | null
		 *   }
		 * }}
		 */
		const weatherData = {
			hourly: {
				time: range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
					(t) => new Date((t + utcOffsetSeconds) * 1000)
				),
				temperature2m: hourly.variables(0)?.valuesArray() ?? null,
				relativeHumidity2m: hourly.variables(1)?.valuesArray() ?? null,
				precipitation: hourly.variables(2)?.valuesArray() ?? null,
				visibility: hourly.variables(3)?.valuesArray() ?? null,
				windSpeed10m: hourly.variables(4)?.valuesArray() ?? null,
				windDirection10m: hourly.variables(5)?.valuesArray() ?? null,
				weather_code: hourly.variables(6)?.valuesArray() ?? null
			}
		};

		// Validate that all required data is present
		const requiredArrays = [
			weatherData.hourly.temperature2m,
			weatherData.hourly.relativeHumidity2m,
			weatherData.hourly.precipitation,
			weatherData.hourly.visibility,
			weatherData.hourly.windSpeed10m,
			weatherData.hourly.windDirection10m,
			weatherData.hourly.weather_code
		];

		if (requiredArrays.some((arr) => arr === null)) {
			throw new Error('Missing required weather data');
		}

		/** @type {HourlyWeather[]} */
		const mappedWeatherDataHourly = [];

		for (let i = 0; i < weatherData.hourly.time.length; i++) {
			// We can now safely assert these are non-null since we checked above
			/** @type {Float32Array} */
			const temperature2m = /** @type {Float32Array} */ (weatherData.hourly.temperature2m);
			/** @type {Float32Array} */
			const relativeHumidity2m = /** @type {Float32Array} */ (
				weatherData.hourly.relativeHumidity2m
			);
			/** @type {Float32Array} */
			const precipitation = /** @type {Float32Array} */ (weatherData.hourly.precipitation);
			/** @type {Float32Array} */
			const visibility = /** @type {Float32Array} */ (weatherData.hourly.visibility);
			/** @type {Float32Array} */
			const windSpeed10m = /** @type {Float32Array} */ (weatherData.hourly.windSpeed10m);
			/** @type {Float32Array} */
			const windDirection10m = /** @type {Float32Array} */ (weatherData.hourly.windDirection10m);
			/** @type {Float32Array} */
			const weather_code = /** @type {Float32Array} */ (weatherData.hourly.weather_code);

			mappedWeatherDataHourly.push({
				date: weatherData.hourly.time[i],
				temperature: temperature2m[i],
				relativeHumidity: relativeHumidity2m[i],
				precipitation: precipitation[i],
				visibility: visibility[i],
				windSpeed10m: windSpeed10m[i],
				windDirection10m: windDirection10m[i],
				weather_code: weather_code[i]
			});
		}

		return mappedWeatherDataHourly;
	}
}

export const weatherScraper = new WeatherScraper();

import { fetchWeatherApi } from 'openmeteo';
import type { HourlyWeather } from './types.js';

// Guernsey coordinates
const LATITUDE = 49.465691;
const LONGITUDE = -2.585278;

/**
 * Fetches weather data from Open-Meteo API
 */
export class WeatherFetcher {
	/**
	 * Fetch weather for a specific date
	 */
	async fetchWeatherForDate(date: string): Promise<HourlyWeather[]> {
		console.log(`[WeatherService] Fetching weather for ${date}`);

		const params = {
			latitude: LATITUDE,
			longitude: LONGITUDE,
			hourly: [
				'temperature_2m',
				'relative_humidity_2m',
				'precipitation',
				'visibility',
				'wind_speed_10m',
				'wind_direction_10m',
				'weather_code',
				'apparent_temperature',
				'uv_index'
			],
			timezone: 'Europe/London',
			start_date: date,
			end_date: date
		};

		const url = 'https://api.open-meteo.com/v1/forecast';
		const responses = await fetchWeatherApi(url, params);

		const response = responses[0];
		const utcOffsetSeconds = response.utcOffsetSeconds();
		const hourly = response.hourly();

		if (!hourly) {
			throw new Error('No hourly data available');
		}

		// Create time range
		const range = (start: number, stop: number, step: number) =>
			Array.from({ length: (stop - start) / step }, (_, i) => start + i * step);

		const times = range(Number(hourly.time()), Number(hourly.timeEnd()), hourly.interval()).map(
			(t) => new Date((t + utcOffsetSeconds) * 1000)
		);

		const temperature2m = hourly.variables(0)?.valuesArray();
		const relativeHumidity2m = hourly.variables(1)?.valuesArray();
		const precipitation = hourly.variables(2)?.valuesArray();
		const visibility = hourly.variables(3)?.valuesArray();
		const windSpeed10m = hourly.variables(4)?.valuesArray();
		const windDirection10m = hourly.variables(5)?.valuesArray();
		const weatherCode = hourly.variables(6)?.valuesArray();
		const apparentTemp = hourly.variables(7)?.valuesArray();
		const uvIndex = hourly.variables(8)?.valuesArray();

		if (!temperature2m || !relativeHumidity2m || !precipitation || !visibility ||
		    !windSpeed10m || !windDirection10m || !weatherCode || !apparentTemp || !uvIndex) {
			throw new Error('Missing required weather data');
		}

		const weatherData: HourlyWeather[] = [];

		for (let i = 0; i < times.length; i++) {
			weatherData.push({
				date: times[i].toISOString(),
				temperature: temperature2m[i],
				relativeHumidity: relativeHumidity2m[i],
				precipitation: precipitation[i],
				visibility: visibility[i],
				windSpeed10m: windSpeed10m[i],
				windDirection10m: windDirection10m[i],
				weather_code: weatherCode[i],
				apparent_temperature: apparentTemp[i],
				uv_index: uvIndex[i]
			});
		}

		return weatherData;
	}
}

export const weatherFetcher = new WeatherFetcher();

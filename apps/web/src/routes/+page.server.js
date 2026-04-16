import { redirect } from '@sveltejs/kit';
import { addDays } from 'date-fns/addDays';
import { format } from 'date-fns/format';
import { isBefore } from 'date-fns/isBefore';
import { isValid } from 'date-fns/isValid';
import { startOfDay } from 'date-fns/startOfDay';

const DATE_FORMAT = 'yyyy-MM-dd';
const MAX_DAYS_AHEAD = 7;

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, url }) {
	// Get and validate date first, before any data fetching
	const today = startOfDay(new Date());
	const maxDate = addDays(today, MAX_DAYS_AHEAD);
	const defaultDate = format(today, DATE_FORMAT);

	// Get the requested date or use today
	const dateParam = url.searchParams.get('date') || defaultDate;
	const parsedDate = startOfDay(new Date(dateParam));

	// Validate date and redirect if necessary - do this BEFORE any data fetching
	if (!isValid(parsedDate)) {
		throw redirect(303, `/?date=${defaultDate}`);
	}

	if (isBefore(parsedDate, today)) {
		throw redirect(303, `/?date=${defaultDate}`);
	}

	if (isBefore(maxDate, parsedDate)) {
		throw redirect(303, `/?date=${defaultDate}`);
	}

	// Only fetch data if date is valid
	try {
		const date = format(parsedDate, DATE_FORMAT);

		const canGoBack = isBefore(today, parsedDate);
		const canGoForward = !isBefore(maxDate, addDays(parsedDate, 1));

		const [tideResponse, weatherResponse, seaTemperatureResponse, poolsBeingCleanedResponse] =
			await Promise.all([
				fetch(`/tides?date=${date}`),
				fetch(`/weather?date=${date}`),
				fetch(`/sea_temp?date=${date}`),
				fetch(`/pools/clean?date=${date}`)
			]);

		if (
			!tideResponse.ok ||
			!weatherResponse.ok ||
			!seaTemperatureResponse.ok ||
			!poolsBeingCleanedResponse.ok
		) {
			throw new Error('One or more API requests failed');
		}

		const [tide, weather, seaTemperatureRaw, poolsBeingCleaned] = await Promise.all([
			tideResponse.json(),
			weatherResponse.json(),
			seaTemperatureResponse.json(),
			poolsBeingCleanedResponse.json()
		]);

		// Check if we need to use predicted temperature
		// Use prediction for any future day (after today) or when there's no actual data
		const isFutureDate = isBefore(today, parsedDate);
		// API returns sea_temp_c (snake_case)
		const rawTemp = seaTemperatureRaw?.sea_temp_c || seaTemperatureRaw?.seaTempC;
		const hasNoData = !rawTemp || rawTemp === 'No Data';

		/** @type {Object} */
		let seaTemperature = seaTemperatureRaw;
		/** @type {boolean} */
		let isPredicted = false;
		/** @type {string|null} */
		let predictionConfidence = null;

		if (isFutureDate || hasNoData) {
			try {
				const predictResponse = await fetch(`/sea_temp/predict?date=${date}`);
				if (predictResponse.ok) {
					const prediction = await predictResponse.json();
					seaTemperature = {
						date: date,
						seaTempC: String(prediction.predicted_temp) + '°C',
						isPredicted: true,
						confidence: prediction.confidence,
						factors: prediction.factors
					};
					isPredicted = true;
					predictionConfidence = prediction.confidence;
				}
			} catch (predictError) {
				console.error('Failed to fetch prediction:', predictError);
				// Fall back to original data if prediction fails
			}
		} else {
			// Use actual data - normalize property name to seaTempC
			seaTemperature = {
				...seaTemperatureRaw,
				seaTempC: rawTemp
			};
		}

		return {
			tide,
			weather,
			seaTemperature,
			isPredicted,
			predictionConfidence,
			date,
			poolsBeingCleaned,
			navigation: {
				canGoBack,
				canGoForward,
				serverToday: format(today, DATE_FORMAT),
				maxDate: format(maxDate, DATE_FORMAT)
			}
		};
	} catch (error) {
		console.error('Failed to fetch data:', error);
		return {
			tide: null,
			weather: null,
			seaTemperature: null,
			poolsBeingCleaned: null,
			date: format(today, DATE_FORMAT),
			error: 'Failed to load data',
			navigation: {
				canGoBack: false,
				canGoForward: true,
				serverToday: format(today, DATE_FORMAT),
				maxDate: format(maxDate, DATE_FORMAT)
			}
		};
	}
}

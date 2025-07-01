import { redirect } from '@sveltejs/kit';
import { addDays, format, isBefore, isValid, startOfDay } from 'date-fns';

const DATE_FORMAT = 'yyyy-MM-dd';
const MAX_DAYS_AHEAD = 5;

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
		const [
			tideResponse,
			weatherResponse,
			seaTemperatureResponse,
			poolsBeingCleanedResponse
		] = await Promise.all([
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

		const [tide, weather, seaTemperature, poolsBeingCleaned] = await Promise.all([
			tideResponse.json(),
			weatherResponse.json(),
			seaTemperatureResponse.json(),
			poolsBeingCleanedResponse.json()
		]);

		return {
			tide,
			weather,
			seaTemperature,
			date,
			poolsBeingCleaned
		};
	} catch (error) {
		console.error('Failed to fetch data:', error);
		return {
			tide: null,
			weather: null,
			seaTemperature: null,
			seaTempTrend: null,
			poolsBeingCleaned: null,
			date: format(today, DATE_FORMAT),
			error: 'Failed to load data'
		};
	}
}

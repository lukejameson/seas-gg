import { redirect } from '@sveltejs/kit';
import { addDays, format, isValid } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, url }) {
	const date = url.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
	const parsedDate = new Date(date);

	// Validate date and redirect if necessary
	if (!isValid(parsedDate)) {
		throw redirect(303, `/?date=${format(new Date(), 'yyyy-MM-dd')}`);
	}

	const maxDate = addDays(new Date(), 5);
	const selectedDatePlusOne = addDays(parsedDate, 1);

	if (selectedDatePlusOne > maxDate) {
		throw redirect(303, `/?date=${format(new Date(), 'yyyy-MM-dd')}`);
	}

	try {
		const [tideResponse, weatherResponse, weeklyTideResponse, seaTemperatureResponse] =
			await Promise.all([
				fetch(`/tides?date=${date}`),
				fetch(`/weather?date=${date}`),
				fetch(`/tides/weekly?date=${date}`),
				fetch(`/sea_temp?date=${date}`)
			]);

		if (!tideResponse.ok || !weatherResponse.ok || !weeklyTideResponse.ok) {
			throw new Error('One or more API requests failed');
		}

		const [tide, weeklyTides, weather, seaTemperature] = await Promise.all([
			tideResponse.json(),
			weeklyTideResponse.json(),
			weatherResponse.json(),
			seaTemperatureResponse.json()
		]);

		return {
			tide: tide,
			weeklyTides: weeklyTides,
			weather: weather,
			seaTemperature: seaTemperature,
			date: date
		};
	} catch (error) {
		console.error('Failed to fetch data:', error);

		return {
			tide: null,
			weather: null,
			weeklyTides: null,
			date,
			seaTemperature: null,
			error: 'Failed to load data'
		};
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	getWeeklyTides: async ({ request, fetch }) => {
		const formData = await request.formData();
		const date = formData.get('date');

		try {
			const response = await fetch(`/tides/weekly?date=${date}`);

			if (!response.ok) {
				throw new Error('Failed to fetch weekly tides');
			}

			const weeklyTides = await response.json();

			return {
				type: 'success',
				data: weeklyTides
			};
		} catch (error) {
			console.error('Action failed:', error);
			return {
				type: 'error',
				error: 'Failed to load weekly tides'
			};
		}
	}
};

/**
 * @param {Date} date
 */

async function dateGuard(date) {
	const maxDate = addDays(new Date(), 5);
	const selectedDatePlusOne = addDays(date, 1);

	if (selectedDatePlusOne > maxDate) {
		try {
			throw redirect(303, `/date=${format(new Date(), 'yyyy-MM-dd')}`);
		} catch (error) {
			console.log(error);
		}
	}
}

import { format } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, url }) {
	const date = url.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');

	try {
		const [tideResponse, weatherResponse] = await Promise.all([
			fetch(`/tides?date=${date}`),
			fetch(`/weather?date=${date}`)
		]);

		if (!tideResponse.ok || !weatherResponse.ok) {
			throw new Error('One or more API requests failed');
		}

		const [tide, weather] = await Promise.all([tideResponse.json(), weatherResponse.json()]);

		return {
			tide,
			weather,
			date
		};
	} catch (error) {
		console.error('Failed to fetch data:', error);

		return {
			tide: null,
			weather: null,
			date,
			error: 'Failed to load data'
		};
	}
}

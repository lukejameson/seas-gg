/**
 * GET Handler for tides
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
import { extraTideProcessing } from '$lib/server/extra-tide-processor';
import { main } from '$lib/server/main';

/**
 *
 * @param {*} url
 * @returns
 */
export async function GET({ url }) {
	const date = url.searchParams.get('date');

	if (!date) {
		return new Response(JSON.stringify({ error: 'No date provided' }), {
			status: 403
		});
	}

	if (!main.isWithinOneDays(date)) {
		return new Response(
			JSON.stringify({ error: 'Date outside of accepted range, +1 or -1 days are allowed' }),
			{
				status: 403
			}
		);
	}

	try {
		const tide = await main.getTideForDate(date);

		if (tide) {
			tide.currentTideHeight = extraTideProcessing.findClosestTime(tide.hourlyTides, date);
		}

		if (!tide) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404
			});
		}

		return new Response(JSON.stringify(tide), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('Error fetching tide data:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}

/**
 * GET Handler for tides
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
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

	try {
		const tide = await main.getTidesForWeek(date);

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

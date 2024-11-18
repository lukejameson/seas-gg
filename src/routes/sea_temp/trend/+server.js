/**
 * GET Handler for tides
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
import { main } from '$lib/server/main.js';

export async function GET() {
	try {
		const seaTemp = await main.calculateSevenDaySeaTempTrend();

		if (!seaTemp) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404
			});
		}

		return new Response(JSON.stringify(seaTemp), {
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

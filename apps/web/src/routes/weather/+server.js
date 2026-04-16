import { db, weatherCache, eq } from '@seas/database';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const date = url.searchParams.get('date');

	if (!date) {
		return new Response(JSON.stringify({ error: 'No date provided' }), {
			status: 400
		});
	}

	try {
		const result = await db.query.weatherCache.findFirst({
			where: eq(weatherCache.date, date)
		});

		if (!result) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404
			});
		}

		return new Response(JSON.stringify(result.data), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('[Weather API] Error fetching weather data:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}

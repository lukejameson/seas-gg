import { db, dailyTides, eq } from '@seas/database';
import { format } from 'date-fns';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const date = url.searchParams.get('date');

	if (!date) {
		return new Response(JSON.stringify({ error: 'No date provided' }), {
			status: 400
		});
	}

	try {
		const tide = await db.query.dailyTides.findFirst({
			where: eq(dailyTides.date, date)
		});

		if (!tide) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404
			});
		}

		return new Response(JSON.stringify(tide.data), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('[Tides API] Error fetching tide data:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}

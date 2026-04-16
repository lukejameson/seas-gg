import { db, seaTemp, eq } from '@seas/database';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const date = url.searchParams.get('date');

	if (!date) {
		return new Response(JSON.stringify({ error: 'No date provided' }), {
			status: 400
		});
	}

	try {
		const result = await db.query.seaTemp.findFirst({
			where: eq(seaTemp.date, date)
		});

		const seaTempData = result || { date, sea_temp_c: 'No Data' };

		return new Response(JSON.stringify(seaTempData), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('[SeaTemp API] Error fetching sea temp data:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}

import { db, poolCleaningDates, eq } from '@seas/database';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const date = url.searchParams.get('date');

	if (!date) {
		return new Response(JSON.stringify({ error: 'No date provided' }), {
			status: 400
		});
	}

	try {
		const cleaningDate = await db.query.poolCleaningDates.findFirst({
			where: eq(poolCleaningDates.date, date)
		});

		if (!cleaningDate) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		const mappedValues = {
			date: cleaningDate.date,
			pools: cleaningDate.pools ? JSON.parse(cleaningDate.pools) : []
		};

		return new Response(JSON.stringify(mappedValues), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('[Pools API] Error fetching pool cleaning data:', error);
		return new Response(JSON.stringify({ error: 'Internal server error' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
}

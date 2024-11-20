/**
 * GET Handler for tides
 * @param {import('@sveltejs/kit').RequestEvent} event
 */
import { supabaseWorker } from '$lib/server/supabase';

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
		const cleaningDate = await supabaseWorker.getPoolCleaningScheduleForDate(date);

		if (!cleaningDate) {
			return new Response(JSON.stringify({ error: 'Not found' }), {
				headers: {
					'Content-Type': 'application/json'
				}
			});
		}

		const mappedValues = {
			date: cleaningDate.date,
			pools: JSON.parse(JSON.stringify(cleaningDate.pools))
		};

		return new Response(JSON.stringify(mappedValues), {
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

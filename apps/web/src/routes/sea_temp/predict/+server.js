import { predictSeaTemperature } from '$lib/server/sea-temp-predictor.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		// Get target date from query param, default to tomorrow
		const targetDate = url.searchParams.get('date');
		const prediction = await predictSeaTemperature(targetDate ?? undefined);

		return new Response(JSON.stringify(prediction), {
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error('[SeaTemp Predict API] Error predicting sea temp:', error);

		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		if (errorMessage.includes('Insufficient data')) {
			return new Response(
				JSON.stringify({
					error: 'Insufficient historical data for prediction',
					detail: errorMessage
				}),
				{
					status: 422,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}

		return new Response(
			JSON.stringify({
				error: 'Internal server error',
				detail: errorMessage
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
}

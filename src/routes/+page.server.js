import { format } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch, url }) {
	const date = url.searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
	const response = await fetch(`/tides?date=${date}`);
	const tide = await response.json();
	return { tide };
}

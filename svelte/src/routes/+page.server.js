import { format } from 'date-fns';

/** @type {import('./$types').PageServerLoad} */
export async function load({fetch}) {
	const date = new Date();
	const response = await fetch(`/tides?date=${format(date, 'yyyy-MM-dd')}`);

	/**
	 * @type {Tide}
	 */
	const tide = await response.json();

	return { tide };
}

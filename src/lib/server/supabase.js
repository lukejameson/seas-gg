import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';

if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
	throw new Error('Supabase config not provided');
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

class SupabaseWorker {
	/**
	 *
	 * @param {Tide} data
	 */
	async storeTideRecord(data) {
		const { error } = await supabase.from('daily_tides').upsert(
			{
				id: data.id,
				date: data.date,
				data: data
			},
			{
				onConflict: 'date'
			}
		);

		if (error) throw error;
	}

	/**
	 *
	 * @param {Date} date
	 * @returns {Promise<Tide|null>}
	 */
	async getTideRecord(date) {
		const { data, error } = await supabase
			.from('daily_tides')
			.select('data')
			.eq('date', date)
			.single();

		if (error) return null;

		return data.data;
	}
}

export const supabaseWorker = new SupabaseWorker();

import { env } from '$env/dynamic/private';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

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

	/**
	 *
	 * @param {WeeklyTides} data
	 */

	async storeWeeklyTides(data) {
		const { error } = await supabase.from('weekly_tides').upsert(
			{
				id: data.id,
				startofweekdate: data.startofweekdate,
				endofweekdate: data.startofweekdate,
				data: data.data
			},
			{
				onConflict: 'startofweekdate'
			}
		);

		if (error) throw error;
	}

	/**
	 *
	 * @param {Date} startOfWeekDate
	 * @param {Date} endOfWeekDate
	 * @returns {Promise<Tide|null>}
	 */
	async getWeeksTideRecords(startOfWeekDate, endOfWeekDate) {
		const formattedStart = format(startOfWeekDate, 'yyyy-MM-dd');
		const formattedEnd = format(endOfWeekDate, 'yyyy-MM-dd');

		const { data, error } = await supabase
			.from('weekly_tides')
			.select('*')
			.eq('startofweekdate', formattedStart)
			.eq('endofweekdate', formattedEnd)
			.single();

		if (error) return null;

		return data;
	}
}

export const supabaseWorker = new SupabaseWorker();

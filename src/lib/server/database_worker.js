import pg from 'pg';
import { addDays, format } from 'date-fns';
import { env } from '$env/dynamic/private';

// Configure PostgreSQL connection
const pool = new pg.Pool({
	host: env.POSTGRES_HOST,
	port: parseInt(env.POSTGRES_PORT || '5432'),
	database: env.POSTGRES_DATABASE,
	user: env.POSTGRES_USER,
	password: env.POSTGRES_PASSWORD,
	ssl: env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false
});

class DatabaseWorker {
	/**
	 *
	 * @param {Tide} data
	 */
	async storeTideRecord(data) {
		const query = `
            INSERT INTO daily_tides (id, date, data)
            VALUES ($1, $2, $3)
            ON CONFLICT (date) DO UPDATE
            SET DATA = $3
            WHERE daily_tides.date = $2
        `;

		try {
			await pool.query(query, [data.id, data.date, data]);
		} catch (error) {
			throw new Error(`Failed to store tide record: ${error.Message}`);
		}
	}

	/**
	 * @param {Date} date
	 * @returns {Promise<Tide|null>}
	 */
	async getTideRecord(date) {
		const query = `
            SELECT data
            FROM daily_tides
            WHERE date = $1
        `;
		try {
			const result = await pool.query(query, [date]);

			return result.rows[0]?.data || null;
		} catch (error) {
			console.error('Failed to get tide record:', error);
			return null;
		}
	}

	/**
	 * @param {WeeklyTides} data
	 */
	async storeWeeklyTides(data) {
		const query = `
            INSERT INTO weekly_tides (id, startofweekdate, endofweekdate, data)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (startofweekdate) DO UPDATE
            SET data = $4,
                endofweekdate = $3
            WHERE weekly_tides.startofweekdate = $2
        `;

		try {
			await pool.query(query, [data.id, data.startofweekdate, data.endofweekdate, data.data]);
		} catch (error) {
			throw new Error(`Failed to store weekly tides: ${error.message}`);
		}
	}

	/**
	 * @param {Date} startOfWeekDate
	 * @param {Date} endOfWeekDate
	 * @returns {Promise<Tide|null>}
	 */
	async getWeeksTideRecords(startOfWeekDate, endOfWeekDate) {
		const formattedStart = format(startOfWeekDate, 'yyyy-MM-dd');
		const formattedEnd = format(endOfWeekDate, 'yyyy-MM-dd');

		const query = `
            SELECT *
            FROM weekly_tides
            WHERE startofweekdate = $1
            AND endofweekdate = $2
        `;

		try {
			const result = await pool.query(query, [formattedStart, formattedEnd]);
			return result.rows[0] || null;
		} catch (error) {
			console.error('Failed to get weeks tide records:', error);
			return null;
		}
	}

	/**
	 * @param {Date} date
	 * @param {string} temp
	 */
	async storeSeaTemperatures(date, temp) {
		const formattedDate = format(date, 'yyyy-MM-dd');
		const query = `
            INSERT INTO sea_temp (date, sea_temp_c)
            VALUES ($1, $2)
            ON CONFLICT (date) DO UPDATE
            SET sea_temp_c = $2
            WHERE sea_temp.date = $1
        `;

		try {
			await pool.query(query, [formattedDate, temp]);
		} catch (error) {
			throw new Error(`Failed to store sea temperature: ${error.message}`);
		}
	}

	/**
	 * @param {Date} date
	 * @returns {Promise<SeaTemperature|null>}
	 */
	async getSeaTempForDate(date) {
		const query = `
            SELECT date, sea_temp_c
            FROM sea_temp
            WHERE date = $1
        `;

		try {
			const result = await pool.query(query, [date]);
			return result.rows[0] || null;
		} catch (error) {
			console.error('Failed to get sea temperature:', error);
			return null;
		}
	}

	/**
	 * @returns {Promise<SeaTemperature[]|null>}
	 */
	async getSeaTempLastSevenDays() {
		const date = format(new Date(), 'yyyy-MM-dd');
		const sevenDaysAgoDate = format(addDays(date, -7), 'yyyy-MM-dd');

		const query = `
            SELECT date, sea_temp_c
            FROM sea_temp
            WHERE date >= $1 AND date <= $2
            ORDER BY date DESC
        `;

		try {
			const result = await pool.query(query, [sevenDaysAgoDate, date]);
			return result.rows || null;
		} catch (error) {
			console.error('Failed to get last seven days sea temperature:', error);
			return null;
		}
	}

	/**
	 * @param {Date} date
	 */
	async getPoolCleaningScheduleForDate(date) {
		const formattedDate = format(date, 'yyyy-MM-dd');
		const query = `
            SELECT date, pools
            FROM pool_cleaning_dates
            WHERE date = $1
        `;

		try {
			const result = await pool.query(query, [formattedDate]);
			return result.rows[0] || null;
		} catch (error) {
			console.error('Failed to get pool cleaning schedule:', error);
			return null;
		}
	}

	/**
	 * Close the database connection pool
	 */
	async close() {
		await pool.end();
	}
}

export const databaseWorker = new DatabaseWorker();

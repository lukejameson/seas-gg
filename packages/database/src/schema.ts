import { pgTable, uuid, date, jsonb, timestamp, bigint, text, serial } from 'drizzle-orm/pg-core';

// Tide data table
export const dailyTides = pgTable('daily_tides', {
	id: uuid('id').primaryKey(),
	date: date('date').notNull().unique(),
	data: jsonb('data').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Sea temperature table
export const seaTemp = pgTable('sea_temp', {
	id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
	date: date('date').notNull().unique(),
	seaTempC: text('sea_temp_c'),
	createdAt: timestamp('created_at').defaultNow()
});

// Pool cleaning dates table
export const poolCleaningDates = pgTable('pool_cleaning_dates', {
	id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
	date: date('date'),
	pools: text('pools'),
	createdAt: timestamp('created_at').defaultNow()
});

// Weather cache table (new - for caching weather data)
export const weatherCache = pgTable('weather_cache', {
	id: serial('id').primaryKey(),
	date: date('date').notNull().unique(),
	data: jsonb('data').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Type definitions
export type TideData = {
	time: string;
	height: number;
};

export type VerboseTideData = {
	typeof?: string | null;
	time: string;
	height: number;
};

export type Tide = {
	id: string;
	date: string;
	basicTides: VerboseTideData[] | null;
	hourlyTides: TideData[] | null;
};

export type HourlyWeather = {
	date: string;
	temperature: number;
	relativeHumidity: number;
	precipitation: number;
	visibility: number;
	windSpeed10m: number;
	windDirection10m: number;
	weather_code: number;
	apparent_temperature: number;
	uv_index: number;
};

export type SeaTemperature = {
	date: string;
	sea_temp_c: string;
};

export type PoolCleaning = {
	date: string;
	pools: string[];
};

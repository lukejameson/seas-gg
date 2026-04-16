import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import pkg from 'pg';
import * as schema from './schema.js';

const { Pool } = pkg;

// Re-export drizzle-orm utilities
export { eq, and, or, inArray, sql };

// Connection pool configuration
// Max 5 connections per service (low for scrapers, higher for web)
const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 2,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 5000
});

// Export typed drizzle client
export const db = drizzle(pool, { schema });

// Export schema for convenience
export * from './schema.js';

// Helper function to close pool (for graceful shutdown)
export async function closePool() {
	await pool.end();
}

// Re-export pool for direct access if needed
export { pool };

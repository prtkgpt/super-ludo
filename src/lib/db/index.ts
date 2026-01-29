// Neon Database Connection
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { drizzle, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy database connection - only created when needed
let _db: NeonHttpDatabase<typeof schema> | null = null;

// Get database instance (lazy initialization)
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured');
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// For backwards compatibility - will throw if DATABASE_URL not set
export const db = {
  get instance() {
    return getDb();
  }
};

// Export schema for use in queries
export { schema };

// Helper to check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

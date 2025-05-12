import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if we're in production environment
const isProduction = process.env.NODE_ENV === 'production';

// Configure pool options based on environment
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // For production, use internal DATABASE_URL with SSL settings
  ssl: isProduction ? {
    rejectUnauthorized: false // Allows self-signed certificates
  } : undefined
};

// Log database connection (without sensitive info)
console.log(`Connecting to database in ${isProduction ? 'production' : 'development'} mode`);

// Create connection pool
export const pool = new Pool(poolConfig);

// Add error handling for connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Initialize Drizzle with the pool
export const db = drizzle(pool, { schema });

// Test connection
pool.query('SELECT NOW()')
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection error:', err));

import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = 
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL;
      
    if (!connectionString) {
      throw new Error('FATAL: Database connection string is not provided in environment variables.');
    }

    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' 
           ? { rejectUnauthorized: true } 
           : { rejectUnauthorized: false }, // Use true in prod for actual CA verification
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

export async function queryDb(text: string, params?: any[]) {
  const p = getDbPool();
  return await p.query(text, params);
}

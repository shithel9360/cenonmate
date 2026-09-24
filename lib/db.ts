import { Pool } from 'pg';

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  'postgresql://postgres.fsbyjmsziobxbkdyoxhr:Shithel02082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
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

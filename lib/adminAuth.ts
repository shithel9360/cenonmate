import crypto from 'crypto';
import { cookies } from 'next/headers';
import { queryDb } from './db';

const AUTH_COOKIE_NAME = 'cenonmate_admin_session';

export function getSecretSeed(): string {
  const seed = process.env.ADMIN_SESSION_SECRET;
  if (!seed) {
    throw new Error('FATAL: ADMIN_SESSION_SECRET is missing. Server refusing to authenticate.');
  }
  return seed;
}

export function createAdminToken(version: number): string {
  const payload = JSON.stringify({
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 1 * 24 * 60 * 60 * 1000, // 1 day validity
    version,
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecretSeed()).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyAdminToken(token: string | null | undefined, currentVersion: number): boolean {
  if (!token || !token.includes('.')) return false;
  const [b64, sig] = token.split('.');
  
  let expectedSig;
  try {
     expectedSig = crypto.createHmac('sha256', getSecretSeed()).update(b64).digest('base64url');
  } catch(e) {
     return false; // secret missing or misconfigured
  }
  
  // Timing safe comparison to prevent signature forgery attacks
  let sigBuffer;
  let expectedBuffer;
  try {
    sigBuffer = Buffer.from(sig, 'base64url');
    expectedBuffer = Buffer.from(expectedSig, 'base64url');
  } catch(e) {
    return false;
  }
  
  if (sigBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return false;

  try {
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString('utf8'));
    return payload.exp > Date.now() && payload.role === 'admin' && payload.version === currentVersion;
  } catch {
    return false;
  }
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    const res = await queryDb('SELECT value FROM public.site_settings WHERE key = $1', ['admin_session_version']);
    const version = res.rows.length > 0 ? Number(res.rows[0].value) : 1;
    return verifyAdminToken(token, version);
  } catch {
    return false; // Fail closed
  }
}

export const ADMIN_COOKIE_NAME = AUTH_COOKIE_NAME;

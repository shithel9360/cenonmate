import crypto from 'crypto';
import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'cenonmate_admin_session';

export function getSecretSeed(): string {
  const seed = process.env.ADMIN_SESSION_SECRET;
  if (!seed) {
    throw new Error('FATAL: ADMIN_SESSION_SECRET is missing. Server refusing to authenticate.');
  }
  return seed;
}

export function createAdminToken(): string {
  const payload = JSON.stringify({
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 1 * 24 * 60 * 60 * 1000, // 1 day validity (shortened session)
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecretSeed()).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
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
    return payload.exp > Date.now() && payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  return verifyAdminToken(token);
}

export const ADMIN_COOKIE_NAME = AUTH_COOKIE_NAME;

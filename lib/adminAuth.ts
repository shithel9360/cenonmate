import crypto from 'crypto';
import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'cenonmate_admin_session';
const SECRET_SEED = process.env.SUPABASE_JWT_SECRET || 'cenonmate-secure-admin-token-seed-2026-auth';

export function createAdminToken(): string {
  const payload = JSON.stringify({
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
  });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET_SEED).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [b64, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', SECRET_SEED).update(b64).digest('base64url');
  if (sig !== expectedSig) return false;

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

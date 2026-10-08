import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/adminAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const isAuth = await isAuthenticatedAdmin();
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const allowed = await checkRateLimit(ip, 'change-pwd', { windowMs: 15 * 60 * 1000, max: 10 });
    
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Strong password policy
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long.' }, { status: 400 });
    }

    // Verify current password
    const res = await queryDb('SELECT value FROM public.site_settings WHERE key = $1', ['admin_password_hash']);
    if (res.rows.length === 0 || !res.rows[0].value) {
      return NextResponse.json({ error: 'Authentication configuration error.' }, { status: 500 });
    }

    const dbHashVal = res.rows[0].value;
    const validHash = typeof dbHashVal === 'string' ? dbHashVal : JSON.parse(JSON.stringify(dbHashVal));

    const isMatch = await bcrypt.compare(currentPassword, validHash);
    if (!isMatch) {
      await new Promise((r) => setTimeout(r, 500)); // timing attack mitigation
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });
    }

    // Generate new hash
    const newHash = await bcrypt.hash(newPassword, 12);
    
    await queryDb(
      `INSERT INTO public.site_settings (key, value, updated_at) 
       VALUES ($1, $2::jsonb, now()) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      ['admin_password_hash', JSON.stringify(newHash)]
    );

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

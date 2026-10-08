import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';
import { checkRateLimit } from '@/lib/rateLimit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const allowed = await checkRateLimit(ip, 'login', { windowMs: 15 * 60 * 1000, max: 6 });
    
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // Query password hash from site_settings securely on the server
    const res = await queryDb('SELECT value FROM public.site_settings WHERE key = $1', ['admin_password_hash']);
    
    if (res.rows.length === 0 || !res.rows[0].value) {
      return NextResponse.json({ error: 'Admin not configured properly.' }, { status: 500 });
    }

    const dbHashVal = res.rows[0].value;
    const validHash = typeof dbHashVal === 'string' ? dbHashVal : JSON.parse(JSON.stringify(dbHashVal));

    // Compare with bcrypt
    const isMatch = await bcrypt.compare(password, validHash);

    if (!isMatch) {
      await new Promise((r) => setTimeout(r, 400)); // Delay for timing attack mitigation
      return NextResponse.json({ error: 'Incorrect Password. Please try again.' }, { status: 401 });
    }

    const token = createAdminToken();
    const isProd = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: 1 * 24 * 60 * 60, // 1 day validity
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';
import bcrypt from 'bcryptjs';

// Simple rate limiter map in memory (resets on server restart or edge function spin down)
const loginAttempts = new Map<string, { count: number, resetAt: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const attempts = loginAttempts.get(ip);
    
    if (attempts && attempts.resetAt > now) {
       if (attempts.count > 5) {
          return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
       }
    } else {
       loginAttempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 }); // 15 min lock
    }

    const { password } = await request.json();
    const currentAttempts = loginAttempts.get(ip)!;

    if (!password || typeof password !== 'string') {
      currentAttempts.count += 1;
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
      currentAttempts.count += 1;
      await new Promise((r) => setTimeout(r, 400)); // Delay for timing attack mitigation
      return NextResponse.json({ error: 'Incorrect Password. Please try again.' }, { status: 401 });
    }
    
    currentAttempts.count = 0; // reset on success

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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    // Query password from site_settings securely on the server
    const res = await queryDb('SELECT value FROM public.site_settings WHERE key = $1', ['admin_password']);
    
    let validPassword = 'Shithel02082005';
    if (res.rows.length > 0 && res.rows[0].value) {
      const dbVal = res.rows[0].value;
      validPassword = typeof dbVal === 'string' ? dbVal : JSON.parse(JSON.stringify(dbVal));
    }

    if (password !== validPassword) {
      // Small delay to prevent timing / brute force attacks
      await new Promise((r) => setTimeout(r, 400));
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

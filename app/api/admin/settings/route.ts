import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/adminAuth';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await queryDb('SELECT key, value FROM public.site_settings');
    return NextResponse.json({ settings: res.rows });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    if (key === 'admin_password') {
      if (!value || typeof value !== 'string' || value.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
    }

    const jsonValue = JSON.stringify(value);
    await queryDb(
      `INSERT INTO public.site_settings (key, value, updated_at) 
       VALUES ($1, $2::jsonb, now()) 
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [key, jsonValue]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

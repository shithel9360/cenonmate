import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const allowed = await checkRateLimit(ip, 'contact', { windowMs: 60 * 60 * 1000, max: 5 }); // 5 per hour
    
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { name, email, message, _honeypot } = body;

    // Honeypot check (bot protection)
    if (_honeypot) {
      return NextResponse.json({ success: true }); // Silently succeed for bots
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return NextResponse.json({ error: 'Invalid name provided' }, { status: 400 });
    }
    
    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || email.length > 255) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    
    if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long or empty' }, { status: 400 });
    }

    // Insert server-side to avoid exposing Supabase anon key / allowing malicious inserts directly
    await queryDb(
      `INSERT INTO public.inquiries (name, email, details) VALUES ($1, $2, $3)`,
      [name.trim(), email.trim(), message.trim()]
    );

    return NextResponse.json({ success: true, message: 'Inquiry submitted successfully' });
  } catch (error: any) {
    // Never expose database errors
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

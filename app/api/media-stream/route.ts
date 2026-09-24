import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code') || searchParams.get('id');

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://www.instagram.com/reel/${code}/embed/`, {
      headers: {
        'User-Agent': 'curl/8.4.0',
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const body = await res.text();
      const idx = body.indexOf('video_url');
      if (idx !== -1) {
        const start = body.indexOf('https:', idx);
        const end = body.indexOf('.mp4', start) + 4;
        const afterMp4 = body.substring(end);
        const queryEnd = afterMp4.search(/[\"\\\s]/);
        const fullRaw = body.substring(start, end + (queryEnd !== -1 ? queryEnd : 0));
        const clean = fullRaw.replaceAll('\\u0026', '&').replaceAll('\\/', '/').replaceAll('\\\\/', '/');

        // Redirect directly to the live MP4 stream
        return NextResponse.redirect(clean, 302);
      }
    }
  } catch (err: any) {
    console.error('Error streaming Instagram video:', err.message);
  }

  return NextResponse.json({ error: 'Video stream not found' }, { status: 404 });
}

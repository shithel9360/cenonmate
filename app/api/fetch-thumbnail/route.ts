import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  const trimmed = url.trim();

  // 1. YouTube (Shorts, Regular, youtu.be)
  let ytId = '';
  const ytShort = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (ytShort) {
    ytId = ytShort[1];
  } else if (trimmed.includes('youtu.be/')) {
    ytId = trimmed.split('youtu.be/')[1]?.split(/[?&]/)[0] || '';
  } else if (trimmed.includes('watch?v=')) {
    ytId = trimmed.split('watch?v=')[1]?.split(/[?&]/)[0] || '';
  } else if (trimmed.includes('/embed/')) {
    ytId = trimmed.split('/embed/')[1]?.split(/[?&]/)[0] || '';
  }

  if (ytId) {
    return NextResponse.json({
      success: true,
      platform: 'youtube',
      thumbnailUrl: `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg`,
      hqThumbnailUrl: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    });
  }

  // 2. Instagram (Reel, Post, TV)
  const igMatch = trimmed.match(/(?:instagram\.com|instagr\.am)\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (igMatch) {
    const shortcode = igMatch[1];
    try {
      const res = await fetch(`https://www.instagram.com/reel/${shortcode}/embed/`, {
        headers: {
          'User-Agent': 'curl/8.4.0',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const html = await res.text();
        const matches = html.match(/https:\/\/[^"'\s]+t51\.82787-15[^"'\s]*\.jpg[^"'\s]*/g);
        if (matches && matches.length > 0) {
          const cleanUrl = matches[0].replace(/&amp;/g, '&').split(' ')[0];
          return NextResponse.json({
            success: true,
            platform: 'instagram',
            thumbnailUrl: cleanUrl,
          });
        }
      }
    } catch (e: any) {
      console.error('Error fetching Instagram thumbnail:', e.message);
    }

    return NextResponse.json({
      success: false,
      platform: 'instagram',
      message: 'Could not extract thumbnail',
    });
  }

  return NextResponse.json({
    success: false,
    message: 'Unsupported URL platform',
  });
}

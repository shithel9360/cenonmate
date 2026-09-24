import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/adminAuth';

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const res = await queryDb('SELECT * FROM public.videos ORDER BY created_at DESC');
    return NextResponse.json({ videos: res.rows });
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, videoUrl, thumbnailUrl, description, mediaType, isFeatured } = await request.json();

    if (!title || !videoUrl) {
      return NextResponse.json({ error: 'Title and videoUrl are required' }, { status: 400 });
    }

    if (isFeatured) {
      await queryDb('UPDATE public.videos SET is_featured = false');
    }

    const res = await queryDb(
      `INSERT INTO public.videos (title, video_url, thumbnail_url, description, media_type, is_featured, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       RETURNING *`,
      [title, videoUrl, thumbnailUrl || null, description || null, mediaType || 'video', Boolean(isFeatured)]
    );

    return NextResponse.json({ success: true, video: res.rows[0] });
  } catch (error: any) {
    console.error('Error adding video:', error);
    return NextResponse.json({ error: 'Failed to add video' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 });
    }

    await queryDb('DELETE FROM public.videos WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting video:', error);
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 });
  }
}

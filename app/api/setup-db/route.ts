import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'cenonmate2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connectionString = 
    process.env.POSTGRES_URL_NON_POOLING || 
    process.env.POSTGRES_URL || 
    process.env.POSTGRES_PRISMA_URL;

  if (!connectionString) {
    return NextResponse.json({ 
      error: 'POSTGRES_URL not found in environment' 
    }, { status: 500 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // 1. Create Videos Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.videos (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        title text NOT NULL,
        video_url text NOT NULL,
        thumbnail_url text,
        description text,
        media_type text DEFAULT 'video',
        is_featured boolean DEFAULT false,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Allow public read access on videos') THEN
          CREATE POLICY "Allow public read access on videos" ON public.videos FOR SELECT USING (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Allow public insert on videos') THEN
          CREATE POLICY "Allow public insert on videos" ON public.videos FOR INSERT WITH CHECK (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Allow public update on videos') THEN
          CREATE POLICY "Allow public update on videos" ON public.videos FOR UPDATE USING (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Allow public delete on videos') THEN
          CREATE POLICY "Allow public delete on videos" ON public.videos FOR DELETE USING (true);
        END IF;
      END $$;
    `);

    // 2. Create Inquiries Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.inquiries (
        id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        details text NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );

      ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inquiries' AND policyname = 'Allow public insert on inquiries') THEN
          CREATE POLICY "Allow public insert on inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inquiries' AND policyname = 'Allow public select on inquiries') THEN
          CREATE POLICY "Allow public select on inquiries" ON public.inquiries FOR SELECT USING (true);
        END IF;
      END $$;
    `);

    // 3. Insert initial featured video if empty
    const checkVideos = await client.query('SELECT count(*) FROM public.videos');
    if (parseInt(checkVideos.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO public.videos (title, video_url, thumbnail_url, description, media_type, is_featured)
        VALUES 
        ('$7000 Portfolio Website With Free AI Tools', 'https://www.youtube.com/watch?v=tf_yi6DtDOQ', 'https://i.ytimg.com/vi/tf_yi6DtDOQ/hqdefault.jpg', 'High-end AI portfolio creation and cinematic visual engineering breakdown.', 'video', true),
        ('Cenonmate 2026 AI Video Showreel', 'https://www.youtube.com/@Cenonmate-z6j', 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1600&auto=format&fit=crop', 'Commercial grade AI video editing, pacing, and sound design for global brands.', 'video', false),
        ('Speed Edit: AI Visual Hook in 5 Seconds', 'https://www.youtube.com/@Cenonmate-z6j', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1000&auto=format&fit=crop', 'How to retain 85% audience attention with pacing.', 'short', false),
        ('3D Hyper-Realistic Product Simulation', 'https://www.youtube.com/@Cenonmate-z6j', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', 'From 2D concept to rotating 3D cinematic rendering.', 'short', false),
        ('Cenonmate Instagram Reel: Neon Cyber Aesthetics', 'https://www.instagram.com/cenon_mate/', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop', 'Exclusive behind-the-scenes editing workflow.', 'reel', false);
      `);
    }

    await client.end();

    return NextResponse.json({
      success: true,
      message: 'Supabase database tables (videos, inquiries) created successfully with initial data and security policies!'
    });
  } catch (error: any) {
    if (client) await client.end().catch(() => {});
    return NextResponse.json({ 
      error: error.message || 'Database setup failed' 
    }, { status: 500 });
  }
}

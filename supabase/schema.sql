-- 1. Create Videos / Portfolio Table
create table if not exists public.videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  video_url text not null,
  thumbnail_url text,
  description text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.videos enable row level security;

-- Allow public read access to videos
create policy "Allow public read access on videos"
  on public.videos for select
  using (true);

-- Allow insert/update/delete for anon/admin
create policy "Allow public insert on videos"
  on public.videos for insert
  with check (true);

create policy "Allow public update on videos"
  on public.videos for update
  using (true);

create policy "Allow public delete on videos"
  on public.videos for delete
  using (true);


-- 2. Create Inquiries / Client Leads Table
create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  details text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.inquiries enable row level security;

-- Allow anyone to submit an inquiry
create policy "Allow public insert on inquiries"
  on public.inquiries for insert
  with check (true);

-- Allow reading inquiries
create policy "Allow public select on inquiries"
  on public.inquiries for select
  using (true);

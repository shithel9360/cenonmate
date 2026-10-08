const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres.fsbyjmsziobxbkdyoxhr:Shithel02082005@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    // 1. Fix site_settings RLS
    await pool.query(`DROP POLICY IF EXISTS "Enable read access for all users" ON public.site_settings;`);
    await pool.query(`DROP POLICY IF EXISTS "Public read access" ON public.site_settings;`);
    await pool.query(`DROP POLICY IF EXISTS "Public read access for CMS keys only" ON public.site_settings;`);
    
    // Explicit whitelist policy
    await pool.query(`
      CREATE POLICY "Public read access for CMS keys only" 
      ON public.site_settings 
      FOR SELECT 
      USING (key IN ('hero_settings', 'services_settings', 'social_settings'));
    `);

    // 2. Fix inquiries RLS (Remove public insert)
    await pool.query(`DROP POLICY IF EXISTS "Enable insert for all users" ON public.inquiries;`);
    await pool.query(`DROP POLICY IF EXISTS "Enable insert access for all users" ON public.inquiries;`);
    await pool.query(`DROP POLICY IF EXISTS "Public insert access" ON public.inquiries;`);
    await pool.query(`DROP POLICY IF EXISTS "Anyone can submit inquiry" ON public.inquiries;`);

    await pool.query(`
      INSERT INTO public.site_settings (key, value, updated_at) 
      VALUES ('admin_session_version', '1'::jsonb, now()) 
      ON CONFLICT (key) DO NOTHING;
    `);

    // Ensure RLS is enabled
    await pool.query(`ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;`);
    await pool.query(`ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;`);

    // Fetch the site_settings to verify
    const res = await pool.query(`SELECT key FROM public.site_settings`);
    console.log("Existing keys:", res.rows.map(r => r.key));

    console.log("DB security updated successfully.");
  } catch (err) {
    console.error("DB Error:", err);
  } finally {
    await pool.end();
  }
}

run();

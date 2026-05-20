-- Pricing waitlist (replaces Paddle/Clerk billing for now)
CREATE TABLE IF NOT EXISTS pricing_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  plan_interest TEXT DEFAULT 'pro' CHECK (plan_interest IN ('free', 'pro', 'agency')),
  use_case TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pricing_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON pricing_waitlist FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view waitlist"
  ON pricing_waitlist FOR SELECT
  USING (auth.uid()::text IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Site settings (key/value store for admin controls)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  USING (auth.uid()::text IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- Seed default settings
INSERT INTO site_settings (key, value, description) VALUES
  ('site_maintenance_mode',           'false',  'Show maintenance banner to visitors'),
  ('site_announcement_banner',        '',       'Top banner text (empty = hidden)'),
  ('marketplace_featured_ids',        '',       'Comma-separated workflow IDs to pin'),
  ('marketplace_submissions_open',    'true',   'Allow workflow submissions'),
  ('community_discord_url',           'https://discord.gg/your-invite', 'Discord invite URL'),
  ('community_member_count_override', '',       'Override member count display')
ON CONFLICT (key) DO NOTHING;

-- Ensure admin role for known admin email
UPDATE profiles SET role = 'admin'
WHERE email = 'raianasan10@gmail.com';

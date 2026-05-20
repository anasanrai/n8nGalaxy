-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  category TEXT DEFAULT 'general',
  author_id TEXT REFERENCES profiles(id),
  featured_image_url TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter/waitlist signups
CREATE TABLE IF NOT EXISTS newsletter_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'community',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  USING (auth.uid()::text IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert newsletter signup"
  ON newsletter_signups FOR INSERT WITH CHECK (true);

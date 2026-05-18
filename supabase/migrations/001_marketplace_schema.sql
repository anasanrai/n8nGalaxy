-- 001_marketplace_schema.sql
-- Pivot from sandbox/hosting platform to marketplace + learn + community platform
-- Run this in Supabase SQL Editor (File → New Query)

-- ── Extensions ──────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Profiles table (required by Supabase auth pattern) ─────────────────────────
-- Creates profiles from auth.users if it doesn't exist yet
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','pro','agency')),
  paddle_customer_id TEXT,
  credits       INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users into profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ── Workflows (replaces old `templates` table) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS workflows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'other',
  price_cents     INTEGER NOT NULL DEFAULT 0,
  paddle_price_id TEXT,
  file_url        TEXT,
  preview_url     TEXT,
  node_count      INTEGER NOT NULL DEFAULT 0,
  tools           TEXT[] DEFAULT '{}',
  featured        BOOLEAN NOT NULL DEFAULT false,
  published       BOOLEAN NOT NULL DEFAULT false,
  author_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','pending','draft')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate data from old templates table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'templates') THEN
    INSERT INTO workflows (id, slug, title, description, category, price_cents, file_url, preview_url, node_count, tools, featured, published, created_at, updated_at)
    SELECT id, slug, title, description, category, price_cents, file_path, preview_url, node_count, tools, featured, published, created_at, created_at
    FROM templates
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ── Courses ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  difficulty      TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  price_cents     INTEGER NOT NULL DEFAULT 0,
  paddle_price_id TEXT,
  lessons         JSONB DEFAULT '[]'::jsonb,
  lesson_count    INTEGER NOT NULL DEFAULT 0,
  featured        BOOLEAN NOT NULL DEFAULT false,
  published       BOOLEAN NOT NULL DEFAULT false,
  author_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Purchases (alter existing table or create fresh) ───────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'purchases') THEN
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL;
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id) ON DELETE SET NULL;
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS paddle_transaction_id TEXT;
    ALTER TABLE purchases ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','refunded','pending'));
  ELSE
    CREATE TABLE purchases (
      id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      template_id           UUID,
      workflow_id           UUID REFERENCES workflows(id) ON DELETE SET NULL,
      course_id             UUID REFERENCES courses(id) ON DELETE SET NULL,
      paddle_transaction_id TEXT,
      amount_cents          INTEGER,
      status                TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','refunded','pending')),
      download_url          TEXT,
      download_expires_at   TIMESTAMPTZ,
      downloaded_at         TIMESTAMPTZ,
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- ── Subscriptions (alter existing or create fresh) ────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paddle_subscription_id TEXT;
  ELSE
    CREATE TABLE subscriptions (
      id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      plan                    TEXT NOT NULL,
      paddle_subscription_id  TEXT,
      status                  TEXT NOT NULL DEFAULT 'active',
      current_period_end      TIMESTAMPTZ,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- ── Submissions (user-submitted workflows) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS submissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'other',
  file_url    TEXT,
  tools       TEXT[] DEFAULT '{}',
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Pages (admin-editable content) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT UNIQUE NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Site Settings (admin-editable config) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT UNIQUE NOT NULL,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('social_links', '{"discord":"","twitter":"","github":"","youtube":""}'::jsonb),
  ('trust_copy', '"Billed monthly. Cancel anytime."'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_workflows_published   ON workflows(published);
CREATE INDEX IF NOT EXISTS idx_workflows_category    ON workflows(category);
CREATE INDEX IF NOT EXISTS idx_workflows_featured    ON workflows(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_workflows_status      ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_courses_published     ON courses(published);
CREATE INDEX IF NOT EXISTS idx_courses_difficulty    ON courses(difficulty);
CREATE INDEX IF NOT EXISTS idx_submissions_status    ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id     ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_workflow_id ON purchases(workflow_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course_id   ON purchases(course_id);

-- ── RLS Policies ─────────────────────────────────────────────────────────────
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Everyone can read published workflows/courses
CREATE POLICY "Anyone can read published workflows"
  ON workflows FOR SELECT
  USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Anyone can read published courses"
  ON courses FOR SELECT
  USING (published = true OR auth.uid() = author_id);

-- Submissions: users see own, admins see all
CREATE POLICY "Users can read own submissions"
  ON submissions FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Users can create submissions"
  ON submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins CRUD workflows
CREATE POLICY "Admins can insert workflows"
  ON workflows FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update workflows"
  ON workflows FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Admins CRUD courses
CREATE POLICY "Admins can insert courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update courses"
  ON courses FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Admins update submissions
CREATE POLICY "Admins can update submissions"
  ON submissions FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Pages: anyone read, admins manage
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pages"
  ON pages FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage pages"
  ON pages FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Anyone can read site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site_settings"
  ON site_settings FOR ALL
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Set initial admin (change the email to your admin email)
UPDATE profiles SET role = 'admin' WHERE email = 'admin@n8ngalaxy.com';

-- ── Drop old tables (uncomment after verifying migration) ────────────────────
-- DROP TABLE IF EXISTS templates CASCADE;
-- DROP TABLE IF EXISTS sandbox_sessions CASCADE;
-- DROP TABLE IF EXISTS waitlist_signups CASCADE;

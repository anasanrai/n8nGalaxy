-- ============================================================
-- n8nGalaxy — MASTER SCHEMA
-- Replaces migrations 001–004. Run this once on a fresh project.
-- Paste into Supabase Dashboard → SQL Editor → Run
-- ============================================================


-- ── 1. DROP EVERYTHING (clean slate) ─────────────────────────────────────────

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION  IF EXISTS public.handle_new_user() CASCADE;

DROP TABLE IF EXISTS pricing_waitlist   CASCADE;
DROP TABLE IF EXISTS newsletter_signups CASCADE;
DROP TABLE IF EXISTS blog_posts         CASCADE;
DROP TABLE IF EXISTS site_settings      CASCADE;
DROP TABLE IF EXISTS pages              CASCADE;
DROP TABLE IF EXISTS subscriptions      CASCADE;
DROP TABLE IF EXISTS purchases          CASCADE;
DROP TABLE IF EXISTS submissions        CASCADE;
DROP TABLE IF EXISTS courses            CASCADE;
DROP TABLE IF EXISTS workflows          CASCADE;
DROP TABLE IF EXISTS profiles           CASCADE;

-- Legacy tables from old codebase (safe to drop)
DROP TABLE IF EXISTS templates          CASCADE;
DROP TABLE IF EXISTS sandbox_sessions   CASCADE;
DROP TABLE IF EXISTS waitlist_signups   CASCADE;
DROP TABLE IF EXISTS user_agents        CASCADE;


-- ── 2. EXTENSIONS ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 3. PROFILES ───────────────────────────────────────────────────────────────
-- Clerk user IDs are strings (e.g. user_2abc123) — NOT UUIDs.
-- No FK to auth.users; Clerk manages authentication.

CREATE TABLE profiles (
  id          TEXT PRIMARY KEY,
  email       TEXT NOT NULL UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user', 'admin')),
  plan        TEXT NOT NULL DEFAULT 'free'
                CHECK (plan IN ('free', 'pro', 'agency')),
  credits     INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 4. WORKFLOWS ──────────────────────────────────────────────────────────────

CREATE TABLE workflows (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT        UNIQUE NOT NULL,
  title       TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'other',
  price_cents INTEGER     NOT NULL DEFAULT 0,
  file_url    TEXT,
  preview_url TEXT,
  node_count  INTEGER     NOT NULL DEFAULT 0,
  tools       TEXT[]      DEFAULT '{}',
  featured    BOOLEAN     NOT NULL DEFAULT false,
  published   BOOLEAN     NOT NULL DEFAULT false,
  author_id   TEXT        REFERENCES profiles(id) ON DELETE SET NULL,
  status      TEXT        NOT NULL DEFAULT 'approved'
                CHECK (status IN ('approved', 'pending', 'draft')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 5. COURSES ────────────────────────────────────────────────────────────────

CREATE TABLE courses (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT        UNIQUE NOT NULL,
  title        TEXT        NOT NULL,
  description  TEXT,
  difficulty   TEXT        NOT NULL DEFAULT 'beginner'
                 CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  price_cents  INTEGER     NOT NULL DEFAULT 0,
  lessons      JSONB       DEFAULT '[]'::jsonb,
  lesson_count INTEGER     NOT NULL DEFAULT 0,
  featured     BOOLEAN     NOT NULL DEFAULT false,
  published    BOOLEAN     NOT NULL DEFAULT false,
  author_id    TEXT        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 6. PURCHASES ──────────────────────────────────────────────────────────────

CREATE TABLE purchases (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      TEXT        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workflow_id  UUID        REFERENCES workflows(id) ON DELETE SET NULL,
  course_id    UUID        REFERENCES courses(id)   ON DELETE SET NULL,
  amount_cents INTEGER,
  status       TEXT        NOT NULL DEFAULT 'completed'
                 CHECK (status IN ('completed', 'refunded', 'pending')),
  download_url TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 7. SUBSCRIPTIONS ─────────────────────────────────────────────────────────

CREATE TABLE subscriptions (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            TEXT        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan               TEXT        NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 8. SUBMISSIONS ────────────────────────────────────────────────────────────

CREATE TABLE submissions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     TEXT        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  category    TEXT        NOT NULL DEFAULT 'other',
  file_url    TEXT,
  tools       TEXT[]      DEFAULT '{}',
  status      TEXT        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 9. BLOG POSTS ─────────────────────────────────────────────────────────────

CREATE TABLE blog_posts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug               TEXT        UNIQUE NOT NULL,
  title              TEXT        NOT NULL,
  excerpt            TEXT,
  content            TEXT        NOT NULL DEFAULT '',
  category           TEXT        DEFAULT 'general',
  author_id          TEXT        REFERENCES profiles(id) ON DELETE SET NULL,
  featured_image_url TEXT,
  published          BOOLEAN     DEFAULT false,
  featured           BOOLEAN     DEFAULT false,
  views              INTEGER     DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);


-- ── 10. NEWSLETTER SIGNUPS ───────────────────────────────────────────────────

CREATE TABLE newsletter_signups (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        UNIQUE NOT NULL,
  source     TEXT        DEFAULT 'community',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ── 11. PRICING WAITLIST ─────────────────────────────────────────────────────

CREATE TABLE pricing_waitlist (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  plan_interest TEXT        DEFAULT 'pro'
                  CHECK (plan_interest IN ('free', 'pro', 'agency')),
  use_case      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);


-- ── 12. SITE SETTINGS ────────────────────────────────────────────────────────

CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT        NOT NULL DEFAULT '',
  description TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value, description) VALUES
  ('site_maintenance_mode',           'false', 'Show maintenance banner to all visitors'),
  ('site_announcement_banner',        '',      'Top banner text — empty = hidden'),
  ('marketplace_featured_ids',        '',      'Comma-separated workflow UUIDs to pin at top'),
  ('marketplace_submissions_open',    'true',  'Allow users to submit new workflows'),
  ('community_discord_url',           '',      'Discord server invite URL'),
  ('community_member_count_override', '',      'Override displayed member count (blank = real count)')
ON CONFLICT (key) DO NOTHING;


-- ── 13. INDEXES ──────────────────────────────────────────────────────────────

CREATE INDEX idx_workflows_published   ON workflows(published);
CREATE INDEX idx_workflows_category    ON workflows(category);
CREATE INDEX idx_workflows_status      ON workflows(status);
CREATE INDEX idx_workflows_featured    ON workflows(featured)    WHERE featured  = true;
CREATE INDEX idx_courses_published     ON courses(published);
CREATE INDEX idx_submissions_status    ON submissions(status);
CREATE INDEX idx_submissions_user      ON submissions(user_id);
CREATE INDEX idx_purchases_user        ON purchases(user_id);
CREATE INDEX idx_purchases_workflow    ON purchases(workflow_id);
CREATE INDEX idx_purchases_course      ON purchases(course_id);
CREATE INDEX idx_blog_posts_slug       ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published  ON blog_posts(published)  WHERE published = true;
CREATE INDEX idx_newsletter_email      ON newsletter_signups(email);
CREATE INDEX idx_waitlist_email        ON pricing_waitlist(email);


-- ── 14. ROW LEVEL SECURITY ───────────────────────────────────────────────────
-- The app uses the Supabase anon key WITHOUT a Clerk JWT, so auth.uid()
-- is always NULL. RLS is disabled on all tables; app-layer auth
-- (AdminRoute, ProtectedRoute, Clerk) is the access gate.
-- Re-enable RLS once you wire Clerk JWTs into Supabase (future sprint).

ALTER TABLE profiles           DISABLE ROW LEVEL SECURITY;
ALTER TABLE workflows          DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses            DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchases          DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      DISABLE ROW LEVEL SECURITY;
ALTER TABLE submissions        DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts         DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_signups DISABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_waitlist   DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings      DISABLE ROW LEVEL SECURITY;


-- ── 15. ADMIN ────────────────────────────────────────────────────────────────
-- Runs after a profile row exists (created by clerkSync on first sign-in).
-- Safe to run again at any time.

UPDATE profiles
SET role = 'admin'
WHERE email IN ('raianasan10@gmail.com', 'admin@n8ngalaxy.com');

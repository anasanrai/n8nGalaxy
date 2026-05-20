-- Support Clerk user IDs (they are strings like user_2abc123, not UUIDs)
-- We need to change the profiles.id column to TEXT

-- Step 1: Drop existing FK constraints that reference profiles.id
ALTER TABLE purchases DROP CONSTRAINT IF EXISTS purchases_user_id_fkey;
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_user_id_fkey;

-- Step 2: Change profiles.id to TEXT (Clerk IDs are not UUIDs)
ALTER TABLE profiles ALTER COLUMN id TYPE TEXT;

-- Step 3: Change FK columns to TEXT
ALTER TABLE purchases ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE subscriptions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE submissions ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Change workflow/course author_id to TEXT
ALTER TABLE workflows ALTER COLUMN author_id TYPE TEXT;
ALTER TABLE courses ALTER COLUMN author_id TYPE TEXT;

-- Step 5: Re-add FK constraints
ALTER TABLE purchases ADD CONSTRAINT purchases_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE submissions ADD CONSTRAINT submissions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Step 6: Update RLS policies to use text comparison
-- (auth.uid() won't work for Clerk — we use a custom check)
-- For now, disable RLS on profiles so upsert works from frontend
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 7: Update admin emails
UPDATE profiles SET role = 'admin'
WHERE email IN ('raianasan10@gmail.com', 'admin@n8ngalaxy.com');
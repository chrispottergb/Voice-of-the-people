-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geoid          TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  state          CHAR(2) NOT NULL DEFAULT 'WI',
  district_type  TEXT NOT NULL CHECK (district_type IN (
                   'congressional','state_senate','state_assembly',
                   'county','municipal'
                 )),
  boundary       JSONB,
  population     INTEGER,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Offices table
CREATE TABLE IF NOT EXISTS offices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id    UUID REFERENCES districts(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  level          TEXT NOT NULL CHECK (level IN ('federal','state','county','municipal')),
  term_years     INTEGER,
  is_partisan    BOOLEAN DEFAULT TRUE,
  seats          INTEGER DEFAULT 1,
  election_cycle TEXT,
  next_election  DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (voters + candidates)
CREATE TABLE IF NOT EXISTS profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id),
  role                TEXT NOT NULL DEFAULT 'voter' CHECK (role IN ('voter','candidate','admin')),
  full_name           TEXT,
  display_name        TEXT,
  avatar_url          TEXT,
  bio                 TEXT,
  district_ids        UUID[],
  district_id         UUID REFERENCES districts(id),
  address_hash        TEXT,
  verified_voter      BOOLEAN DEFAULT FALSE,
  office_id           UUID REFERENCES offices(id),
  party               TEXT,
  campaign_url        TEXT,
  identity_verified   BOOLEAN DEFAULT FALSE,
  persona_inquiry_id  TEXT,
  stripe_customer_id  TEXT,
  stripe_sub_id       TEXT,
  sub_status          TEXT DEFAULT 'inactive',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  candidate_id    UUID REFERENCES profiles(id) NOT NULL,
  district_id     UUID REFERENCES districts(id) NOT NULL,
  office_id       UUID REFERENCES offices(id),
  body            TEXT NOT NULL,
  topic_tags      TEXT[],
  upvotes         INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','flagged','removed')),
  moderation_note TEXT,
  is_anonymous    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Responses
CREATE TABLE IF NOT EXISTS responses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id    UUID REFERENCES questions(id) NOT NULL,
  candidate_id   UUID REFERENCES profiles(id) NOT NULL,
  body           TEXT,
  video_url      TEXT,
  video_duration INTEGER,
  status         TEXT DEFAULT 'published' CHECK (status IN ('draft','published','removed')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Upvotes
CREATE TABLE IF NOT EXISTS question_upvotes (
  question_id UUID REFERENCES questions(id),
  voter_id    UUID REFERENCES profiles(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (question_id, voter_id)
);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id          BIGSERIAL PRIMARY KEY,
  actor_id    UUID,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  payload     JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_candidate ON questions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_questions_district ON questions(district_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_offices_district ON offices(district_id);
CREATE INDEX IF NOT EXISTS idx_districts_type ON districts(district_type);
CREATE INDEX IF NOT EXISTS idx_districts_geoid ON districts(geoid);

-- Row Level Security
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Public read policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='districts' AND policyname='Public can read districts') THEN
    CREATE POLICY "Public can read districts" ON districts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='offices' AND policyname='Public can read offices') THEN
    CREATE POLICY "Public can read offices" ON offices FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Public can read candidate profiles') THEN
    CREATE POLICY "Public can read candidate profiles" ON profiles FOR SELECT USING (role = 'candidate');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='questions' AND policyname='Public can read approved questions') THEN
    CREATE POLICY "Public can read approved questions" ON questions FOR SELECT USING (status = 'approved');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='responses' AND policyname='Public can read published responses') THEN
    CREATE POLICY "Public can read published responses" ON responses FOR SELECT USING (status = 'published');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users read own profile') THEN
    CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users update own profile') THEN
    CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='questions' AND policyname='Voters insert questions in own district') THEN
    CREATE POLICY "Voters insert questions in own district" ON questions
      FOR INSERT WITH CHECK (voter_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='responses' AND policyname='Candidates insert own responses') THEN
    CREATE POLICY "Candidates insert own responses" ON responses
      FOR INSERT WITH CHECK (candidate_id = auth.uid());
  END IF;
END $$;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_responses_updated_at ON responses;
CREATE TRIGGER update_responses_updated_at
  BEFORE UPDATE ON responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

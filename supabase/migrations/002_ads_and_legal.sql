-- Ad campaigns table
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_name      TEXT NOT NULL,
  sponsor_type      TEXT NOT NULL CHECK (sponsor_type IN ('campaign','pac','convention','donor','party')),
  fec_id            TEXT,
  candidate_id      UUID REFERENCES profiles(id),
  district_ids      UUID[],
  headline          TEXT NOT NULL,
  body              TEXT NOT NULL,
  cta_label         TEXT DEFAULT 'Learn More',
  cta_url           TEXT,
  image_url         TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','running','paused','completed','rejected')),
  rejection_reason  TEXT,
  budget_cents      INTEGER NOT NULL,
  spend_cents       INTEGER DEFAULT 0,
  impressions       INTEGER DEFAULT 0,
  clicks            INTEGER DEFAULT 0,
  starts_at         TIMESTAMPTZ,
  ends_at           TIMESTAMPTZ,
  stripe_payment_id TEXT,
  created_by        UUID REFERENCES profiles(id),
  reviewed_by       UUID REFERENCES profiles(id),
  reviewed_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Ad impressions log
CREATE TABLE IF NOT EXISTS ad_impressions (
  id           BIGSERIAL PRIMARY KEY,
  campaign_id  UUID REFERENCES ad_campaigns(id) NOT NULL,
  viewer_id    UUID REFERENCES profiles(id),
  district_id  UUID REFERENCES districts(id),
  clicked      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Legal acceptance log
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_version        TEXT,
  ADD COLUMN IF NOT EXISTS privacy_version      TEXT,
  ADD COLUMN IF NOT EXISTS data_sharing_version TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_candidate ON ad_campaigns(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON ad_impressions(campaign_id);

-- RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ad_campaigns' AND policyname='Public can view running ads') THEN
    CREATE POLICY "Public can view running ads" ON ad_campaigns FOR SELECT USING (status = 'running');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ad_campaigns' AND policyname='Candidates can manage own ad campaigns') THEN
    CREATE POLICY "Candidates can manage own ad campaigns" ON ad_campaigns
      FOR ALL USING (created_by = auth.uid());
  END IF;
END $$;

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_ad_campaigns_updated_at ON ad_campaigns;
CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON ad_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

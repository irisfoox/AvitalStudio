/*
  # Create Perfume Matching Tables

  ## New Tables

  1. `perfumes` - Catalog of perfumes with matching attributes
     - id, name, brand, description, scent_family, notes_top/middle/base,
       mood, season, occasion, image_url, is_active, sort_order, created_at

  2. `perfume_matches` - Customer perfume match requests and results
     - id, reference_number, customer_name, customer_email,
       occasion, mood, preferred_intensity, preferred_families,
       avoid_notes, budget_range, matched_perfume_ids (jsonb), status,
       admin_notes, created_at

  ## Security
  - RLS enabled on both tables
  - Public can SELECT active perfumes
  - Public can INSERT perfume_matches (submit requests)
  - Authenticated (admin) users have full access
*/

CREATE TABLE IF NOT EXISTS perfumes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  brand             TEXT NOT NULL DEFAULT '',
  description       TEXT DEFAULT '',
  scent_family      TEXT NOT NULL DEFAULT 'floral' CHECK (scent_family IN ('floral','woody','oriental','fresh','citrus','gourmand','aquatic','spicy')),
  notes_top         TEXT DEFAULT '',
  notes_middle      TEXT DEFAULT '',
  notes_base        TEXT DEFAULT '',
  mood              TEXT[] DEFAULT '{}',
  season            TEXT[] DEFAULT '{}',
  occasion          TEXT[] DEFAULT '{}',
  image_url         TEXT DEFAULT '',
  is_active         BOOLEAN DEFAULT true,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active perfumes"
  ON perfumes FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert perfumes"
  ON perfumes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update perfumes"
  ON perfumes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete perfumes"
  ON perfumes FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS perfume_matches (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number      TEXT UNIQUE NOT NULL,
  customer_name         TEXT NOT NULL,
  customer_email        TEXT NOT NULL,
  customer_phone        TEXT DEFAULT '',
  occasion              TEXT NOT NULL,
  mood                  TEXT NOT NULL,
  preferred_intensity   TEXT NOT NULL DEFAULT 'medium',
  preferred_families    TEXT[] DEFAULT '{}',
  avoid_notes           TEXT DEFAULT '',
  budget_range          TEXT DEFAULT '',
  additional_info       TEXT DEFAULT '',
  matched_perfume_ids   JSONB DEFAULT '[]',
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_review','matched','sent')),
  admin_notes           TEXT DEFAULT '',
  created_at            TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE perfume_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a perfume match request"
  ON perfume_matches FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all perfume matches"
  ON perfume_matches FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update perfume matches"
  ON perfume_matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

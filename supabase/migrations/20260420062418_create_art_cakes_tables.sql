/*
  # Create Art & Cakes Website Tables

  ## New Tables
  
  1. `gallery_items` - Stores artwork and cake images for the public gallery
     - id, title, description, category, image_url, is_featured, sort_order, created_at
  
  2. `cake_orders` - Stores custom cake orders from customers
     - id, reference_number, customer info, event details, cake specs, status, admin_notes
  
  3. `contact_messages` - Stores contact form submissions
     - id, name, email, subject, message, is_read, created_at
  
  4. `testimonials` - Stores customer testimonials shown on homepage
     - id, customer_name, quote, event_type, is_visible, sort_order, created_at

  ## Security
  - RLS enabled on all tables
  - Public can SELECT gallery_items, visible testimonials
  - Public can INSERT cake_orders and contact_messages
  - Only authenticated (admin) users can SELECT/UPDATE/DELETE orders and messages
  - Authenticated users have full access to gallery_items and testimonials management
*/

CREATE TABLE IF NOT EXISTS gallery_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('painting','watercolor','mixed_media','cake','other')),
  image_url   TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT false,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery items"
  ON gallery_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (true);


CREATE TABLE IF NOT EXISTS cake_orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_email   TEXT NOT NULL,
  customer_phone   TEXT DEFAULT '',
  event_type       TEXT NOT NULL,
  event_date       DATE NOT NULL,
  theme            TEXT NOT NULL,
  cake_size        TEXT NOT NULL,
  tiers            INTEGER DEFAULT 1,
  flavour          TEXT DEFAULT '',
  dietary_notes    TEXT DEFAULT '',
  special_requests TEXT DEFAULT '',
  budget_range     TEXT DEFAULT '',
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','ready','delivered','cancelled')),
  admin_notes      TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cake_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a cake order"
  ON cake_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all orders"
  ON cake_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update orders"
  ON cake_orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


CREATE TABLE IF NOT EXISTS contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT DEFAULT '',
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


CREATE TABLE IF NOT EXISTS testimonials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  quote         TEXT NOT NULL,
  event_type    TEXT DEFAULT '',
  is_visible    BOOLEAN DEFAULT true,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (is_visible = true);

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (true);

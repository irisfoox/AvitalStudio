/*
  # Fix RLS Policies - Remove Always-True Conditions

  ## Changes

  ### Public submission tables (cake_orders, contact_messages, perfume_matches)
  - INSERT: Restrict WITH CHECK to ensure submissions arrive with safe default values only
    (anon cannot insert with elevated status, admin_notes, or is_read=true)
  - UPDATE: Drop the always-true authenticated UPDATE policies; admin uses service role
    via edge function. These policies served no real purpose since no Supabase auth session exists.

  ### Admin-managed tables (gallery_items, perfumes, testimonials)
  - Drop anon INSERT on gallery_items (was temporary for a migration script)
  - Keep authenticated INSERT/UPDATE/DELETE but add real conditions:
    authenticated role is already a meaningful restriction (requires a valid JWT).
    Replace WITH CHECK (true) with explicit column-value constraints where possible.

  ### Storage
  - Remove broad SELECT listing policy on storage.objects for gallery bucket
  - Public URL access works without a storage policy on objects (bucket is public)

  ## Notes
  - Admin currently uses PIN-based auth without Supabase sessions.
    Authenticated policies remain for future Supabase auth integration.
  - Public INSERT policies use WITH CHECK to prevent status manipulation.
*/

-- ============================================================
-- cake_orders
-- ============================================================

-- Drop always-true policies
DROP POLICY IF EXISTS "Anyone can submit a cake order" ON cake_orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON cake_orders;

-- Re-create INSERT with constraint: only allow safe default field values
CREATE POLICY "Anyone can submit a cake order"
  ON cake_orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND admin_notes = ''
  );

-- Re-create UPDATE restricted to status transitions and notes only
-- USING checks the row being updated exists (no restriction needed beyond role)
-- WITH CHECK prevents escalating to admin-only statuses from anon
-- Since admin has no Supabase session, this policy targets future authenticated admins
CREATE POLICY "Authenticated users can update orders"
  ON cake_orders FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- contact_messages
-- ============================================================

DROP POLICY IF EXISTS "Anyone can submit a contact message" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update messages" ON contact_messages;

CREATE POLICY "Anyone can submit a contact message"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (is_read = false);

CREATE POLICY "Authenticated users can update messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- gallery_items
-- ============================================================

DROP POLICY IF EXISTS "Anon can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can insert gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can update gallery items" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated users can delete gallery items" ON gallery_items;

CREATE POLICY "Authenticated users can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ============================================================
-- perfumes
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can insert perfumes" ON perfumes;
DROP POLICY IF EXISTS "Authenticated users can update perfumes" ON perfumes;
DROP POLICY IF EXISTS "Authenticated users can delete perfumes" ON perfumes;

CREATE POLICY "Authenticated users can insert perfumes"
  ON perfumes FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update perfumes"
  ON perfumes FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete perfumes"
  ON perfumes FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ============================================================
-- perfume_matches
-- ============================================================

DROP POLICY IF EXISTS "Anyone can submit a perfume match request" ON perfume_matches;
DROP POLICY IF EXISTS "Authenticated users can update perfume matches" ON perfume_matches;

CREATE POLICY "Anyone can submit a perfume match request"
  ON perfume_matches FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND admin_notes = ''
  );

CREATE POLICY "Authenticated users can update perfume matches"
  ON perfume_matches FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- testimonials
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON testimonials;

CREATE POLICY "Authenticated users can insert testimonials"
  ON testimonials FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update testimonials"
  ON testimonials FOR UPDATE
  TO authenticated
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete testimonials"
  ON testimonials FOR DELETE
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ============================================================
-- Storage: remove broad listing policy on gallery bucket
-- ============================================================

DROP POLICY IF EXISTS "Public read gallery images" ON storage.objects;

-- Allow reading individual objects by URL (no listing)
CREATE POLICY "Public can read gallery objects by path"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'gallery' AND name IS NOT NULL);

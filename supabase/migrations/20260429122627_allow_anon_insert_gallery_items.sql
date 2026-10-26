/*
  # Allow anon insert to gallery_items

  Adds an INSERT policy so that the admin (using PIN-based auth without Supabase session)
  can add gallery items. The admin panel uses sessionStorage PIN, not Supabase auth.
*/

CREATE POLICY "Anon can insert gallery items"
  ON gallery_items FOR INSERT
  TO anon
  WITH CHECK (true);

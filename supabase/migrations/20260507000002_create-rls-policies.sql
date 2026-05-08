-- Public: anyone can submit the contact form
DROP POLICY IF EXISTS "public_insert_contact" ON contact_submissions;
CREATE POLICY "public_insert_contact" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Admin only: read and delete submissions
DROP POLICY IF EXISTS "admin_read_contact" ON contact_submissions;
CREATE POLICY "admin_read_contact" ON contact_submissions
  FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

DROP POLICY IF EXISTS "admin_delete_contact" ON contact_submissions;
CREATE POLICY "admin_delete_contact" ON contact_submissions
  FOR DELETE
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

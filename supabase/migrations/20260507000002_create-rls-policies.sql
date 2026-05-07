-- Public: anyone can submit the contact form
CREATE POLICY "public_insert_contact" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Admin only: read and delete submissions
CREATE POLICY "admin_read_contact" ON contact_submissions
  FOR SELECT
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

CREATE POLICY "admin_delete_contact" ON contact_submissions
  FOR DELETE
  USING (auth.jwt() ->> 'email' = current_setting('app.admin_email', true));

-- Run this once per project in Supabase SQL editor:
-- ALTER DATABASE postgres SET app.admin_email = 'esteban.montero@gmail.com';

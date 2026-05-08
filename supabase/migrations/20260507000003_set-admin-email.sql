-- Set database-level config for RLS admin policies.
-- current_setting('app.admin_email', true) in policies reads this value.
ALTER DATABASE postgres SET "app.admin_email" = 'esteban.montero@gmail.com';

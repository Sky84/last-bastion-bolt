-- Migration to add admin user

-- Enable pgcrypto extension if not already enabled (required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert admin user into auth.users
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
VALUES (uuid_generate_v4(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin', crypt('admin', gen_salt('bf')), NOW(), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', true);

-- Get the UUID of the newly inserted admin user
WITH admin_user AS (
  SELECT id FROM auth.users WHERE email = 'admin'
)
-- Insert admin profile into public.profiles
INSERT INTO public.profiles (id, name)
SELECT id, 'Administrator' FROM admin_user;

-- Grant admin role (if you have custom roles defined, adjust accordingly)
-- This is a basic example, you might need more specific role/permission setup
-- For example, if you have a 'admin_role' defined:
-- GRANT admin_role TO admin; -- (This syntax might vary depending on your role setup)

-- In a simpler setup, you might not need explicit role granting if 'is_super_admin' is sufficient.

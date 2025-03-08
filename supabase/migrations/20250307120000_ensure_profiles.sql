-- Migration to ensure every auth.user has a profile in public.profiles

-- Insert missing profiles
INSERT INTO public.profiles (id, name)
SELECT users.id, COALESCE(users.email, 'Unknown User') -- Default name, consider using email or 'Unknown User'
FROM auth.users
LEFT JOIN public.profiles ON users.id = profiles.id
WHERE profiles.id IS NULL;

-- You might want to add a check to prevent null names in the future
-- For example, adding a NOT NULL constraint to the name column if not already present
-- This depends on your requirements and if 'Unknown User' is acceptable as a default.

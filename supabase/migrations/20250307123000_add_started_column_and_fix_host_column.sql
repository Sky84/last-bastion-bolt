-- This migration adds the 'started' column to the 'lobbies' table
-- and ensures the 'host' column is correctly referenced as 'host_id'.

ALTER TABLE public.lobbies
ADD COLUMN started BOOLEAN NOT NULL DEFAULT FALSE;

-- The 'host' column should be 'host_id' to correctly reference the profiles table.
-- Verify and rename if necessary.
-- This assumes your 'lobbies' table was created with 'host_id' as in the previous migration.

-- If for some reason it was created as just 'host', and you need to rename:
-- ALTER TABLE public.lobbies RENAME COLUMN host TO host_id;

-- Ensure the foreign key constraint is correctly set to 'host_id'
-- if you renamed the column or if it wasn't set correctly before.
-- This assumes 'host_id' references the 'id' column in the 'profiles' table.

-- If the foreign key constraint is missing or incorrect, add/replace it:
-- ALTER TABLE public.lobbies
-- DROP CONSTRAINT IF EXISTS lobbies_host_fkey; -- Drop existing constraint if it exists
-- ALTER TABLE public.lobbies
-- ADD CONSTRAINT lobbies_host_fkey
-- FOREIGN KEY (host_id)
-- REFERENCES public.profiles(id)
-- ON DELETE CASCADE;


-- Optionally, add an index on the 'started' column if you frequently query based on it
-- CREATE INDEX IF NOT EXISTS idx_lobbies_started ON public.lobbies(started);

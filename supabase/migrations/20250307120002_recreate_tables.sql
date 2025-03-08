-- Migration to recreate tables

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT
);

CREATE TABLE public.lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    max_players INTEGER NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    game_state JSONB
);

ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- You can add indexes or more specific column constraints as needed.

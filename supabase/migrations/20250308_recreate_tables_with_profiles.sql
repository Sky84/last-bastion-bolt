-- Migration to recreate tables with profiles

-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS lobby_players CASCADE;
DROP TABLE IF EXISTS lobbies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Recreate the profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policy for profiles: Allow authenticated users to insert their own profile
CREATE POLICY "Allow users to create their profile" ON public.profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- RLS policy for profiles: Allow users to select their own profile
CREATE POLICY "Allow users to select their own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

-- RLS policy for profiles: Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());


-- Recreate the lobbies table
CREATE TABLE public.lobbies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    max_players INTEGER NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    started BOOLEAN NOT NULL DEFAULT FALSE,
    game_state JSONB
);

ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;

-- RLS policy for lobbies: Allow authenticated users to insert lobbies, but only if they are the host (via profiles)
CREATE POLICY "Hosts can create lobbies" ON public.lobbies
FOR INSERT WITH CHECK (host_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- RLS policy for lobbies: Allow authenticated users to view lobbies
CREATE POLICY "Authenticated users can view lobbies" ON public.lobbies
FOR SELECT USING (auth.role() = 'authenticated');

-- RLS policy for lobbies: Allow host to update lobby (e.g., settings, start game)
CREATE POLICY "Hosts can update their lobbies" ON public.lobbies
FOR UPDATE USING (host_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())) WITH CHECK (host_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));


-- Recreate the lobby_players junction table
CREATE TABLE public.lobby_players (
    lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.auth.users(id) ON DELETE CASCADE, -- Direct reference to auth.users
    ready BOOLEAN NOT NULL DEFAULT FALSE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (lobby_id, player_id)
);

ALTER TABLE public.lobby_players ENABLE ROW LEVEL SECURITY;

-- RLS policy for lobby_players: Allow players to insert themselves into a lobby
CREATE POLICY "Players can join lobbies" ON public.lobby_players
FOR INSERT WITH CHECK (player_id = auth.uid());

-- RLS policy for lobby_players: Allow players to update their own ready status
CREATE POLICY "Players can update their ready status" ON public.lobby_players
FOR UPDATE USING (player_id = auth.uid()) WITH CHECK (player_id = auth.uid());

-- RLS policy for lobby_players: Allow lobby members to view players in the lobby
CREATE POLICY "Lobby members can view players" ON public.lobby_players
FOR SELECT USING (
    lobby_id IN (SELECT lobby_id FROM public.lobby_players WHERE player_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.lobbies WHERE id = lobby_id AND host_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()))
);

-- RLS policy for lobby_players: Allow host to remove players from the lobby
CREATE POLICY "Hosts can remove players from lobbies" ON public.lobby_players
FOR DELETE USING (EXISTS (SELECT 1 FROM public.lobbies WHERE id = lobby_id AND host_id IN (SELECT id FROM public.profiles WHERE id = auth.uid())));

-- Optionally, add indexes for performance if needed
CREATE INDEX IF NOT EXISTS idx_lobby_players_lobby_id ON public.lobby_players(lobby_id);
CREATE INDEX IF NOT EXISTS idx_lobby_players_player_id ON public.lobby_players(player_id);

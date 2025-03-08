/*
  # Create lobbies and lobby_players tables

  1. New Tables
    - `lobbies`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `host` (uuid, references profiles.id)
      - `max_players` (integer)
      - `started` (boolean)
      - `settings` (jsonb)
      - `created_at` (timestamp with time zone)

    - `lobby_players`
      - `lobby_id` (uuid, references lobbies.id)
      - `player_id` (uuid, references profiles.id)
      - `ready` (boolean)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Anyone can read lobbies
      - Only authenticated users can create/join lobbies
      - Only lobby host can update lobby settings
      - Players can update their own ready status
*/

-- Create lobbies table
CREATE TABLE IF NOT EXISTS public.lobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  host uuid REFERENCES public.profiles(id),
  max_players integer NOT NULL DEFAULT 4,
  started boolean NOT NULL DEFAULT false,
  settings jsonb DEFAULT '{"difficulty": "normal", "nightLength": 5, "startingResources": "normal"}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create lobby_players table
CREATE TABLE IF NOT EXISTS public.lobby_players (
  lobby_id uuid REFERENCES public.lobbies(id) ON DELETE CASCADE,
  player_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ready boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (lobby_id, player_id)
);

-- Enable RLS
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_players ENABLE ROW LEVEL SECURITY;

-- Policies for lobbies
CREATE POLICY "Anyone can read lobbies"
  ON public.lobbies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create lobbies"
  ON public.lobbies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host);

CREATE POLICY "Only host can update lobby"
  ON public.lobbies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host)
  WITH CHECK (auth.uid() = host);

CREATE POLICY "Host can delete lobby"
  ON public.lobbies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = host);

-- Policies for lobby_players
CREATE POLICY "Anyone can read lobby players"
  ON public.lobby_players
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can join lobbies"
  ON public.lobby_players
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update their ready status"
  ON public.lobby_players
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can leave lobbies"
  ON public.lobby_players
  FOR DELETE
  TO authenticated
  USING (auth.uid() = player_id OR 
         EXISTS (
           SELECT 1 FROM public.lobbies 
           WHERE id = lobby_id AND host = auth.uid()
         ));

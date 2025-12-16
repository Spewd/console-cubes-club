-- Create game_rooms table for multiplayer
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  player1_id TEXT NOT NULL,
  player1_name TEXT NOT NULL DEFAULT 'Player 1',
  player2_id TEXT,
  player2_name TEXT,
  player1_score INTEGER NOT NULL DEFAULT 0,
  player2_score INTEGER NOT NULL DEFAULT 0,
  winner TEXT CHECK (winner IN ('player1', 'player2', 'draw', NULL)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (for joining)
CREATE POLICY "Anyone can read game rooms"
ON public.game_rooms
FOR SELECT
USING (true);

-- Allow anyone to create rooms (guest play)
CREATE POLICY "Anyone can create game rooms"
ON public.game_rooms
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update rooms (for game state)
CREATE POLICY "Anyone can update game rooms"
ON public.game_rooms
FOR UPDATE
USING (true);

-- Allow anyone to delete rooms
CREATE POLICY "Anyone can delete game rooms"
ON public.game_rooms
FOR DELETE
USING (true);

-- Enable realtime for game_rooms
ALTER TABLE public.game_rooms REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_rooms;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_game_rooms_updated_at
BEFORE UPDATE ON public.game_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
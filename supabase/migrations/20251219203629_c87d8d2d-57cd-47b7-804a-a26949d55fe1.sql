-- First, drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create game rooms" ON game_rooms;
DROP POLICY IF EXISTS "Anyone can delete game rooms" ON game_rooms;
DROP POLICY IF EXISTS "Anyone can read game rooms" ON game_rooms;
DROP POLICY IF EXISTS "Anyone can update game rooms" ON game_rooms;

-- Add new UUID columns for authenticated user IDs
ALTER TABLE game_rooms ADD COLUMN player1_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE game_rooms ADD COLUMN player2_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create secure RLS policies using auth.uid()

-- SELECT: Users can read rooms they're part of, or waiting rooms (to join)
CREATE POLICY "Users can read their games or waiting rooms"
ON game_rooms FOR SELECT
TO authenticated
USING (
  status = 'waiting' OR 
  player1_user_id = auth.uid() OR 
  player2_user_id = auth.uid()
);

-- INSERT: Any authenticated user can create a room
CREATE POLICY "Authenticated users can create rooms"
ON game_rooms FOR INSERT
TO authenticated
WITH CHECK (player1_user_id = auth.uid());

-- UPDATE: Only participants can update their game
CREATE POLICY "Participants can update their game"
ON game_rooms FOR UPDATE
TO authenticated
USING (
  player1_user_id = auth.uid() OR 
  player2_user_id = auth.uid()
);

-- DELETE: Only the creator can delete a waiting room
CREATE POLICY "Creator can delete waiting rooms"
ON game_rooms FOR DELETE
TO authenticated
USING (
  player1_user_id = auth.uid() AND 
  status = 'waiting'
);
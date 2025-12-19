import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Board, TetrisBlock, BOARD_WIDTH, BOARD_HEIGHT } from '@/hooks/useTetris';
import type { RealtimeChannel, User } from '@supabase/supabase-js';

export interface PlayerState {
  board: Board;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
}

export interface GameRoom {
  id: string;
  code: string;
  status: 'waiting' | 'playing' | 'finished';
  player1_id: string;
  player1_name: string;
  player1_user_id: string;
  player2_id: string | null;
  player2_name: string | null;
  player2_user_id: string | null;
  player1_score: number;
  player2_score: number;
  winner: 'player1' | 'player2' | 'draw' | null;
}

interface MultiplayerState {
  room: GameRoom | null;
  playerId: string;
  userId: string | null;
  playerNumber: 1 | 2 | null;
  opponentState: PlayerState | null;
  opponentConnected: boolean;
  isReady: boolean;
  isAuthenticating: boolean;
}

const createEmptyBoard = (): Board => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const generatePlayerId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useMultiplayerGame = (onGarbageReceived?: (lines: number) => void) => {
  const [state, setState] = useState<MultiplayerState>({
    room: null,
    playerId: '',
    userId: null,
    playerNumber: null,
    opponentState: null,
    opponentConnected: false,
    isReady: false,
    isAuthenticating: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const playerIdRef = useRef<string>('');
  const userIdRef = useRef<string | null>(null);
  const onGarbageReceivedRef = useRef(onGarbageReceived);
  
  // Keep callback ref updated
  onGarbageReceivedRef.current = onGarbageReceived;

  // Initialize with anonymous authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for existing session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          userIdRef.current = session.user.id;
          playerIdRef.current = generatePlayerId();
          setState(prev => ({ 
            ...prev, 
            userId: session.user.id,
            playerId: playerIdRef.current,
            isAuthenticating: false 
          }));
        } else {
          // Sign in anonymously for guest multiplayer
          const { data, error: authError } = await supabase.auth.signInAnonymously();
          
          if (authError) {
            console.error('Anonymous auth failed:', authError);
            setError('Failed to authenticate. Please try again.');
            setState(prev => ({ ...prev, isAuthenticating: false }));
            return;
          }
          
          if (data.user) {
            userIdRef.current = data.user.id;
            playerIdRef.current = generatePlayerId();
            setState(prev => ({ 
              ...prev, 
              userId: data.user!.id,
              playerId: playerIdRef.current,
              isAuthenticating: false 
            }));
          }
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setError('Failed to initialize authentication');
        setState(prev => ({ ...prev, isAuthenticating: false }));
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        userIdRef.current = session.user.id;
        setState(prev => ({ ...prev, userId: session.user.id }));
      } else {
        userIdRef.current = null;
        setState(prev => ({ ...prev, userId: null }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const createRoom = useCallback(async (playerName: string = 'Player 1') => {
    if (!userIdRef.current) {
      setError('Not authenticated. Please refresh the page.');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const code = generateRoomCode();
      const playerId = playerIdRef.current;
      const userId = userIdRef.current;
      
      const { data, error: insertError } = await supabase
        .from('game_rooms')
        .insert({
          code,
          player1_id: playerId,
          player1_name: playerName,
          player1_user_id: userId,
          status: 'waiting',
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      setState(prev => ({
        ...prev,
        room: data as GameRoom,
        playerNumber: 1,
        isReady: false,
      }));
      
      // Subscribe to room updates
      subscribeToRoom(data.id, 1);
      
      return data as GameRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const joinRoom = useCallback(async (code: string, playerName: string = 'Player 2') => {
    if (!userIdRef.current) {
      setError('Not authenticated. Please refresh the page.');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const playerId = playerIdRef.current;
      const userId = userIdRef.current;
      
      // Find the room
      const { data: room, error: findError } = await supabase
        .from('game_rooms')
        .select()
        .eq('code', code.toUpperCase())
        .eq('status', 'waiting')
        .single();
      
      if (findError || !room) {
        throw new Error('Room not found or already in progress');
      }
      
      // Join the room
      const { data, error: updateError } = await supabase
        .from('game_rooms')
        .update({
          player2_id: playerId,
          player2_name: playerName,
          player2_user_id: userId,
          status: 'playing',
        })
        .eq('id', room.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      setState(prev => ({
        ...prev,
        room: data as GameRoom,
        playerNumber: 2,
        opponentConnected: true,
        isReady: true,
      }));
      
      // Subscribe to room updates
      subscribeToRoom(data.id, 2);
      
      return data as GameRoom;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribeToRoom = useCallback((roomId: string, playerNum: 1 | 2) => {
    // Clean up existing subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    
    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const players = Object.values(presenceState).flat();
        const opponentPresent = players.some((p: any) => p.playerNumber !== playerNum);
        
        setState(prev => ({
          ...prev,
          opponentConnected: opponentPresent,
          isReady: prev.room?.status === 'playing' || opponentPresent,
        }));
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('Player joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Player left:', leftPresences);
      })
      .on('broadcast', { event: 'game_state' }, ({ payload }) => {
        if (payload.playerNumber !== playerNum) {
          setState(prev => ({
            ...prev,
            opponentState: payload.state as PlayerState,
          }));
        }
      })
      .on('broadcast', { event: 'garbage' }, ({ payload }) => {
        // Receive garbage from opponent
        if (payload.playerNumber !== playerNum && payload.lines > 0) {
          console.log('Received garbage:', payload.lines);
          onGarbageReceivedRef.current?.(payload.lines);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: userIdRef.current,
            playerNumber: playerNum,
            online_at: new Date().toISOString(),
          });
        }
      });
    
    channelRef.current = channel;
    
    // Also listen for database changes
    supabase
      .channel(`room_updates:${roomId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        setState(prev => ({
          ...prev,
          room: payload.new as GameRoom,
          isReady: payload.new.status === 'playing',
          opponentConnected: !!payload.new.player2_id,
        }));
      })
      .subscribe();
  }, []);

  const broadcastGameState = useCallback((gameState: PlayerState) => {
    if (!channelRef.current || !state.playerNumber) return;
    
    channelRef.current.send({
      type: 'broadcast',
      event: 'game_state',
      payload: {
        playerNumber: state.playerNumber,
        state: gameState,
      },
    });
  }, [state.playerNumber]);

  const broadcastGarbage = useCallback((lines: number) => {
    if (!channelRef.current || !state.playerNumber || lines <= 0) return;
    
    console.log('Broadcasting garbage:', lines);
    channelRef.current.send({
      type: 'broadcast',
      event: 'garbage',
      payload: {
        playerNumber: state.playerNumber,
        lines,
      },
    });
  }, [state.playerNumber]);

  const updateScore = useCallback(async (score: number) => {
    if (!state.room || !state.playerNumber) return;
    
    const scoreField = state.playerNumber === 1 ? 'player1_score' : 'player2_score';
    
    await supabase
      .from('game_rooms')
      .update({ [scoreField]: score })
      .eq('id', state.room.id);
  }, [state.room, state.playerNumber]);

  const reportGameOver = useCallback(async () => {
    if (!state.room || !state.playerNumber) return;
    
    const winner = state.playerNumber === 1 ? 'player2' : 'player1';
    
    await supabase
      .from('game_rooms')
      .update({ 
        status: 'finished',
        winner,
      })
      .eq('id', state.room.id);
  }, [state.room, state.playerNumber]);

  const leaveRoom = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.untrack();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    if (state.room) {
      // If player 1 leaves a waiting room, delete it
      if (state.playerNumber === 1 && state.room.status === 'waiting') {
        await supabase
          .from('game_rooms')
          .delete()
          .eq('id', state.room.id);
      }
    }
    
    setState(prev => ({
      ...prev,
      room: null,
      playerNumber: null,
      opponentState: null,
      opponentConnected: false,
      isReady: false,
    }));
  }, [state.room, state.playerNumber]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  return {
    ...state,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastGameState,
    broadcastGarbage,
    updateScore,
    reportGameOver,
  };
};

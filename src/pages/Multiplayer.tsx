import { useState, useEffect, useCallback, useRef } from 'react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { TetrisGame } from '@/components/TetrisGame';
import { OpponentBoard } from '@/components/OpponentBoard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Wifi, Play, Copy, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useMultiplayerGame, PlayerState } from '@/hooks/useMultiplayerGame';
import { useTetris, BOARD_WIDTH, BOARD_HEIGHT } from '@/hooks/useTetris';

const createEmptyBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

const Multiplayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [localGameStarted, setLocalGameStarted] = useState(false);
  
  const tetris = useTetris();
  
  // Handle garbage received from opponent
  const handleGarbageReceived = useCallback((lines: number) => {
    console.log('Adding garbage lines:', lines);
    tetris.addGarbageLines(lines);
  }, [tetris.addGarbageLines]);
  
  const {
    room,
    playerNumber,
    opponentState,
    opponentConnected,
    isReady,
    loading,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcastGameState,
    broadcastGarbage,
    reportGameOver,
  } = useMultiplayerGame(handleGarbageReceived);

  // Track last clear event to avoid duplicate sends
  const lastClearTimestampRef = useRef<number>(0);

  // Broadcast game state when it changes
  useEffect(() => {
    if (room && isReady && tetris.gameState.isPlaying) {
      const state: PlayerState = {
        board: tetris.gameState.board,
        score: tetris.gameState.score,
        level: tetris.gameState.level,
        lines: tetris.gameState.lines,
        isGameOver: tetris.gameState.isGameOver,
      };
      broadcastGameState(state);
    }
  }, [
    room,
    isReady,
    tetris.gameState.board,
    tetris.gameState.score,
    tetris.gameState.level,
    tetris.gameState.lines,
    tetris.gameState.isGameOver,
    broadcastGameState,
  ]);

  // Send garbage when clearing lines
  useEffect(() => {
    const clearEvent = tetris.gameState.clearEvent;
    if (room && clearEvent && clearEvent.garbageSent > 0) {
      // Only send if this is a new clear event
      if (clearEvent.timestamp !== lastClearTimestampRef.current) {
        lastClearTimestampRef.current = clearEvent.timestamp;
        broadcastGarbage(clearEvent.garbageSent);
      }
    }
  }, [room, tetris.gameState.clearEvent, broadcastGarbage]);

  // Report game over
  useEffect(() => {
    if (room && tetris.gameState.isGameOver) {
      reportGameOver();
    }
  }, [room, tetris.gameState.isGameOver, reportGameOver]);

  // Show errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleCreateRoom = async () => {
    const name = playerName.trim() || 'Player 1';
    const newRoom = await createRoom(name);
    if (newRoom) {
      toast({
        title: "Room Created",
        description: `Share code: ${newRoom.code}`,
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      toast({
        title: "Error",
        description: "Please enter a room code",
        variant: "destructive",
      });
      return;
    }
    const name = playerName.trim() || 'Player 2';
    await joinRoom(roomCode, name);
  };

  const handleCopyCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard",
      });
    }
  };

  const handleLeaveRoom = async () => {
    await leaveRoom();
  };

  // Local 2P mode
  if (localGameStarted) {
    return (
      <ArcadeCabinet title="VS Mode">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocalGameStarted(false)}
            className="mb-4 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Game
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="stats-panel p-4">
              <h3 className="text-xs text-foreground text-center mb-4">
                Player 1
              </h3>
              <TetrisGame playerName="Player 1" />
            </div>
            <div className="stats-panel p-4">
              <h3 className="text-xs text-foreground text-center mb-4">
                Player 2
              </h3>
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                Waiting for opponent...
              </div>
            </div>
          </div>
        </div>
      </ArcadeCabinet>
    );
  }

  // Online game in progress or finished
  if (room && (room.status === 'playing' || room.status === 'finished')) {
    const opponentName = playerNumber === 1 ? room.player2_name : room.player1_name;
    const isFinished = room.status === 'finished';
    
    return (
      <ArcadeCabinet title="VS Mode">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleLeaveRoom}
              className="text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Game
            </Button>
            <div className="text-sm text-muted-foreground">
              Room: {room.code}
            </div>
          </div>
          
          {isFinished && room.winner && (
            <div className="stats-panel p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {room.winner === (playerNumber === 1 ? 'player1' : 'player2')
                  ? '🎉 You Win!' 
                  : 'Game Over'}
              </h2>
              <p className="text-muted-foreground">
                {room.winner === (playerNumber === 1 ? 'player1' : 'player2')
                  ? 'Congratulations!'
                  : 'Better luck next time!'}
              </p>
              <Button onClick={handleLeaveRoom} className="mt-4">
                Back to Lobby
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="stats-panel p-4">
              <h3 className="text-sm font-medium text-foreground text-center mb-4">
                You ({playerNumber === 1 ? room.player1_name : room.player2_name})
              </h3>
              <TetrisGame 
                playerName={playerNumber === 1 ? room.player1_name : room.player2_name || 'You'} 
              />
            </div>
            
            <div className="stats-panel p-4">
              {opponentState ? (
                <OpponentBoard
                  board={opponentState.board}
                  playerName={opponentName || 'Opponent'}
                  score={opponentState.score}
                  level={opponentState.level}
                  lines={opponentState.lines}
                  isGameOver={opponentState.isGameOver}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Waiting for opponent to start...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </ArcadeCabinet>
    );
  }

  // Waiting room
  if (room && room.status === 'waiting') {
    return (
      <ArcadeCabinet title="Waiting Room">
        <div className="max-w-md mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={handleLeaveRoom}
            className="mb-6 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <div className="stats-panel p-6 space-y-6 text-center">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Share this code with a friend
              </h3>
              <div className="flex items-center justify-center gap-2">
                <div className="text-3xl font-mono tracking-[0.5em] bg-muted/30 px-6 py-3 rounded">
                  {room.code}
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Waiting for opponent to join...</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>You: {room.player1_name}</p>
              {opponentConnected && <p className="text-primary">Opponent connected!</p>}
            </div>
          </div>
        </div>
      </ArcadeCabinet>
    );
  }

  // Lobby
  return (
    <ArcadeCabinet title="Multiplayer">
      <div className="max-w-md mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        {/* Player Name Input */}
        <div className="stats-panel p-4 mb-4">
          <label className="text-sm text-muted-foreground mb-2 block">Your Name</label>
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="bg-background"
            maxLength={20}
          />
        </div>

        <div className="space-y-4">
          {/* Create Room */}
          <div className="stats-panel p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Create Room
              </h3>
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Start a new game and invite a friend
            </p>
            <Button 
              variant="default" 
              size="lg" 
              onClick={handleCreateRoom}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Wifi className="w-5 h-5 mr-2" />
              )}
              Create New Room
            </Button>
          </div>

          {/* Join Room */}
          <div className="stats-panel p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
                <Play className="w-4 h-4" />
                Join Room
              </h3>
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Enter a room code to join
            </p>
            <Input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="text-center bg-background tracking-widest"
              maxLength={6}
            />
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={handleJoinRoom}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : null}
              Join Game
            </Button>
          </div>

          {/* Local 2P Mode */}
          <div className="stats-panel p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-foreground">
                Local 2 Player
              </h3>
            </div>
            <p className="text-muted-foreground text-center text-sm">
              Play side by side on the same device
            </p>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => setLocalGameStarted(true)}
              className="w-full"
            >
              Start Local Game
            </Button>
          </div>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Multiplayer;

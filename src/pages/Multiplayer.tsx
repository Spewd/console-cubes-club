import { useState } from 'react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { TetrisGame } from '@/components/TetrisGame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Users, Wifi, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Multiplayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roomCode, setRoomCode] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  const handleCreateRoom = () => {
    toast({
      title: "Multiplayer",
      description: "Connect Lovable Cloud to enable real-time multiplayer!",
    });
  };

  const handleJoinRoom = () => {
    if (!roomCode) {
      toast({
        title: "Error",
        description: "Please enter a room code",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Multiplayer",
      description: "Connect Lovable Cloud to enable real-time multiplayer!",
    });
  };

  if (gameStarted) {
    return (
      <ArcadeCabinet title="VS MODE">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setGameStarted(false)}
            className="mb-4 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            LEAVE GAME
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="game-board-border p-4 rounded-sm">
              <h3 
                className="font-arcade text-xs text-primary text-center mb-4"
                style={{ textShadow: 'var(--shadow-neon-cyan)' }}
              >
                PLAYER 1
              </h3>
              <TetrisGame playerName="PLAYER 1" />
            </div>
            <div className="stats-panel-accent p-4 rounded-sm border-secondary/40">
              <h3 
                className="font-arcade text-xs text-secondary text-center mb-4"
                style={{ textShadow: 'var(--shadow-neon-purple)' }}
              >
                PLAYER 2
              </h3>
              <div className="flex items-center justify-center h-96 text-muted-foreground font-retro animate-pulse">
                WAITING FOR OPPONENT...
              </div>
            </div>
          </div>
        </div>
      </ArcadeCabinet>
    );
  }

  return (
    <ArcadeCabinet title="MULTIPLAYER">
      <div className="max-w-md mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO MENU
        </Button>

        <div className="space-y-4">
          {/* Create Room */}
          <div className="stats-panel-accent p-6 space-y-4 rounded-sm">
            <div className="text-center">
              <h3 
                className="font-arcade text-xs text-primary flex items-center justify-center gap-2"
                style={{ textShadow: 'var(--shadow-neon-cyan)' }}
              >
                <Users className="w-4 h-4" />
                CREATE ROOM
              </h3>
            </div>
            <p className="font-retro text-muted-foreground text-center text-sm">
              Start a new game and invite a friend
            </p>
            <Button 
              variant="neon" 
              size="lg" 
              onClick={handleCreateRoom}
              className="w-full arcade-button"
            >
              <Wifi className="w-5 h-5 mr-2" />
              CREATE NEW ROOM
            </Button>
          </div>

          {/* Join Room */}
          <div className="stats-panel p-6 space-y-4 rounded-sm border-secondary/30">
            <div className="text-center">
              <h3 
                className="font-arcade text-xs text-secondary flex items-center justify-center gap-2"
                style={{ textShadow: 'var(--shadow-neon-purple)' }}
              >
                <Play className="w-4 h-4" />
                JOIN ROOM
              </h3>
            </div>
            <p className="font-retro text-muted-foreground text-center text-sm">
              Enter a room code to join
            </p>
            <Input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM CODE"
              className="font-arcade text-center text-sm bg-background/50 border-secondary/50 tracking-widest"
              maxLength={6}
            />
            <Button 
              variant="arcadeSecondary" 
              size="lg" 
              onClick={handleJoinRoom}
              className="w-full arcade-button"
            >
              JOIN GAME
            </Button>
          </div>

          {/* Local 2P Mode */}
          <div className="stats-panel p-6 space-y-4 rounded-sm border-accent/30">
            <div className="text-center">
              <h3 
                className="font-arcade text-xs text-accent"
                style={{ textShadow: 'var(--shadow-neon-yellow)' }}
              >
                LOCAL 2 PLAYER
              </h3>
            </div>
            <p className="font-retro text-muted-foreground text-center text-sm">
              Play side by side on the same device
            </p>
            <Button 
              variant="arcadeAccent" 
              size="lg" 
              onClick={() => setGameStarted(true)}
              className="w-full arcade-button"
            >
              START LOCAL GAME
            </Button>
          </div>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Multiplayer;

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
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            LEAVE GAME
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border-2 border-primary p-4">
              <h3 className="font-arcade text-sm text-primary neon-glow text-center mb-4">PLAYER 1</h3>
              <TetrisGame playerName="PLAYER 1" />
            </div>
            <div className="border-2 border-secondary p-4">
              <h3 className="font-arcade text-sm text-secondary neon-glow-purple text-center mb-4">PLAYER 2</h3>
              <div className="flex items-center justify-center h-96 text-muted-foreground font-retro">
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
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO MENU
        </Button>

        <div className="space-y-6">
          {/* Create Room */}
          <div className="border-2 border-primary p-6 space-y-4">
            <div className="text-center">
              <h3 className="font-arcade text-sm text-primary neon-glow flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                CREATE ROOM
              </h3>
            </div>
            <p className="font-retro text-muted-foreground text-center">
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
          <div className="border-2 border-secondary p-6 space-y-4">
            <div className="text-center">
              <h3 className="font-arcade text-sm text-secondary neon-glow-purple flex items-center justify-center gap-2">
                <Play className="w-5 h-5" />
                JOIN ROOM
              </h3>
            </div>
            <p className="font-retro text-muted-foreground text-center">
              Enter a room code to join
            </p>
            <Input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM CODE"
              className="font-arcade text-center text-lg bg-muted border-secondary tracking-widest"
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
          <div className="border-2 border-accent p-6 space-y-4">
            <div className="text-center">
              <h3 className="font-arcade text-sm text-accent neon-glow-yellow">
                LOCAL 2 PLAYER
              </h3>
            </div>
            <p className="font-retro text-muted-foreground text-center">
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

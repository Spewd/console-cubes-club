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
      <ArcadeCabinet title="VS Mode">
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={() => setGameStarted(false)}
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
            >
              <Wifi className="w-5 h-5 mr-2" />
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
            >
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
              onClick={() => setGameStarted(true)}
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

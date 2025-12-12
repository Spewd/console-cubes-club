import { Button } from '@/components/ui/button';
import { Play, Users, Trophy, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8">
      <div className="space-y-2 text-center mb-8">
        <h2 className="font-arcade text-lg text-primary neon-glow">SELECT MODE</h2>
        <div className="w-32 h-1 bg-primary mx-auto" />
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          variant="neon"
          size="lg"
          onClick={() => navigate('/game')}
          className="arcade-button w-full justify-start"
        >
          <Play className="w-5 h-5 mr-3" />
          SINGLE PLAYER
        </Button>

        <Button
          variant="arcadeSecondary"
          size="lg"
          onClick={() => navigate('/multiplayer')}
          className="arcade-button w-full justify-start"
        >
          <Users className="w-5 h-5 mr-3" />
          MULTIPLAYER
        </Button>

        <Button
          variant="arcadeAccent"
          size="lg"
          onClick={() => navigate('/leaderboard')}
          className="arcade-button w-full justify-start"
        >
          <Trophy className="w-5 h-5 mr-3" />
          LEADERBOARD
        </Button>

        <div className="border-t-2 border-muted my-4" />

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/login')}
          className="arcade-button w-full justify-start"
        >
          <LogIn className="w-5 h-5 mr-3" />
          LOGIN / REGISTER
        </Button>
      </div>

      <div className="mt-8 text-center">
        <p className="font-retro text-muted-foreground text-sm">
          © 2024 RETRO TETRIS ARCADE
        </p>
        <p className="font-retro text-muted-foreground text-xs mt-1">
          INSERT COIN TO CONTINUE
        </p>
      </div>
    </div>
  );
};

import { Button } from '@/components/ui/button';
import { Play, Users, Trophy, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 p-8">
      <div className="space-y-2 text-center mb-8">
        <h2 className="text-lg font-medium text-foreground">
          Select Mode
        </h2>
        <div className="w-16 h-px bg-border mx-auto" />
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate('/game')}
          className="w-full justify-start"
        >
          <Play className="w-5 h-5 mr-3" />
          Single Player
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/multiplayer')}
          className="w-full justify-start"
        >
          <Users className="w-5 h-5 mr-3" />
          Multiplayer
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/leaderboard')}
          className="w-full justify-start"
        >
          <Trophy className="w-5 h-5 mr-3" />
          Leaderboard
        </Button>

        <div className="border-t border-border my-4" />

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/login')}
          className="w-full justify-start"
        >
          <LogIn className="w-5 h-5 mr-3" />
          Login / Register
        </Button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          © 2024 Tetris
        </p>
      </div>
    </div>
  );
};

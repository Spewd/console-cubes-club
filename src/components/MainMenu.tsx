import { Button } from '@/components/ui/button';
import { Play, Users, Trophy, LogIn, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px] gap-8 p-4 md:p-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Ready to play</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Choose Your Mode
        </h2>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Challenge yourself or compete with friends
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button
          variant="default"
          size="lg"
          onClick={() => navigate('/game')}
          className="w-full justify-start h-16 text-base group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold">Single Player</div>
            <div className="text-xs opacity-80">Classic endless mode</div>
          </div>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/multiplayer')}
          className="w-full justify-start h-16 text-base group"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-bold">Multiplayer</div>
            <div className="text-xs text-muted-foreground">Challenge a friend</div>
          </div>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/leaderboard')}
          className="w-full justify-start h-16 text-base group"
        >
          <div className="w-10 h-10 rounded-lg bg-chart-4/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5 text-chart-4" />
          </div>
          <div className="text-left">
            <div className="font-bold">Leaderboard</div>
            <div className="text-xs text-muted-foreground">View high scores</div>
          </div>
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-4 text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/login')}
          className="w-full justify-start h-14 text-base"
        >
          <LogIn className="w-5 h-5 mr-3" />
          <span>Login / Register</span>
        </Button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground/60 text-xs">
          © 2024 Tetris • Built with ♥
        </p>
      </div>
    </div>
  );
};

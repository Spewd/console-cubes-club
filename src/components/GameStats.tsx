import { cn } from '@/lib/utils';

interface GameStatsProps {
  score: number;
  level: number;
  lines: number;
  className?: string;
}

export const GameStats = ({ score, level, lines, className }: GameStatsProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="stats-panel p-4 group hover:glow-ring">
        <h3 className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest font-semibold">Lines</h3>
        <p className="text-2xl font-bold text-foreground tabular-nums">{lines}</p>
      </div>
      
      <div className="stats-panel p-4 group hover:glow-ring">
        <h3 className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-widest font-semibold">Score</h3>
        <p className="text-2xl font-bold text-foreground tabular-nums">{score.toLocaleString()}</p>
      </div>

      <div className="stats-panel p-4 glow-ring bg-primary/5">
        <h3 className="text-[10px] text-primary mb-1.5 uppercase tracking-widest font-semibold">Level</h3>
        <p className="text-4xl font-extrabold text-center text-gradient-accent tabular-nums">{level}</p>
      </div>
    </div>
  );
};

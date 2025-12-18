interface GameStatsProps {
  score: number;
  level: number;
  lines: number;
}

export const GameStats = ({ score, level, lines }: GameStatsProps) => {
  return (
    <div className="space-y-3">
      <div className="stats-panel p-4">
        <h3 className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Lines</h3>
        <p className="text-xl font-semibold text-foreground tabular-nums">{lines}</p>
      </div>
      
      <div className="stats-panel p-4">
        <h3 className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Score</h3>
        <p className="text-xl font-semibold text-foreground tabular-nums">{score.toLocaleString()}</p>
      </div>

      <div className="stats-panel p-4 bg-accent/30">
        <h3 className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-medium">Level</h3>
        <p className="text-3xl font-bold text-center text-foreground tabular-nums">{level}</p>
      </div>
    </div>
  );
};

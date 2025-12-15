interface GameStatsProps {
  score: number;
  level: number;
  lines: number;
}

export const GameStats = ({ score, level, lines }: GameStatsProps) => {
  return (
    <div className="space-y-3">
      <div className="stats-panel p-3">
        <h3 className="text-xs text-muted-foreground mb-1">Lines</h3>
        <p className="text-lg font-medium text-foreground">{lines}</p>
      </div>
      
      <div className="stats-panel p-3">
        <h3 className="text-xs text-muted-foreground mb-1">Score</h3>
        <p className="text-lg font-medium text-foreground">{score.toLocaleString()}</p>
      </div>

      <div className="stats-panel p-3">
        <h3 className="text-xs text-muted-foreground mb-1">Level</h3>
        <p className="text-2xl font-semibold text-center text-foreground">{level}</p>
      </div>
    </div>
  );
};

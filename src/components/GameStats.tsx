interface GameStatsProps {
  score: number;
  level: number;
  lines: number;
}

export const GameStats = ({ score, level, lines }: GameStatsProps) => {
  return (
    <div className="space-y-3">
      <div className="stats-panel p-3 rounded-sm">
        <h3 className="font-arcade text-[10px] text-muted-foreground tracking-wider mb-1">LINES</h3>
        <p className="font-arcade text-sm text-primary">{lines.toString().padStart(3, '0')}</p>
      </div>
      
      <div className="stats-panel p-3 rounded-sm">
        <h3 className="font-arcade text-[10px] text-muted-foreground tracking-wider mb-1">SCORE</h3>
        <p className="font-arcade text-sm text-primary">{score.toString().padStart(8, '0')}</p>
        <p className="font-arcade text-[8px] text-accent mt-1">+{(score % 1000).toString().padStart(4, '0')}</p>
      </div>

      <div className="stats-panel-accent p-3 rounded-sm">
        <h3 className="font-arcade text-[10px] text-muted-foreground tracking-wider mb-1">SPEED LV</h3>
        <p className="font-arcade text-lg text-center text-primary">{level.toString().padStart(2, '0')}</p>
      </div>
    </div>
  );
};

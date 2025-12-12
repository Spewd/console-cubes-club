interface GameStatsProps {
  score: number;
  level: number;
  lines: number;
}

export const GameStats = ({ score, level, lines }: GameStatsProps) => {
  return (
    <div className="border-2 border-primary p-3 space-y-4">
      <div>
        <h3 className="font-arcade text-xs text-primary neon-glow mb-1">SCORE</h3>
        <p className="font-retro text-2xl text-accent neon-glow-yellow">{score.toString().padStart(6, '0')}</p>
      </div>
      <div>
        <h3 className="font-arcade text-xs text-primary neon-glow mb-1">LEVEL</h3>
        <p className="font-retro text-2xl text-secondary neon-glow-purple">{level}</p>
      </div>
      <div>
        <h3 className="font-arcade text-xs text-primary neon-glow mb-1">LINES</h3>
        <p className="font-retro text-2xl text-primary neon-glow">{lines}</p>
      </div>
    </div>
  );
};

import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockLeaderboard = [
  { rank: 1, name: "ACE", score: 999999, level: 15 },
  { rank: 2, name: "PRO", score: 850000, level: 14 },
  { rank: 3, name: "MAX", score: 720000, level: 13 },
  { rank: 4, name: "ZAP", score: 650000, level: 12 },
  { rank: 5, name: "REX", score: 580000, level: 11 },
  { rank: 6, name: "JET", score: 520000, level: 10 },
  { rank: 7, name: "SAM", score: 480000, level: 10 },
  { rank: 8, name: "KAI", score: 420000, level: 9 },
  { rank: 9, name: "LUX", score: 380000, level: 8 },
  { rank: 10, name: "NEO", score: 350000, level: 8 },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-tetris-o" />;
    case 2:
      return <Medal className="w-5 h-5 text-muted-foreground" />;
    case 3:
      return <Award className="w-5 h-5 text-tetris-l" />;
    default:
      return <span className="text-xs text-muted-foreground">{rank}</span>;
  }
};

const Leaderboard = () => {
  const navigate = useNavigate();

  return (
    <ArcadeCabinet title="High Scores">
      <div className="max-w-2xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>

        <div className="stats-panel p-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-medium text-foreground">
              Top 10 Players
            </h2>
            <div className="w-16 h-px bg-border mx-auto mt-3" />
          </div>

          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-border">
              <div className="col-span-2 text-xs text-muted-foreground">Rank</div>
              <div className="col-span-4 text-xs text-muted-foreground">Name</div>
              <div className="col-span-4 text-xs text-muted-foreground text-right">Score</div>
              <div className="col-span-2 text-xs text-muted-foreground text-right">Lvl</div>
            </div>

            {/* Entries */}
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className="grid grid-cols-12 gap-2 px-3 py-3 rounded hover:bg-accent/50 transition-colors"
              >
                <div className="col-span-2 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="col-span-4 text-sm flex items-center text-foreground">
                  {entry.name}
                </div>
                <div className="col-span-4 text-sm text-right text-foreground">
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-2 text-sm text-right text-muted-foreground">
                  {entry.level}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Login to save your scores
            </p>
          </div>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Leaderboard;

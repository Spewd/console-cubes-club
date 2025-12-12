import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data - will be replaced with real data from Lovable Cloud
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
      return <Trophy className="w-5 h-5 text-accent" />;
    case 2:
      return <Medal className="w-5 h-5 text-muted-foreground" />;
    case 3:
      return <Award className="w-5 h-5 text-tetris-l" />;
    default:
      return <span className="font-arcade text-xs text-muted-foreground">{rank}</span>;
  }
};

const getRankClass = (rank: number) => {
  switch (rank) {
    case 1:
      return "border-l-accent bg-accent/5";
    case 2:
      return "border-l-muted-foreground bg-muted-foreground/5";
    case 3:
      return "border-l-tetris-l bg-tetris-l/5";
    default:
      return "border-l-muted bg-muted/20";
  }
};

const Leaderboard = () => {
  const navigate = useNavigate();

  return (
    <ArcadeCabinet title="HIGH SCORES">
      <div className="max-w-2xl mx-auto p-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO MENU
        </Button>

        <div className="stats-panel-accent p-4 rounded-sm">
          <div className="text-center mb-6">
            <h2 
              className="font-arcade text-sm text-primary"
              style={{ textShadow: 'var(--shadow-neon-cyan)' }}
            >
              TOP 10 PLAYERS
            </h2>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-3" />
          </div>

          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-muted/30">
              <div className="col-span-2 font-arcade text-[8px] text-muted-foreground">RANK</div>
              <div className="col-span-4 font-arcade text-[8px] text-muted-foreground">NAME</div>
              <div className="col-span-4 font-arcade text-[8px] text-muted-foreground text-right">SCORE</div>
              <div className="col-span-2 font-arcade text-[8px] text-muted-foreground text-right">LVL</div>
            </div>

            {/* Entries */}
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`grid grid-cols-12 gap-2 px-3 py-3 border-l-4 ${getRankClass(entry.rank)} rounded-r-sm hover:bg-muted/30 transition-colors`}
              >
                <div className="col-span-2 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="col-span-4 font-arcade text-xs flex items-center text-foreground">
                  {entry.name}
                </div>
                <div className="col-span-4 font-arcade text-xs text-right text-primary">
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-2 font-arcade text-xs text-right text-secondary">
                  {entry.level}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="font-retro text-muted-foreground text-sm">
              LOGIN TO SAVE YOUR SCORES
            </p>
          </div>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Leaderboard;

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
      return "border-accent text-accent";
    case 2:
      return "border-muted-foreground text-muted-foreground";
    case 3:
      return "border-tetris-l text-tetris-l";
    default:
      return "border-muted text-foreground";
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
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO MENU
        </Button>

        <div className="border-2 border-primary p-4">
          <div className="text-center mb-6">
            <h2 className="font-arcade text-lg text-primary neon-glow">TOP 10 PLAYERS</h2>
            <div className="w-32 h-1 bg-primary mx-auto mt-2" />
          </div>

          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b-2 border-muted">
              <div className="col-span-2 font-arcade text-[10px] text-muted-foreground">RANK</div>
              <div className="col-span-4 font-arcade text-[10px] text-muted-foreground">NAME</div>
              <div className="col-span-4 font-arcade text-[10px] text-muted-foreground text-right">SCORE</div>
              <div className="col-span-2 font-arcade text-[10px] text-muted-foreground text-right">LVL</div>
            </div>

            {/* Entries */}
            {mockLeaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`grid grid-cols-12 gap-2 px-3 py-3 border-l-4 ${getRankClass(entry.rank)} bg-muted/50 hover:bg-muted transition-colors`}
              >
                <div className="col-span-2 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="col-span-4 font-arcade text-sm flex items-center">
                  {entry.name}
                </div>
                <div className="col-span-4 font-retro text-xl text-right text-accent">
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-2 font-retro text-lg text-right text-secondary">
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

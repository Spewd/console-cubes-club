import { useState, useEffect } from 'react';
import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Medal, Award, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  level: number;
}

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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get top 10 high scores with profile info
      const { data: scores, error } = await supabase
        .from('high_scores')
        .select(`
          score,
          level,
          user_id
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching scores:', error);
        setLoading(false);
        return;
      }

      if (!scores || scores.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(scores.map(s => s.user_id))];

      // Fetch profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      const profileMap = new Map(profiles?.map(p => [p.id, p.username]) || []);

      const entries: LeaderboardEntry[] = scores.map((score, index) => ({
        rank: index + 1,
        name: profileMap.get(score.user_id) || 'Unknown',
        score: score.score,
        level: score.level
      }));

      setLeaderboard(entries);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

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

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scores yet!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Be the first to set a high score.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-border">
                <div className="col-span-2 text-xs text-muted-foreground">Rank</div>
                <div className="col-span-4 text-xs text-muted-foreground">Name</div>
                <div className="col-span-4 text-xs text-muted-foreground text-right">Score</div>
                <div className="col-span-2 text-xs text-muted-foreground text-right">Lvl</div>
              </div>

              {/* Entries */}
              {leaderboard.map((entry) => (
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
          )}

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              Login and play to save your scores!
            </p>
          </div>
        </div>
      </div>
    </ArcadeCabinet>
  );
};

export default Leaderboard;

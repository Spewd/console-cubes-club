import { ArcadeCabinet } from '@/components/ArcadeCabinet';
import { TetrisGame } from '@/components/TetrisGame';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Game = () => {
  const navigate = useNavigate();

  return (
    <ArcadeCabinet>
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          BACK TO MENU
        </Button>
        <TetrisGame />
      </div>
    </ArcadeCabinet>
  );
};

export default Game;

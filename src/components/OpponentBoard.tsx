import { Board, TetrisBlock, BOARD_WIDTH, BOARD_HEIGHT } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface OpponentBoardProps {
  board: Board;
  playerName: string;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i',
  O: 'bg-tetris-o',
  T: 'bg-tetris-t',
  S: 'bg-tetris-s',
  Z: 'bg-tetris-z',
  J: 'bg-tetris-j',
  L: 'bg-tetris-l',
};

export const OpponentBoard = ({ 
  board, 
  playerName, 
  score, 
  level, 
  lines,
  isGameOver 
}: OpponentBoardProps) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-sm font-medium text-foreground">{playerName}</h3>
      
      <div className="relative game-board-border p-1">
        <div className="game-board-container p-2">
          <div 
            className="grid gap-[1px]"
            style={{ 
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
              width: `${BOARD_WIDTH * 16}px`,
              height: `${BOARD_HEIGHT * 16}px`,
            }}
          >
            {board.flat().map((cell, index) => (
              <div
                key={index}
                className={cn(
                  'w-full h-full rounded-[2px]',
                  cell 
                    ? `${BLOCK_COLORS[cell]} tetris-block`
                    : 'bg-muted/20'
                )}
              />
            ))}
          </div>
        </div>
        
        {isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded">
            <span className="text-destructive font-bold text-lg">GAME OVER</span>
          </div>
        )}
      </div>
      
      <div className="stats-panel p-3 w-full">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Score</div>
            <div className="text-sm font-mono">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Level</div>
            <div className="text-sm font-mono">{level}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Lines</div>
            <div className="text-sm font-mono">{lines}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

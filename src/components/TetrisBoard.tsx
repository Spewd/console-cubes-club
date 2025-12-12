import { Board, Piece, TetrisBlock, BOARD_WIDTH, BOARD_HEIGHT } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface TetrisBoardProps {
  board: Board;
  currentPiece: Piece | null;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i shadow-[0_0_12px_hsl(185_100%_55%)]',
  O: 'bg-tetris-o shadow-[0_0_12px_hsl(50_100%_55%)]',
  T: 'bg-tetris-t shadow-[0_0_12px_hsl(290_100%_65%)]',
  S: 'bg-tetris-s shadow-[0_0_12px_hsl(140_100%_50%)]',
  Z: 'bg-tetris-z shadow-[0_0_12px_hsl(0_100%_55%)]',
  J: 'bg-tetris-j shadow-[0_0_12px_hsl(225_100%_60%)]',
  L: 'bg-tetris-l shadow-[0_0_12px_hsl(35_100%_55%)]',
};

export const TetrisBoard = ({ board, currentPiece }: TetrisBoardProps) => {
  // Create a display board that includes the current piece
  const displayBoard = board.map(row => [...row]);
  
  if (currentPiece) {
    const { shape, position, type } = currentPiece;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && position.y + y >= 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = type;
          }
        }
      }
    }
  }

  return (
    <div className="game-board-border rounded-sm p-1">
      <div className="game-board-container p-2 rounded-sm">
        <div 
          className="grid gap-[1px]"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
          }}
        >
          {displayBoard.flat().map((cell, index) => (
            <div
              key={index}
              className={cn(
                'aspect-square',
                cell 
                  ? `${BLOCK_COLORS[cell]} tetris-block rounded-[2px]` 
                  : 'bg-muted/10 border border-muted/5'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

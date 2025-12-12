import { Board, Piece, TetrisBlock, BOARD_WIDTH, BOARD_HEIGHT } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface TetrisBoardProps {
  board: Board;
  currentPiece: Piece | null;
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
    <div className="crt-screen p-2 border-4 border-primary">
      <div 
        className="grid gap-px bg-screen"
        style={{ 
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
        }}
      >
        {displayBoard.flat().map((cell, index) => (
          <div
            key={index}
            className={cn(
              'aspect-square border border-muted/30',
              cell ? `${BLOCK_COLORS[cell]} tetris-block` : 'bg-screen'
            )}
          />
        ))}
      </div>
    </div>
  );
};

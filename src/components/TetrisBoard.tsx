import { Board, Piece, TetrisBlock, BOARD_WIDTH, BOARD_HEIGHT, Position } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface TetrisBoardProps {
  board: Board;
  currentPiece: Piece | null;
  ghostPosition?: Position | null;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i',
  O: 'bg-tetris-o',
  T: 'bg-tetris-t',
  S: 'bg-tetris-s',
  Z: 'bg-tetris-z',
  J: 'bg-tetris-j',
  L: 'bg-tetris-l',
  G: 'bg-muted-foreground/60',
};

const GHOST_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'border border-tetris-i/40 bg-tetris-i/10',
  O: 'border border-tetris-o/40 bg-tetris-o/10',
  T: 'border border-tetris-t/40 bg-tetris-t/10',
  S: 'border border-tetris-s/40 bg-tetris-s/10',
  Z: 'border border-tetris-z/40 bg-tetris-z/10',
  J: 'border border-tetris-j/40 bg-tetris-j/10',
  L: 'border border-tetris-l/40 bg-tetris-l/10',
  G: 'border border-muted-foreground/20 bg-muted-foreground/5',
};

export const TetrisBoard = ({ board, currentPiece, ghostPosition }: TetrisBoardProps) => {
  const displayBoard: { cell: TetrisBlock; isGhost: boolean }[][] = board.map(row => 
    row.map(cell => ({ cell, isGhost: false }))
  );
  
  if (currentPiece && ghostPosition && currentPiece.type) {
    const { shape, type } = currentPiece;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && ghostPosition.y + y >= 0) {
          const boardY = ghostPosition.y + y;
          const boardX = ghostPosition.x + x;
          if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            if (!displayBoard[boardY][boardX].cell) {
              displayBoard[boardY][boardX] = { cell: type, isGhost: true };
            }
          }
        }
      }
    }
  }
  
  if (currentPiece) {
    const { shape, position, type } = currentPiece;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && position.y + y >= 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            displayBoard[boardY][boardX] = { cell: type, isGhost: false };
          }
        }
      }
    }
  }

  return (
    <div className="game-board-border p-1">
      <div className="game-board-container p-2">
        <div 
          className="grid gap-[1px]"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
            width: `${BOARD_WIDTH * 24}px`,
            height: `${BOARD_HEIGHT * 24}px`,
          }}
        >
          {displayBoard.flat().map((item, index) => (
            <div
              key={index}
              className={cn(
                'w-full h-full rounded-sm',
                item.cell 
                  ? item.isGhost
                    ? GHOST_COLORS[item.cell]
                    : `${BLOCK_COLORS[item.cell]} tetris-block`
                  : 'bg-muted/20'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

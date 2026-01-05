import { useState, useEffect } from 'react';
import { Board, Piece, TetrisBlock, BOARD_WIDTH, BOARD_HEIGHT, Position, ClearEvent } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface TetrisBoardProps {
  board: Board;
  currentPiece: Piece | null;
  ghostPosition?: Position | null;
  clearEvent?: ClearEvent | null;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i shadow-[0_0_12px_hsl(185_90%_55%/0.5)]',
  O: 'bg-tetris-o shadow-[0_0_12px_hsl(45_95%_55%/0.5)]',
  T: 'bg-tetris-t shadow-[0_0_12px_hsl(280_85%_60%/0.5)]',
  S: 'bg-tetris-s shadow-[0_0_12px_hsl(145_80%_50%/0.5)]',
  Z: 'bg-tetris-z shadow-[0_0_12px_hsl(0_85%_55%/0.5)]',
  J: 'bg-tetris-j shadow-[0_0_12px_hsl(220_90%_55%/0.5)]',
  L: 'bg-tetris-l shadow-[0_0_12px_hsl(25_95%_55%/0.5)]',
  G: 'bg-muted-foreground/60',
};

const GHOST_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'border-2 border-tetris-i/50 bg-tetris-i/15',
  O: 'border-2 border-tetris-o/50 bg-tetris-o/15',
  T: 'border-2 border-tetris-t/50 bg-tetris-t/15',
  S: 'border-2 border-tetris-s/50 bg-tetris-s/15',
  Z: 'border-2 border-tetris-z/50 bg-tetris-z/15',
  J: 'border-2 border-tetris-j/50 bg-tetris-j/15',
  L: 'border-2 border-tetris-l/50 bg-tetris-l/15',
  G: 'border border-muted-foreground/20 bg-muted-foreground/5',
};

export const TetrisBoard = ({ board, currentPiece, ghostPosition, clearEvent }: TetrisBoardProps) => {
  const [clearingRows, setClearingRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (clearEvent && clearEvent.clearedRowIndices.length > 0) {
      setClearingRows(new Set(clearEvent.clearedRowIndices));
      const timer = setTimeout(() => {
        setClearingRows(new Set());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [clearEvent]);

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

  const CELL_SIZE = 24;
  const GAP_SIZE = 2;
  const totalWidth = BOARD_WIDTH * CELL_SIZE + (BOARD_WIDTH - 1) * GAP_SIZE;
  const totalHeight = BOARD_HEIGHT * CELL_SIZE + (BOARD_HEIGHT - 1) * GAP_SIZE;

  return (
    <div className="game-board-border p-1.5">
      <div className="game-board-container p-2">
        <div 
          className="grid"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
            gap: `${GAP_SIZE}px`,
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
          }}
        >
          {displayBoard.map((row, rowIndex) => 
            row.map((item, colIndex) => {
              const isClearing = clearingRows.has(rowIndex);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  className={cn(
                    item.cell 
                      ? item.isGhost
                        ? cn(GHOST_COLORS[item.cell], 'rounded-[3px]')
                        : cn(BLOCK_COLORS[item.cell], 'tetris-block')
                      : 'bg-muted/30 rounded-[2px]',
                    isClearing && 'animate-line-clear'
                  )}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

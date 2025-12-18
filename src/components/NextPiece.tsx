import { Piece, TetrisBlock } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface NextPieceProps {
  piece: Piece;
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

export const NextPiece = ({ piece }: NextPieceProps) => {
  const { shape, type } = piece;

  return (
    <div className="stats-panel p-4">
      <h3 className="text-xs text-muted-foreground mb-3 text-center uppercase tracking-wider font-medium">Next</h3>
      <div className="flex items-center justify-center min-h-[68px]">
        <div 
          className="grid gap-[2px]"
          style={{ 
            gridTemplateColumns: `repeat(${shape[0].length}, 14px)`,
          }}
        >
          {shape.flat().map((cell, index) => (
            <div
              key={index}
              className={cn(
                'w-[14px] h-[14px] rounded-sm transition-colors',
                cell && type 
                  ? `${BLOCK_COLORS[type]} tetris-block` 
                  : 'bg-transparent'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

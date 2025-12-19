import { Piece, TetrisBlock } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface NextPieceProps {
  piece: Piece;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i shadow-[0_0_8px_hsl(185_90%_55%/0.4)]',
  O: 'bg-tetris-o shadow-[0_0_8px_hsl(45_95%_55%/0.4)]',
  T: 'bg-tetris-t shadow-[0_0_8px_hsl(280_85%_60%/0.4)]',
  S: 'bg-tetris-s shadow-[0_0_8px_hsl(145_80%_50%/0.4)]',
  Z: 'bg-tetris-z shadow-[0_0_8px_hsl(0_85%_55%/0.4)]',
  J: 'bg-tetris-j shadow-[0_0_8px_hsl(220_90%_55%/0.4)]',
  L: 'bg-tetris-l shadow-[0_0_8px_hsl(25_95%_55%/0.4)]',
  G: 'bg-muted-foreground/60',
};

export const NextPiece = ({ piece }: NextPieceProps) => {
  const { shape, type } = piece;

  return (
    <div className="stats-panel p-4">
      <h3 className="text-[10px] text-muted-foreground mb-3 text-center uppercase tracking-widest font-semibold">Next</h3>
      <div className="flex items-center justify-center min-h-[72px]">
        <div 
          className="grid gap-[3px]"
          style={{ 
            gridTemplateColumns: `repeat(${shape[0].length}, 16px)`,
          }}
        >
          {shape.flat().map((cell, index) => (
            <div
              key={index}
              className={cn(
                'w-4 h-4 rounded-[3px] transition-all',
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

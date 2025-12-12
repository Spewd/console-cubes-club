import { Piece, TetrisBlock } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface NextPieceProps {
  piece: Piece;
}

const BLOCK_COLORS: Record<Exclude<TetrisBlock, null>, string> = {
  I: 'bg-tetris-i shadow-[0_0_8px_hsl(185_100%_55%)]',
  O: 'bg-tetris-o shadow-[0_0_8px_hsl(50_100%_55%)]',
  T: 'bg-tetris-t shadow-[0_0_8px_hsl(290_100%_65%)]',
  S: 'bg-tetris-s shadow-[0_0_8px_hsl(140_100%_50%)]',
  Z: 'bg-tetris-z shadow-[0_0_8px_hsl(0_100%_55%)]',
  J: 'bg-tetris-j shadow-[0_0_8px_hsl(225_100%_60%)]',
  L: 'bg-tetris-l shadow-[0_0_8px_hsl(35_100%_55%)]',
};

export const NextPiece = ({ piece }: NextPieceProps) => {
  const { shape, type } = piece;

  return (
    <div className="stats-panel-accent p-3 rounded-sm">
      <h3 className="font-arcade text-[10px] text-muted-foreground tracking-wider mb-3 text-center">NEXT</h3>
      <div className="flex items-center justify-center min-h-[64px]">
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
                'w-[14px] h-[14px] rounded-[1px]',
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

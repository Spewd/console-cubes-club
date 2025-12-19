import { Piece, TetrisBlock } from '@/hooks/useTetris';
import { cn } from '@/lib/utils';

interface HoldPieceProps {
  piece: Piece | null;
  canHold: boolean;
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

export const HoldPiece = ({ piece, canHold }: HoldPieceProps) => {
  return (
    <div className={cn(
      "stats-panel p-4 transition-all duration-200",
      !canHold && "opacity-40 scale-[0.98]"
    )}>
      <h3 className="text-[10px] text-muted-foreground mb-3 text-center uppercase tracking-widest font-semibold">Hold</h3>
      <div className="flex items-center justify-center min-h-[72px]">
        {piece && piece.type ? (
          <div 
            className="grid gap-[3px] animate-scale-in"
            style={{ 
              gridTemplateColumns: `repeat(${piece.shape[0].length}, 16px)`,
            }}
          >
            {piece.shape.flat().map((cell, index) => (
              <div
                key={index}
                className={cn(
                  'w-4 h-4 rounded-[3px] transition-all',
                  cell && piece.type 
                    ? `${BLOCK_COLORS[piece.type]} tetris-block` 
                    : 'bg-transparent'
                )}
              />
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground/30 text-xs font-medium">—</div>
        )}
      </div>
    </div>
  );
};
